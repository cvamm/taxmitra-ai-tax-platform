"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Crown,
  Loader2,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";

const MATRIX: { feature: string; free: string | boolean; premium: string | boolean; sme: string | boolean }[] = [
  { feature: "Tax & EMI calculators (offline PWA)", free: true, premium: true, sme: true },
  { feature: "GST invoices per month", free: "50", premium: "Unlimited", sme: "Unlimited" },
  { feature: "AI ITR chat helper", free: true, premium: true, sme: true },
  { feature: "AIS / Form 26AS auto-sync", free: false, premium: true, sme: true },
  { feature: "e-Signature on invoices", free: false, premium: true, sme: true },
  { feature: "Priority CA chat (<2 hr response)", free: false, premium: true, sme: true },
  { feature: "Advanced tax planning reports", free: false, premium: true, sme: true },
  { feature: "Multi-business / multi-GSTIN profiles", free: false, premium: "2", sme: "10" },
  { feature: "Multi-user access", free: false, premium: false, sme: "5 users" },
  { feature: "Tally / Zoho Books sync", free: false, premium: false, sme: true },
  { feature: "Payroll + inventory", free: false, premium: false, sme: true },
  { feature: "ITC reconciliation engine", free: false, premium: false, sme: true },
  { feature: "Dedicated CA relationship manager", free: false, premium: false, sme: true },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-emerald-600" />;
  if (v === false) return <X className="mx-auto h-4 w-4 text-slate-300" />;
  return <span className="text-[12.5px] font-bold text-slate-700">{v}</span>;
}

const PLANS = [
  { id: "premium", name: "Premium", price: 499, per: "/year", cta: "Upgrade — ₹499/yr", tag: "For individuals & freelancers", icon: Crown },
  { id: "sme", name: "MSME Suite", price: 999, per: "/month", cta: "Start MSME Suite", tag: "For shops & growing businesses", icon: Building2, anchor: "sme" },
];

