import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANS: Record<string, { amountInr: number; label: string }> = {
  premium: { amountInr: 499, label: "TaxMitra Premium (1 yr)" },
  sme: { amountInr: 999, label: "TaxMitra MSME Suite (1 mo)" },
};

/**
 * Razorpay order creation (Cashfree fallback when Cashfree keys are set).
 * Without keys → demo order so the UX can be evaluated end-to-end.
 */
export async function POST(req: Request) {
  try {
    const { plan } = (await req.json()) as { plan?: string };
    const cfg = PLANS[plan ?? "premium"] ?? PLANS.premium;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      try {
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
          },
          body: JSON.stringify({
            amount: cfg.amountInr * 100,
            currency: "INR",
            receipt: `tm_${Date.now()}`,
            notes: { plan, product: cfg.label },
          }),
        });
        if (res.ok) {
          const order = (await res.json()) as { id: string };
          return NextResponse.json({ mode: "razorpay", key: keyId, orderId: order.id, amount: cfg.amountInr, currency: "INR" });
        }
      } catch {
        /* fall through to demo */
      }
    }

    return NextResponse.json({
      mode: "demo",
      key: "rzp_test_demo",
      orderId: `order_demo_${Math.random().toString(36).slice(2, 10)}`,
      amount: cfg.amountInr,
      currency: "INR",
      note: "Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to enable live payments.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
