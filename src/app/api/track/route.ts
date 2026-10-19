import { NextResponse } from "next/server";
import { db } from "@/db";
import { referrals, refEvents } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Affiliate / referral click tracking with UTM-ish internal ref codes. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; kind?: string; target?: string };
    const code = String(body.code ?? "unknown").slice(0, 40);
    const kind = String(body.kind ?? "click").slice(0, 20);
    const target = String(body.target ?? "").slice(0, 200);
    try {
      await db.insert(refEvents).values({ code, kind, target });
      await db
        .insert(referrals)
        .values({ code, partner: code.split("-")[1] ?? code, kind: "affiliate", target, clicks: 1 })
        .onConflictDoUpdate({ target: referrals.code, set: { clicks: sql`${referrals.clicks} + 1` } });
    } catch {
      /* analytics must never fail the user flow */
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
