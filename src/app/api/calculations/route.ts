import { NextResponse } from "next/server";
import { db } from "@/db";
import { calculations } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Persists a calculator run (tax / emi / cibil / itr) for the dashboard history. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      kind?: string;
      inputs?: Record<string, unknown>;
      results?: Record<string, unknown>;
    };
    const kind = String(body.kind ?? "tax").slice(0, 20);
    const user = await getSessionUser();
    try {
      await db.insert(calculations).values({
        userId: user?.id ?? null,
        kind,
        inputs: body.inputs ?? {},
        results: body.results ?? {},
      });
    } catch {
      /* non-fatal */
    }
    return NextResponse.json({ ok: true, attached: Boolean(user) });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
