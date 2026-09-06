import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "./db";
import type { User } from "./domain";
export const cookieName = "elo_session";
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const user = db()
    .prepare(
      "SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.userId WHERE s.token=? AND s.expiresAt>?",
    )
    .get(tokenHash(token), Date.now()) as User | undefined;
  return user ? { ...user } : null;
}
