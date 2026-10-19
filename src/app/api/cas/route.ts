import { NextResponse } from "next/server";
import { db } from "@/db";
import { caProfiles } from "@/db/schema";
import { CA_PROFILES_STATIC } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(caProfiles);
    if (rows.length > 0) return NextResponse.json({ source: "db", items: rows });
  } catch {
    /* fall through to static */
  }
  return NextResponse.json({ source: "static", items: CA_PROFILES_STATIC });
}
