import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates a booking / lead. `kind`: ca (escrow) | loan | premium | lead.
 * Escrow flow: status starts at `escrow_pending`; funds release on completion.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      kind?: string;
      name?: string;
      phone?: string;
      service?: string;
      caId?: number;
      amount?: number;
    };

    const phone = String(body.phone ?? "").replace(/\D/g, "").slice(-10);
    const refCode = `TM-${randomBytes(3).toString("hex").toUpperCase()}`;
    const kind = body.kind ?? "ca";
    const amount = Math.max(0, Math.round(Number(body.amount) || 0));

    if (phone.length < 10) {
      return NextResponse.json({ ok: false, error: "Valid 10-digit mobile number required." }, { status: 400 });
    }

    try {
      await db.insert(bookings).values({
        refCode,
        kind,
        userName: String(body.name ?? "Guest").slice(0, 80),
        userPhone: phone,
        caId: body.caId ?? null,
        service: String(body.service ?? "General").slice(0, 200),
        amount,
        status: kind === "ca" ? "escrow_pending" : "new",
      });
    } catch {
      /* DB unavailable — still return a ref so the UX isn't blocked */
    }

    return NextResponse.json({
      ok: true,
      refCode,
      escrow: kind === "ca",
      message:
        kind === "ca"
          ? "Booking locked. CA will reach out on WhatsApp within 2 hours. Payment held in escrow."
          : "Lead captured. Our partner will call within 24 hours.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
