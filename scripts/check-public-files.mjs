import { execFileSync } from "node:child_process";
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const blocked = files.filter(
  (file) =>
    /(^|\/)(data|\.tools|node_modules|\.next|test-results|playwright-report)\//.test(
      file,
    ) ||
    /\.(pdf|docx?|pptx?|sqlite(?:-\w+)?|db(?:-\w+)?|zip)$/i.test(file) ||
    (/(^|\/)\.env/.test(file) && file !== ".env.example"),
);
if (blocked.length) {
  console.error(
    "Arquivos locais ou materiais de origem não podem ser publicados:",
    blocked.join(", "),
  );
  process.exit(1);
}
console.log(
  `Publicação conferida: ${files.length} arquivos, sem PDFs, bancos locais ou arquivos de credenciais.`,
);
