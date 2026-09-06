import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  randomUUID,
  scryptSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { Person, PersonInput, Audit } from "./domain";

let connection: DatabaseSync | undefined;
export function db() {
  if (connection) return connection;
  const path = resolve(
    /* turbopackIgnore: true */ process.env.DATABASE_PATH || "data/elo.sqlite",
  );
  mkdirSync(dirname(path), { recursive: true });
  connection = new DatabaseSync(path);
  connection.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','operator')));
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id), expiresAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS login_attempts (email TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expiresAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('PF','PJ')), name TEXT NOT NULL, socialName TEXT NOT NULL DEFAULT '', document TEXT NOT NULL UNIQUE, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', category TEXT NOT NULL CHECK(category IN ('Discente','Docente','Administrativo','Prestador')), status TEXT NOT NULL CHECK(status IN ('Ativo','Inativo')), notes TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, personId TEXT NOT NULL REFERENCES people(id), actor TEXT NOT NULL, action TEXT NOT NULL, changes TEXT NOT NULL, createdAt TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_people_category ON people(category);
    CREATE INDEX IF NOT EXISTS idx_audit_person ON audit(personId, createdAt);
    PRAGMA user_version=1;`);
  return connection;
}
export function hashPassword(value: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}
export function verifyPassword(value: string, hash: string) {
  const [salt, key] = hash.split(":");
  return timingSafeEqual(Buffer.from(key, "hex"), scryptSync(value, salt, 64));
}
export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function getPerson(id: string) {
  return db().prepare("SELECT * FROM people WHERE id = ?").get(id) as
    Person | undefined;
}
export function savePerson(
  input: PersonInput,
  actor: string,
  id?: string,
  version?: number,
) {
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try {
    const existing = id ? getPerson(id) : undefined;
    if (id && !existing) throw new DomainError("Cadastro não encontrado.", 404);
    if (existing && existing.version !== version)
      throw new DomainError(
        "Este cadastro foi alterado por outra pessoa. Feche e abra a ficha novamente antes de editar.",
        409,
      );
    const duplicate = database
      .prepare("SELECT id FROM people WHERE document = ?")
      .get(input.document) as { id: string } | undefined;
    if (duplicate && duplicate.id !== id)
      throw new DomainError("Já existe um cadastro com este documento.", 409);
    const now = new Date().toISOString();
    const personId = id || randomUUID();
    const changes: Audit["changes"] = {};
    for (const key of Object.keys(input) as (keyof PersonInput)[])
      if (!existing || existing[key] !== input[key])
        changes[key] = { before: existing?.[key] || "", after: input[key] };
    if (existing && !Object.keys(changes).length) {
      database.exec("COMMIT");
      return existing;
    }
    const values = [
      input.type,
      input.name,
      input.socialName,
      input.document,
      input.email,
      input.phone,
      input.category,
      input.status,
      input.notes,
    ];
    if (existing)
      database
        .prepare(
          "UPDATE people SET type=?, name=?, socialName=?, document=?, email=?, phone=?, category=?, status=?, notes=?, version=version+1, updatedAt=? WHERE id=?",
        )
        .run(...values, now, personId);
    else
      database
        .prepare(
          "INSERT INTO people (type,name,socialName,document,email,phone,category,status,notes,updatedAt,createdAt,id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .run(...values, now, now, personId);
    database
      .prepare("INSERT INTO audit VALUES (?,?,?,?,?,?)")
      .run(
        randomUUID(),
        personId,
        actor,
        existing ? "Atualização" : "Cadastro",
        JSON.stringify(changes),
        now,
      );
    database.exec("COMMIT");
    return getPerson(personId)!;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
export function listHistory(personId?: string) {
  const where = personId ? "WHERE a.personId = ?" : "";
  const rows = db()
    .prepare(
      `SELECT a.*, p.name AS personName FROM audit a JOIN people p ON p.id = a.personId ${where} ORDER BY a.createdAt DESC, a.rowid DESC LIMIT 100`,
    )
    .all(...(personId ? [personId] : []));
  return rows.map((row) => ({
    ...row,
    changes: JSON.parse(row.changes as string),
  })) as Audit[];
}
