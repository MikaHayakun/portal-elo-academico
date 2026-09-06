import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, role = "admin") {
  await page.goto("/login");
  await page
    .getByLabel("E-mail institucional")
    .fill(role === "admin" ? "admin@elo.local" : "gustavo@elo.local");
  await page
    .getByLabel("Senha", { exact: true })
    .fill(role === "admin" ? "TesteElo!2026Admin" : "TesteElo!2026RH");
  await page.getByRole("button", { name: "Entrar no portal" }).click();
  await expect(
    page.getByRole("heading", { name: "Gestão de pessoas" }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
}
test("protege dados e rejeita login inválido e origem externa", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/people")).status()).toBe(401);
  await page.goto("/");
  await expect(page).toHaveURL(/login/);
  await page.getByLabel("E-mail institucional").fill("admin@elo.local");
  await page.getByLabel("Senha", { exact: true }).fill("incorreta");
  await page.getByRole("button", { name: "Entrar no portal" }).click();
  await expect(page.locator(".error-banner[role=alert]")).toContainText(
    "E-mail ou senha incorretos",
  );
  expect(
    (
      await request.post("/api/auth/login", {
        data: { email: "admin@elo.local", password: "TesteElo!2026Admin" },
        headers: { Origin: "https://outro.example" },
      })
    ).status(),
  ).toBe(403);
});
test("fluxo de trabalho do RH: filtra, edita, confirma persistência, audita e encerra sessão", async ({
  page,
}) => {
  await login(page, "operator");
  await page.getByLabel("Filtrar por vínculo").selectOption("Prestador");
  await page.getByLabel("Filtrar por tipo").selectOption("PF");
  await page.getByLabel("Buscar pessoas").fill("123.456.789-09");
  await page.getByRole("button", { name: /Abrir cadastro de Clara/ }).click();
  await expect(
    page.getByLabel("Situação do cadastro", { exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Telefone", { exact: true }).fill("(11) 90000-8888");
  await page.getByRole("button", { name: "Revisar dados" }).click();
  await page.getByRole("button", { name: "Confirmar e salvar" }).click();
  await expect(page.locator(".success-banner[role=status]")).toContainText(
    "Cadastro atualizado",
  );
  await page.reload();
  await page.getByLabel("Buscar pessoas").fill("Clara");
  await page.getByRole("button", { name: /Abrir cadastro de Clara/ }).click();
  await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue(
    "(11) 90000-8888",
  );
  await page
    .getByRole("button", { name: "Histórico", exact: true })
    .last()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Gustavo Ribeiro");
  await dialog.locator("summary").first().click();
  await expect(dialog).toContainText("(11) 90000-8888");
  await page.getByRole("button", { name: "Fechar cadastro" }).click();
  await page.getByRole("button", { name: "Sair do portal" }).click();
  await expect(page).toHaveURL(/login/);
  expect((await page.request.get("/api/people")).status()).toBe(401);
});
test("cadastro PJ, validação, duplicidade, inativação e busca vazia", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Novo cadastro" }).click();
  await page.getByLabel("Pessoa jurídica", { exact: true }).check();
  await page.getByLabel("Razão social").fill("Empresa de Teste E2E");
  await page.getByLabel("CNPJ numérico").fill("11111111111111");
  await page
    .getByLabel("E-mail", { exact: false })
    .fill("empresa@example.test");
  await page.getByRole("button", { name: "Revisar dados" }).click();
  await expect(page.locator(".error-banner[role=alert]")).toContainText(
    "Confira",
  );
  await page.getByLabel("CNPJ numérico").fill("11444777000161");
  await page.getByRole("button", { name: "Revisar dados" }).click();
  await page.getByRole("button", { name: "Confirmar e salvar" }).click();
  await expect(page.locator(".success-banner[role=status]")).toContainText(
    "Cadastro criado",
  );
  await page.getByLabel("Buscar pessoas").fill("Empresa de Teste E2E");
  await page.getByRole("button", { name: /Abrir cadastro de Empresa/ }).click();
  await page
    .getByLabel("Situação do cadastro", { exact: true })
    .selectOption("Inativo");
  await page.getByRole("button", { name: "Revisar dados" }).click();
  await page.getByRole("button", { name: "Confirmar e salvar" }).click();
  await expect(page.getByRole("table")).toContainText("Inativo");
  await page.getByRole("button", { name: "Novo cadastro" }).click();
  await page.getByLabel("Pessoa jurídica", { exact: true }).check();
  await page.getByLabel("Razão social").fill("Duplicada");
  await page.getByLabel("CNPJ numérico").fill("11444777000161");
  await page
    .getByLabel("E-mail", { exact: false })
    .fill("empresa@example.test");
  await page.getByRole("button", { name: "Revisar dados" }).click();
  await page.getByRole("button", { name: "Confirmar e salvar" }).click();
  await expect(page.locator(".error-banner[role=alert]")).toContainText(
    "Já existe",
  );
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Fechar cadastro" }).click();
  await page.getByLabel("Buscar pessoas").fill("nada-encontrado-xyz");
  await expect(
    page.getByRole("heading", { name: "Nenhum cadastro encontrado" }),
  ).toBeVisible();
});
test("cancelamento preserva dados, permissões no servidor e conflito de edição", async ({
  page,
}) => {
  await login(page, "operator");
  await page.getByRole("button", { name: /Abrir cadastro de Marina/ }).click();
  await page.getByLabel("Telefone", { exact: true }).fill("(11) 99999-0000");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Fechar cadastro" }).click();
  await page.getByRole("button", { name: /Abrir cadastro de Marina/ }).click();
  await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue(
    "(11) 90000-0101",
  );
  await page.getByRole("button", { name: "Fechar cadastro" }).click();
  const people = await (await page.request.get("/api/people?q=Marina")).json();
  const person = people.items[0];
  const options = {
    headers: { Origin: "http://127.0.0.1:3100" },
    data: { ...person, status: "Inativo" },
  };
  expect(
    (await page.request.put(`/api/people/${person.id}`, options)).status(),
  ).toBe(403);
  expect(
    (
      await page.request.put(`/api/people/${person.id}`, {
        ...options,
        data: { ...person, phone: "(11) 90000-0007" },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.put(`/api/people/${person.id}`, {
        ...options,
        data: { ...person, phone: "(11) 90000-0008" },
      })
    ).status(),
  ).toBe(409);
});
test("interface móvel, navegação e ausência de erros de JavaScript", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("button", { name: "Visão geral", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Uma visão de todos os elos." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("button", { name: "Guia do portal" }).click();
  await expect(
    page.getByRole("heading", { name: "Sobre este ambiente" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("acessibilidade automatizada nas telas principais", async ({ page }) => {
  await page.goto("/login");
  const loginResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    loginResults.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await login(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Novo cadastro" }).click();
  const formResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    formResults.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
