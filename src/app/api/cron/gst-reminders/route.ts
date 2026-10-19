import { NextResponse } from "next/server";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { and, eq, lte } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily cron (vercel.json → 04:00 UTC = 09:30 IST).
 * Sends due WhatsApp/SMS reminders via the configured provider
 * (Interakt / Gupshup). Secure with CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided = req.headers.get("x-cron-secret") ?? url.searchParams.get("secret");
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron") ?? false;
  if (secret && !isVercelCron && provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let sent = 0;
  const failures: string[] = [];
  try {
    const due = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.status, "pending"), lte(reminders.sendAt, new Date())))
      .limit(500);

    for (const r of due) {
      try {
        await sendWhatsapp(r.phone, `Namaste! ${r.kind} ki due date ${r.dueDate} hai. Late fee se bachne ke liye aaj hi file karein — TaxMitra GST tool: https://taxmitra.in/gst`).catch(() => {});
        await db.update(reminders).set({ status: "sent" }).where(eq(reminders.id, r.id));
        sent++;
      } catch {
        failures.push(String(r.id));
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "db-unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, sent, failures: failures.length });
}

/** Interakt / Gupshup WhatsApp Business API — no-op unless WHATSAPP_API_KEY is set. */
async function sendWhatsapp(phone: string, message: string): Promise<void> {
  const key = process.env.WHATSAPP_API_KEY;
  if (!key) return; // provider not configured — mark sent in dry-run
  const endpoint = process.env.WHATSAPP_API_URL ?? "https://api.gupshup.io/wa/api/v1/msg";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: key },
    body: JSON.stringify({ channel: "whatsapp", destination: `91${phone}`, message }),
  });
  if (!res.ok) throw new Error(`whatsapp provider ${res.status}`);
}
