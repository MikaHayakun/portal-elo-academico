import { spawnSync, spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const database = join(mkdtempSync(join(tmpdir(), "elo-e2e-")), "test.sqlite");
const env = {
  ...process.env,
  DATABASE_PATH: database,
  APP_ORIGIN: "http://127.0.0.1:3100",
  ELO_TEST: "1",
  ELO_ADMIN_PASSWORD: "TesteElo!2026Admin",
  ELO_OPERATOR_PASSWORD: "TesteElo!2026RH",
};
const setup = spawnSync("node", ["--import", "tsx", "scripts/setup.ts"], {
  env,
  stdio: "inherit",
});
if (setup.status !== 0) process.exit(1);
const server = spawn(
  "node",
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  { env, stdio: "inherit" },
);
for (const signal of ["SIGTERM", "SIGINT"] as const)
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code || 0));
