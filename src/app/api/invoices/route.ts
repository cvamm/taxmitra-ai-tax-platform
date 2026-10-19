import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { computeInvoiceTotals, type InvoiceItem } from "@/lib/gst";
import { getSessionUser } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(25);
    return NextResponse.json({ items: rows });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      invoiceNo?: string;
      sellerName?: string;
      sellerGstin?: string;
      sellerState?: string;
      buyerName?: string;
      buyerGstin?: string;
      buyerState?: string;
      items?: InvoiceItem[];
    };

    const items = (body.items ?? []).slice(0, 50).map((i) => ({
      name: String(i.name).slice(0, 120),
      hsn: i.hsn ? String(i.hsn).slice(0, 12) : "",
      qty: Math.max(0, Number(i.qty) || 0),
      rate: Math.max(0, Number(i.rate) || 0),
      gstRate: Number(i.gstRate) || 0,
    }));

    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "At least one item required." }, { status: 400 });
    }

    const sellerState = String(body.sellerState ?? "09").slice(0, 2);
    const buyerState = String(body.buyerState ?? sellerState).slice(0, 2);
    const totals = computeInvoiceTotals(items, sellerState, buyerState);
    const user = await getSessionUser();

    let id: number | null = null;
    try {
      const [row] = await db
        .insert(invoices)
        .values({
          userId: user?.id ?? null,
          invoiceNo: String(body.invoiceNo ?? `TM-${Date.now()}`).slice(0, 30),
          sellerName: String(body.sellerName ?? "").slice(0, 120),
          sellerGstin: body.sellerGstin ? String(body.sellerGstin).slice(0, 15) : null,
          sellerState,
          buyerName: String(body.buyerName ?? "Cash sale").slice(0, 120),
          buyerGstin: body.buyerGstin ? String(body.buyerGstin).slice(0, 15) : null,
          buyerState,
          items,
          subtotal: totals.subtotal,
          cgst: totals.cgst,
          sgst: totals.sgst,
          igst: totals.igst,
          total: totals.total,
        })
        .returning({ id: invoices.id });
      id = row?.id ?? null;
    } catch {
      /* persist best-effort */
    }

    return NextResponse.json({ ok: true, id, totals });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
