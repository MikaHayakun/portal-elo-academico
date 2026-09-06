import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, failure } from "@/lib/http";
export async function GET() {
  try {
    await requireUser();
    const counts = db()
      .prepare(
        "SELECT COUNT(*) AS total, COALESCE(SUM(status='Ativo'),0) AS active, COALESCE(SUM(type='PF'),0) AS individuals, COALESCE(SUM(type='PJ'),0) AS companies FROM people",
      )
      .get();
    const categories = db()
      .prepare(
        "SELECT category, COUNT(*) AS count FROM people GROUP BY category ORDER BY count DESC",
      )
      .all();
    return NextResponse.json({ ...counts, categories });
  } catch (error) {
    return failure(error);
  }
}
