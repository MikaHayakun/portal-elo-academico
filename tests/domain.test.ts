import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { personSchema, validDocument } from "../src/lib/domain";
import {
  db,
  savePerson,
  getPerson,
  listHistory,
  hashPassword,
  verifyPassword,
} from "../src/lib/db";
const folder = mkdtempSync(join(tmpdir(), "elo-unit-"));
process.env.DATABASE_PATH = join(folder, "test.sqlite");
after(() => {
  db().close();
  rmSync(folder, { recursive: true, force: true });
});
const valid = {
  type: "PF" as const,
  name: "Pessoa de Teste",
  document: "52998224725",
  email: "teste@example.test",
  phone: "",
  category: "Prestador" as const,
  status: "Ativo" as const,
  socialName: "",
  notes: "",
};
test("valida dígitos verificadores e rejeita documentos repetidos ou inválidos", () => {
  assert.equal(validDocument(valid.document, "PF"), true);
  assert.equal(validDocument("11222333000181", "PJ"), true);
  for (const v of ["11111111111", "52998224724", "abc", ""])
    assert.equal(validDocument(v, "PF"), false);
  assert.equal(validDocument("11222333000180", "PJ"), false);
});
test("normaliza documento e nome, restringe vínculo de PJ e valida e-mail", () => {
  assert.equal(
    personSchema.parse({
      ...valid,
      document: "529.982.247-25",
      name: "  Pessoa de Teste  ",
    }).document,
    valid.document,
  );
  assert.equal(
    personSchema.safeParse({ ...valid, email: "inválido" }).success,
    false,
  );
  assert.equal(
    personSchema.safeParse({
      ...valid,
      type: "PJ",
      document: "11222333000181",
      category: "Discente",
    }).success,
    false,
  );
});
test("persiste alterações com auditoria, rejeita duplicatas e impede sobrescrita concorrente", () => {
  const person = savePerson(valid, "Operador");
  assert.equal(getPerson(person.id)?.name, valid.name);
  assert.throws(() => savePerson(valid, "Operador"), /Já existe/);
  const updated = savePerson(
    { ...valid, phone: "(11) 90000-9999" },
    "Administrador",
    person.id,
    person.version,
  );
  assert.equal(updated.version, 2);
  assert.throws(
    () =>
      savePerson(
        { ...valid, phone: "(11) 90000-8888" },
        "Outro",
        person.id,
        person.version,
      ),
    /outra pessoa/,
  );
  assert.equal(getPerson(person.id)?.phone, "(11) 90000-9999");
  const history = listHistory(person.id);
  assert.equal(history.length, 2);
  assert.deepEqual(history[0].changes.phone, {
    before: "",
    after: "(11) 90000-9999",
  });
  savePerson(
    { ...valid, phone: "(11) 90000-9999" },
    "Administrador",
    person.id,
    2,
  );
  assert.equal(listHistory(person.id).length, 2);
});
test("armazena hash com salt e distingue senha inválida", () => {
  const first = hashPassword("uma-senha-de-teste");
  const second = hashPassword("uma-senha-de-teste");
  assert.notEqual(first, second);
  assert.equal(verifyPassword("uma-senha-de-teste", first), true);
  assert.equal(verifyPassword("outra-senha", first), false);
});
