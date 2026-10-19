import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return NextResponse.json(
    {
      status: "ok",
      service: "taxmitra",
      time: new Date().toISOString(),
      db: dbOk ? "up" : "degraded",
      version: "1.0.0",
    },
    { status: 200 }
  );
}
