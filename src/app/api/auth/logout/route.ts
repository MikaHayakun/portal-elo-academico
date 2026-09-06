import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, tokenHash } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser, failure } from "@/lib/http";
export async function POST(request: Request) {
  try {
    await requireUser(request);
    const token = (await cookies()).get(cookieName)?.value;
    if (token)
      db().prepare("DELETE FROM sessions WHERE token=?").run(tokenHash(token));
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(cookieName);
    return response;
  } catch (error) {
    return failure(error);
  }
}
