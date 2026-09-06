import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

async function main() {
  mkdirSync("docs/images", { recursive: true });
  mkdirSync("test-results/demo-video", { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    recordVideo: {
      dir: "test-results/demo-video",
      size: { width: 1440, height: 960 },
    },
  });
  const auth = await context.request.post(
    "http://127.0.0.1:3100/api/auth/login",
    {
      headers: { Origin: "http://127.0.0.1:3100" },
      data: { email: "gustavo@elo.local", password: "TesteElo!2026RH" },
    },
  );
  if (!auth.ok())
    throw new Error(
      "Inicie scripts/test-server.ts antes de capturar a demonstração.",
    );
  const page = await context.newPage();
  const start = Date.now();
  const until = async (seconds: number) =>
    page.waitForTimeout(Math.max(0, seconds * 1000 - (Date.now() - start)));
  await page.goto("http://127.0.0.1:3100");
  await expect(page.getByRole("table")).toBeVisible();
  await page.screenshot({ path: "docs/images/pessoas.png", fullPage: true });
  await until(7);
  await page.getByLabel("Filtrar por vínculo").selectOption("Prestador");
  await page.getByLabel("Filtrar por tipo").selectOption("PF");
  await page
    .getByLabel("Buscar pessoas")
    .pressSequentially("Clara", { delay: 120 });
  await until(15);
  await page.getByRole("button", { name: /Abrir cadastro de Clara/ }).click();
  await page.getByLabel("Telefone", { exact: true }).fill("(11) 90000-2026");
  await until(25);
  await page.getByRole("button", { name: "Revisar dados" }).click();
  await page.screenshot({ path: "docs/images/revisao.png" });
  await until(33);
  await page.getByRole("button", { name: "Confirmar e salvar" }).click();
  await expect(page.getByRole("status")).toContainText("Cadastro atualizado");
  await until(39);
  await page.getByRole("button", { name: /Abrir cadastro de Clara/ }).click();
  await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue(
    "(11) 90000-2026",
  );
  await page
    .getByRole("button", { name: "Histórico", exact: true })
    .last()
    .click();
  await page.getByRole("dialog").locator("summary").first().click();
  await page.screenshot({ path: "docs/images/historico.png" });
  await until(48);
  await page.getByRole("button", { name: "Fechar cadastro" }).click();
  await page.getByRole("button", { name: "Visão geral", exact: true }).click();
  await until(55);
  const video = page.video()!;
  await context.close();
  const source = await video.path();
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await mobile.addCookies(
    await (async () => {
      await mobile.request.post("http://127.0.0.1:3100/api/auth/login", {
        headers: { Origin: "http://127.0.0.1:3100" },
        data: { email: "gustavo@elo.local", password: "TesteElo!2026RH" },
      });
      return mobile.cookies();
    })(),
  );
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3100");
  await expect(mobilePage.getByRole("table")).toBeVisible();
  await mobilePage.screenshot({
    path: "docs/images/mobile.png",
    fullPage: true,
  });
  await mobile.close();
  const loginPage = await browser.newPage({
    viewport: { width: 1440, height: 960 },
  });
  await loginPage.goto("http://127.0.0.1:3100/login");
  await loginPage.screenshot({ path: "docs/images/login.png" });
  await browser.close();
  writeFileSync(
    "docs/demo-legendas.srt",
    `1\n00:00:00,000 --> 00:00:07,000\nElo Acadêmico: cadastros centralizados para RH e secretaria.\n\n2\n00:00:07,000 --> 00:00:15,000\nGustavo, do RH, localiza uma prestadora por vínculo, tipo e nome.\n\n3\n00:00:15,000 --> 00:00:25,000\nA ficha permite consultar e atualizar os dados de contato.\n\n4\n00:00:25,000 --> 00:00:39,000\nRevisão antes de confirmar. A alteração é gravada no banco.\n\n5\n00:00:39,000 --> 00:00:48,000\nNova consulta e histórico: responsável, data e valores alterados.\n\n6\n00:00:48,000 --> 00:00:56,000\nNext.js + React + TypeScript + SQLite. Menos planilhas, mais conexão.\n`,
  );
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      source,
      "-vf",
      "subtitles=docs/demo-legendas.srt:force_style='FontName=DejaVu Sans,FontSize=16,PrimaryColour=&H00FFFFFF,OutlineColour=&H00362A4B,BorderStyle=3,Outline=8,MarginV=18'",
      "-c:v",
      "libx264",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-t",
      "58",
      "docs/demo-projeto.mp4",
    ],
    { stdio: "pipe" },
  );
  if (result.status !== 0)
    throw new Error(`FFmpeg falhou: ${result.stderr?.toString().slice(-1000)}`);
  console.log("Demonstração e screenshots criados em docs/.");
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
