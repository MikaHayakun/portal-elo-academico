import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db, DomainError, verifyPassword, hashPassword } from "@/lib/db";
import { cookieName, tokenHash } from "@/lib/auth";
import { failure, readJson } from "@/lib/http";
export const runtime = "nodejs";
const dummyHash = hashPassword(randomBytes(32).toString("hex"));
export async function POST(request: Request) {
  try {
    if (
      request.headers.get("origin") !==
      (process.env.APP_ORIGIN || new URL(request.url).origin)
    )
      throw new DomainError("Origem não permitida.", 403);
    const input = z
      .object({
        email: z
          .email()
          .max(160)
          .transform((v) => v.toLowerCase().trim()),
        password: z.string().min(1).max(200),
      })
      .parse(await readJson(request));
    const database = db();
    const now = Date.now();
    database.prepare("DELETE FROM sessions WHERE expiresAt <= ?").run(now);
    database
      .prepare("DELETE FROM login_attempts WHERE expiresAt <= ?")
      .run(now);
    const limit = database
      .prepare("SELECT attempts FROM login_attempts WHERE email=?")
      .get(input.email) as { attempts: number } | undefined;
    if (limit && limit.attempts >= 5)
      throw new DomainError(
        "Muitas tentativas. Tente novamente em 15 minutos.",
        429,
      );
    const user = database
      .prepare("SELECT * FROM users WHERE email=?")
      .get(input.email) as { id: string; password: string } | undefined;
    const valid = verifyPassword(input.password, user?.password || dummyHash);
    if (!user || !valid) {
      database
        .prepare(
          "INSERT INTO login_attempts VALUES (?,1,?) ON CONFLICT(email) DO UPDATE SET attempts=attempts+1",
        )
        .run(input.email, now + 15 * 60 * 1000);
      throw new DomainError("E-mail ou senha incorretos.", 401);
    }
    database
      .prepare("DELETE FROM login_attempts WHERE email=?")
      .run(input.email);
    const token = randomBytes(32).toString("hex");
    database
      .prepare("INSERT INTO sessions VALUES (?,?,?)")
      .run(tokenHash(token), user.id, now + 8 * 3600 * 1000);
    const response = NextResponse.json({ ok: true });
    const oldToken = request.headers
      .get("cookie")
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(`${cookieName}=`))
      ?.split("=")[1];
    if (oldToken)
      database
        .prepare("DELETE FROM sessions WHERE token=?")
        .run(tokenHash(oldToken));
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: (process.env.APP_ORIGIN || request.url).startsWith("https:"),
      path: "/",
      maxAge: 8 * 3600,
    });
    return response;
  } catch (error) {
    return failure(error);
  }
}
