import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { currentUser } from "./auth";
import { DomainError } from "./db";
export async function requireUser(request?: Request) {
  if (request) {
    const origin = request.headers.get("origin");
    const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
    if (origin !== expected)
      throw new DomainError("Origem da solicitação não permitida.", 403);
    if (!request.headers.get("content-type")?.includes("application/json"))
      throw new DomainError("Envie os dados no formato JSON.", 415);
  }
  const user = await currentUser();
  if (!user) throw new DomainError("Sua sessão expirou. Entre novamente.", 401);
  return user;
}
export async function readJson(request: Request) {
  const text = await request.text();
  if (text.length > 15000)
    throw new DomainError("Dados enviados excedem o limite.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new DomainError("Os dados enviados são inválidos.");
  }
}
export function failure(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: error.issues[0].message,
        fields: Object.fromEntries(
          error.issues.map((i) => [i.path[0], i.message]),
        ),
      },
      { status: 400 },
    );
  if (error instanceof DomainError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "Falha interna:",
    error instanceof Error ? error.name : "unknown",
  );
  return NextResponse.json(
    { error: "Não foi possível concluir a operação. Tente novamente." },
    { status: 500 },
  );
}
