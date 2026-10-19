import { NextResponse } from "next/server";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { nextGstDeadlines } from "@/lib/gst";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Schedules WhatsApp/SMS reminders: 7 days + 1 day before the due date. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { phone?: string; channel?: string; kind?: string };
    const phone = String(body.phone ?? "").replace(/\D/g, "").slice(-10);
    if (phone.length < 10) {
      return NextResponse.json({ ok: false, error: "Valid 10-digit mobile required." }, { status: 400 });
    }
    const kind = String(body.kind ?? "GSTR-3B").slice(0, 10);
    const channel = ["whatsapp", "sms"].includes(body.channel ?? "") ? String(body.channel) : "whatsapp";

    // Due date: next upcoming deadline of that kind (+ 31 Jul for ITR)
    let due: Date;
    if (kind === "ITR") {
      const now = new Date();
      due = new Date(now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear(), 6, 31);
    } else {
      due = nextGstDeadlines().find((d) => d.form === kind)?.due ?? new Date(Date.now() + 9 * 86_400_000);
    }

    const offsets = [7, 1];
    const dueStr = due.toISOString().slice(0, 10);
    let inserted = 0;
    try {
      for (const off of offsets) {
        const sendAt = new Date(due.getTime() - off * 86_400_000);
        sendAt.setHours(9, 30, 0, 0);
        await db.insert(reminders).values({ phone, channel, kind, dueDate: dueStr, sendAt });
        inserted++;
      }
    } catch {
      /* pre-migration */
    }

    return NextResponse.json({ ok: true, kind, dueDate: dueStr, scheduled: inserted, channel });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
