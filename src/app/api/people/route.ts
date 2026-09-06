import { NextResponse } from "next/server";
import { db, savePerson, DomainError } from "@/lib/db";
import { personSchema } from "@/lib/domain";
import { requireUser, failure, readJson } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireUser();
    const params = new URL(request.url).searchParams;
    const query = (params.get("q") || "").trim().slice(0, 120);
    const document = query.replace(/[.\-/\s]/g, "");
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    if (query) {
      conditions.push(
        "(instr(lower(name),lower(?))>0 OR instr(lower(socialName),lower(?))>0 OR instr(document,?)>0)",
      );
      values.push(query, query, document || query);
    }
    for (const key of ["type", "category", "status"]) {
      const value = params.get(key);
      if (value) {
        conditions.push(`${key}=?`);
        values.push(value);
      }
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const total = (
      db()
        .prepare(`SELECT COUNT(*) AS count FROM people ${where}`)
        .get(...values) as { count: number }
    ).count;
    const pages = Math.max(1, Math.ceil(total / 8));
    const page = Math.min(
      pages,
      Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
    );
    const items = db()
      .prepare(
        `SELECT * FROM people ${where} ORDER BY updatedAt DESC, name ASC LIMIT 8 OFFSET ?`,
      )
      .all(...values, (page - 1) * 8);
    return NextResponse.json({ items, total, page, pages });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const input = personSchema.parse(await readJson(request));
    if (user.role !== "admin" && input.status !== "Ativo")
      throw new DomainError(
        "Somente a administração pode criar cadastros inativos.",
        403,
      );
    return NextResponse.json(savePerson(input, user.name), { status: 201 });
  } catch (error) {
    return failure(error);
  }
}
