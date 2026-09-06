import { NextResponse } from "next/server";
import { listHistory } from "@/lib/db";
import { requireUser, failure } from "@/lib/http";
export async function GET() {
  try {
    await requireUser();
    return NextResponse.json(listHistory());
  } catch (error) {
    return failure(error);
  }
}
