import { NextResponse } from "next/server";
import { z } from "zod";
import { getPerson, savePerson, listHistory, DomainError } from "@/lib/db";
import { personSchema } from "@/lib/domain";
import { requireUser, failure, readJson } from "@/lib/http";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await requireUser();
    const { id } = await context.params;
    const person = getPerson(id);
    if (!person) throw new DomainError("Cadastro não encontrado.", 404);
    return NextResponse.json({ person, history: listHistory(id) });
  } catch (error) {
    return failure(error);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const body = await readJson(request);
    const input = personSchema.parse(body);
    const version = z.number().int().positive().parse(body.version);
    const current = getPerson(id);
    if (current && current.status !== input.status && user.role !== "admin")
      throw new DomainError(
        "Somente a administração pode alterar a situação do cadastro.",
        403,
      );
    return NextResponse.json(savePerson(input, user.name, id, version));
  } catch (error) {
    return failure(error);
  }
}
