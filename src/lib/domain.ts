import { z } from "zod";

export const categories = [
  "Discente",
  "Docente",
  "Administrativo",
  "Prestador",
] as const;
export const personSchema = z
  .object({
    type: z.enum(["PF", "PJ"]),
    name: z.string().trim().min(3, "Informe pelo menos 3 caracteres.").max(120),
    socialName: z.string().trim().max(120).default(""),
    document: z.string().transform((v) => v.replace(/[.\-/\s]/g, "")),
    email: z.email("Informe um e-mail válido.").max(160),
    phone: z
      .string()
      .trim()
      .max(25)
      .refine(
        (v) => !v || /^[+\d\s()-]{8,25}$/.test(v),
        "Informe um telefone válido.",
      ),
    category: z.enum(categories),
    status: z.enum(["Ativo", "Inativo"]),
    notes: z.string().trim().max(1000).default(""),
  })
  .superRefine((v, ctx) => {
    if (!validDocument(v.document, v.type))
      ctx.addIssue({
        code: "custom",
        path: ["document"],
        message: `Informe um ${v.type === "PF" ? "CPF" : "CNPJ"} válido.`,
      });
    if (v.type === "PJ" && v.category !== "Prestador")
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "Pessoa jurídica deve ter vínculo de prestador.",
      });
    if (v.type === "PJ" && v.socialName)
      ctx.addIssue({
        code: "custom",
        path: ["socialName"],
        message: "O nome social aplica-se somente a pessoas físicas.",
      });
  });

export type PersonInput = z.infer<typeof personSchema>;
export type Person = PersonInput & {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator";
};
export type Audit = {
  id: string;
  personId: string;
  personName: string;
  actor: string;
  action: string;
  changes: Record<string, { before: string; after: string }>;
  createdAt: string;
};
export const fieldLabels: Record<string, string> = {
  type: "Tipo",
  name: "Nome / razão social",
  socialName: "Nome social",
  document: "Documento",
  email: "E-mail",
  phone: "Telefone",
  category: "Vínculo",
  status: "Situação",
  notes: "Observações",
};

export function validDocument(value: string, type: "PF" | "PJ") {
  if (!/^\d+$/.test(value) || /^(\d)\1+$/.test(value)) return false;
  const digits = [...value].map(Number);
  if (type === "PF") {
    if (value.length !== 11) return false;
    for (let n = 9; n <= 10; n++) {
      const sum = digits
        .slice(0, n)
        .reduce((s, v, i) => s + v * (n + 1 - i), 0);
      const check = (sum * 10) % 11;
      if ((check === 10 ? 0 : check) !== digits[n]) return false;
    }
  } else {
    if (value.length !== 14) return false;
    for (let n = 12; n <= 13; n++) {
      const weights =
        n === 12
          ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
          : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const remainder =
        digits.slice(0, n).reduce((s, v, i) => s + v * weights[i], 0) % 11;
      if ((remainder < 2 ? 0 : 11 - remainder) !== digits[n]) return false;
    }
  }
  return true;
}
export function formatDocument(value: string) {
  return value.length === 11
    ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}
