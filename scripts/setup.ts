import {
  existsSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
} from "node:fs";
import { randomBytes, randomUUID } from "node:crypto";
import { db, hashPassword, savePerson } from "../src/lib/db";
import { personSchema } from "../src/lib/domain";

const envFile = ".env.local";
if (existsSync(envFile)) process.loadEnvFile(envFile);
const adminPassword =
  process.env.ELO_ADMIN_PASSWORD || randomBytes(18).toString("base64url");
const operatorPassword =
  process.env.ELO_OPERATOR_PASSWORD || randomBytes(18).toString("base64url");
if (!existsSync(envFile) && !process.env.ELO_TEST) {
  writeFileSync(
    envFile,
    `DATABASE_PATH=./data/elo.sqlite\nAPP_ORIGIN=http://localhost:3000\nELO_ADMIN_PASSWORD=${adminPassword}\nELO_OPERATOR_PASSWORD=${operatorPassword}\n`,
    { mode: 0o600 },
  );
}
if (!process.env.ELO_TEST) {
  const content = readFileSync(envFile, "utf8");
  const additions = [];
  if (!/^ELO_ADMIN_PASSWORD=.+$/m.test(content))
    additions.push(`ELO_ADMIN_PASSWORD=${adminPassword}`);
  if (!/^ELO_OPERATOR_PASSWORD=.+$/m.test(content))
    additions.push(`ELO_OPERATOR_PASSWORD=${operatorPassword}`);
  if (additions.length) appendFileSync(envFile, `\n${additions.join("\n")}\n`);
}
const database = db();
for (const [name, email, role, password] of [
  ["Administração Elo", "admin@elo.local", "admin", adminPassword],
  ["Gustavo Ribeiro", "gustavo@elo.local", "operator", operatorPassword],
]) {
  if (!database.prepare("SELECT id FROM users WHERE email=?").get(email))
    database
      .prepare("INSERT INTO users VALUES (?,?,?,?,?)")
      .run(randomUUID(), name, email, hashPassword(password), role);
}
const seeds = [
  {
    name: "Marina Costa — Demonstração",
    document: "52998224725",
    category: "Discente",
    type: "PF",
    email: "marina@example.test",
    phone: "(11) 90000-0101",
  },
  {
    name: "Rafael Almeida — Demonstração",
    document: "11144477735",
    category: "Docente",
    type: "PF",
    email: "rafael@example.test",
    phone: "(11) 90000-0102",
  },
  {
    name: "Clara Mendes — Demonstração",
    document: "12345678909",
    category: "Prestador",
    type: "PF",
    email: "clara@example.test",
    phone: "(11) 90000-0103",
  },
  {
    name: "Horizonte Serviços — Demonstração",
    document: "11222333000181",
    category: "Prestador",
    type: "PJ",
    email: "contato@example.test",
    phone: "(11) 90000-0104",
  },
  {
    name: "Lucas Oliveira — Demonstração",
    document: "98765432100",
    category: "Administrativo",
    type: "PF",
    email: "lucas@example.test",
    phone: "(11) 90000-0105",
  },
];
for (const [index, item] of seeds.entries()) {
  if (
    !database
      .prepare("SELECT id FROM people WHERE document=?")
      .get(item.document)
  )
    savePerson(
      personSchema.parse({
        ...item,
        status: index === 4 ? "Inativo" : "Ativo",
        socialName: "",
        notes:
          "Registro fictício para demonstração acadêmica. Não representa uma pessoa ou empresa real.",
      }),
      "Carga de demonstração",
    );
}
console.log("Banco preparado. Dados existentes foram preservados.");
console.log(
  "Contas: admin@elo.local (administração) e gustavo@elo.local (RH).",
);
console.log(
  "As senhas estão em .env.local: ELO_ADMIN_PASSWORD e ELO_OPERATOR_PASSWORD. Não publique esse arquivo.",
);