export default function PremiumClient() {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<{ plan: string; orderId?: string } | null>(null);

  async function checkout(plan: string) {
    setBusy(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as { mode?: string; orderId?: string };
      if (!res.ok || data.orderId === undefined) {
        throw new Error("checkout unavailable");
      }
      // Razorpay checkout would open here with data.key + data.orderId
      setDone({ plan, orderId: data.orderId });
    } catch {
      setDone({ plan });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 lg:pt-16">
        <div className="text-center">
          <Pill tone="amber"><Crown className="h-3.5 w-3.5" /> TaxMitra Premium</Pill>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[2.75rem] sm:leading-tight">
            Ek movie ticket se bhi sasta. <span className="text-emerald-600">Poore saal ka tax saathi.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] text-slate-500">
            ₹499/yr — AIS auto-sync, unlimited invoices, priority CA aur advanced planning. 7-day refund, no questions.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.id} id={p.anchor} className={`relative rounded-3xl p-7 ${p.id === "premium" ? "bg-slate-950 text-white shadow-2xl shadow-emerald-950/30" : "border border-slate-200 bg-white"}`}>
              {p.id === "premium" && <Pill tone="amber" className="absolute -top-3 left-6">Save 60% vs monthly</Pill>}
              <div className="flex items-center justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${p.id === "premium" ? "bg-amber-400/15 text-amber-400" : "bg-emerald-100 text-emerald-700"}`}>
                  <p.icon className="h-6 w-6" />
                </span>
                <span className={`text-[12px] font-bold ${p.id === "premium" ? "text-slate-400" : "text-slate-400"}`}>{p.tag}</span>
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-5xl font-extrabold tracking-tight">₹{p.price}</span>
                <span className={`text-[14px] font-semibold ${p.id === "premium" ? "text-slate-400" : "text-slate-400"}`}>{p.per}</span>
              </div>
              {done?.plan === p.id ? (
                <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-emerald-500/15 p-4 ring-1 ring-emerald-400/30">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <p className={`text-[13.5px] font-extrabold ${p.id === "premium" ? "text-emerald-300" : "text-emerald-700"}`}>
                      Demo order created{done.orderId ? ` — ${done.orderId}` : ""}
                    </p>
                    <p className={`text-[12px] ${p.id === "premium" ? "text-slate-300" : "text-slate-500"}`}>
                      {done.orderId
                        ? "Yeh demo order hai. Razorpay production keys set karte hi live payments (UPI/cards) yahan open honge. Welcome aboard!"
                        : "Razorpay demo mode live nahi hai (RAZORPAY keys missing) — payment integration ready hai, bas keys set karein."}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  variant={p.id === "premium" ? "amber" : "primary"}
                  size="lg"
                  className="mt-6 w-full"
                  disabled={busy !== null}
                  onClick={() => checkout(p.id)}
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.cta}
                </Button>
              )}
              <ul className={`mt-6 space-y-2.5 text-[13px] font-medium ${p.id === "premium" ? "text-slate-300" : "text-slate-600"}`}>
                {(p.id === "premium"
                  ? ["AIS / 26AS auto-sync & mismatch alerts", "Unlimited GST invoices + e-sign", "Priority CA chat — <2 hr response", "Advanced regime planning reports", "Multi-business profiles (2)"]
                  : ["Everything in Premium", "Multi-user (5) + multi-GSTIN (10)", "Tally / Zoho Books sync", "Payroll, inventory & ITC reconciliation", "Dedicated CA relationship manager"]
                ).map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.id === "premium" ? "text-emerald-400" : "text-emerald-600"}`} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison matrix */}
        <Card className="mt-12 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-[16px] font-extrabold tracking-tight text-slate-900">Free vs Premium vs MSME Suite</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] tracking-widest text-slate-400 uppercase">
                  <th className="px-6 py-3 text-left font-bold">Feature</th>
                  <th className="px-4 py-3 text-center font-bold">Free</th>
                  <th className="px-4 py-3 text-center font-bold text-emerald-600">Premium ₹499/yr</th>
                  <th className="px-4 py-3 text-center font-bold">MSME ₹999/mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MATRIX.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-3 text-[13px] font-semibold text-slate-700">{row.feature}</td>
                    <td className="px-4 py-3 text-center"><Cell v={row.free} /></td>
                    <td className="bg-emerald-50/40 px-4 py-3 text-center"><Cell v={row.premium} /></td>
                    <td className="px-4 py-3 text-center"><Cell v={row.sme} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Trust strip */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Lock, t: "Razorpay secured payments", d: "UPI, cards, netbanking, wallets. Cashfree fallback ready." },
            { icon: ShieldCheck, t: "7-day full refund", d: "No questions, no forms — WhatsApp pe ek message kaafi." },
            { icon: MessageSquareText, t: "Humans on WhatsApp", d: "Support in Hindi, English & 6 regional languages." },
          ].map((x) => (
            <Card key={x.t} className="p-5">
              <x.icon className="h-5 w-5 text-emerald-600" />
              <p className="mt-2.5 text-[13.5px] font-extrabold text-slate-900">{x.t}</p>
              <p className="mt-1 text-[12px] leading-snug text-slate-500">{x.d}</p>
            </Card>
          ))}
        </div>

        {/* Legal stubs */}
        <div className="mt-12 space-y-6 text-[12.5px] leading-relaxed text-slate-500">
          <div id="privacy">
            <h3 className="text-[13.5px] font-extrabold text-slate-800">Privacy & DPDP 2023</h3>
            <p className="mt-1.5">We collect only what is needed to deliver the service, with explicit consent. Financial documents are encrypted with AES-256 at rest and TLS 1.3 in transit. You can export or permanently delete your data anytime from Dashboard → Data, or via privacy@taxmitra.in (processed within 72 hours). Anonymised, aggregated MSME credit insights may be shared with lending partners only with separate opt-in consent.</p>
          </div>
          <div id="terms">
            <h3 className="text-[13.5px] font-extrabold text-slate-800">Terms of Use</h3>
            <p className="mt-1.5">TaxMitra is a software platform, not a tax advisor or financial institution. Calculations are estimates based on published FY 2025-26 rules. CA services are delivered by independent ICAI members via escrow-protected bookings. Partner offers (loans, investments, insurance) are subject to the partner&apos;s own terms; we may earn referral fees.</p>
          </div>
          <div id="refunds">
            <h3 className="text-[13.5px] font-extrabold text-slate-800">Refund Policy</h3>
            <p className="mt-1.5">Premium/MSME subscriptions: full refund within 7 days. CA marketplace: escrow released only after confirmed completion; disputes resolved within 3 business days with full refund where service was not delivered.</p>
          </div>
        </div>

        <p className="mt-8 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-900">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          Launch offer: pehle 10,000 Premium users ko lifetime price-lock ₹499/yr. <Zap className="inline h-3.5 w-3.5" /> Prices + taxes apply.
        </p>
      </div>
    </div>
  );
}
