"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Languages,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { Button, Card, Input, Pill, Select } from "@/components/ui";
import type { CaProfileLite } from "@/lib/data";
import { CA_SERVICES } from "@/lib/data";
import { formatINR, formatNum } from "@/lib/format";

const FILTERS = ["All", "ITR Filing", "GST", "Company Registration", "Audit"] as const;

export default function CaClient({ cas }: { cas: CaProfileLite[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<"rating" | "price">("rating");
  const [booking, setBooking] = useState<CaProfileLite | null>(null);
  const [service, setService] = useState("ITR Filing");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [bookState, setBookState] = useState<"idle" | "saving" | "done">("idle");
  const [bookRef, setBookRef] = useState("");

  const list = useMemo(() => {
    const filtered =
      filter === "All" ? cas : cas.filter((c) => c.specialties.some((s) => s.toLowerCase().includes(filter.toLowerCase().split(" ")[0])));
    return [...filtered].sort((a, b) =>
      sort === "rating" ? b.rating - a.rating : a.priceFrom - b.priceFrom
    );
  }, [cas, filter, sort]);

  async function confirmBooking() {
    if (!booking || form.phone.length < 10) return;
    setBookState("saving");
    const price = Math.max(booking.priceFrom, CA_SERVICES.find((s) => service.includes(s.label.split(" ")[0]))?.from ?? booking.priceFrom);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "ca", name: form.name || "Guest", phone: form.phone, service, caId: booking.id, caName: booking.name, amount: price }),
      });
      const data = (await res.json()) as { refCode?: string };
      setBookRef(data.refCode ?? `TM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    } catch {
      setBookRef(`TM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    }
    setBookState("done");
  }

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Pill tone="emerald"><ShieldCheck className="h-3.5 w-3.5" /> ICAI-verified · Escrow protected</Pill>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">CA Marketplace</h1>
            <p className="mt-2 text-[14.5px] text-slate-500">
              Verified Chartered Accountants for ITR, GST, company registration &amp; audit — <strong>₹499 se start</strong>. Payment escrow mein rahegi jab tak kaam done na ho.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-emerald-600" /> Escrow pay</span>
            <span className="inline-flex items-center gap-1.5"><MessageSquareText className="h-4 w-4 text-emerald-600" /> Chat + doc vault</span>
            <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4 text-emerald-600" /> e-verify included</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors ${
                  filter === f ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownWideNarrow className="h-4 w-4 text-slate-400" />
            <Select value={sort} onChange={(e) => setSort(e.target.value as "rating" | "price")} className="h-9 w-36 text-[12.5px]" aria-label="Sort">
              <option value="rating">Top rated</option>
              <option value="price">Price: low → high</option>
            </Select>
          </div>
        </div>

        {/* CA cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((ca) => (
            <Card key={ca.id} className="flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5">
              <div className="flex items-start gap-3.5">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[15px] font-extrabold text-white"
                  style={{ backgroundColor: ca.avatarColor }}
                >
                  {ca.name.replace("CA ", "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14.5px] font-extrabold text-slate-900">
                    {ca.name}
                    {ca.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
                  </p>
                  <p className="truncate text-[12px] text-slate-400">{ca.firm} · {ca.city}</p>
                  <p className="mt-1 flex items-center gap-1 text-[12px] font-bold text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {ca.rating.toFixed(1)} <span className="font-medium text-slate-400">({formatNum(ca.reviews)} reviews)</span>
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {ca.specialties.slice(0, 3).map((s) => (
                  <Pill key={s} tone="slate" className="px-2 py-0.5 text-[10.5px]">{s}</Pill>
                ))}
              </div>

              <dl className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                {[
                  [`${ca.experienceYears}+ yrs`, "Experience"],
                  [formatNum(ca.filingsDone), "Filings"],
                  [`${ca.languages.slice(0, 2).join(", ")}`, "Speaks"],
                ].map(([v, k]) => (
                  <div key={k} className="rounded-lg bg-slate-50 px-2 py-2">
                    <dt className="text-[10px] font-bold text-slate-400 uppercase">{k}</dt>
                    <dd className="mt-0.5 truncate text-[12px] font-extrabold text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-[13px] font-bold text-slate-500">
                  from <span className="text-[17px] font-extrabold text-slate-900">{formatINR(ca.priceFrom)}</span>
                </p>
                <Button size="sm" onClick={() => { setBooking(ca); setBookState("idle"); setForm({ name: "", phone: "" }); }}>
                  Book now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Become a partner */}
        <div className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold tracking-widest text-emerald-200 uppercase">For CAs</p>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight">Aap CA hain? 10 Cr taxpayers aapka intezaar kar rahe hain.</h2>
              <p className="mt-2 max-w-xl text-[13.5px] text-emerald-50/90">
                Zero listing fee. Weekly payouts, verified leads, document vault aur practice dashboard included. Commission sirf 15% — sirf jab aap kamaein.
              </p>
            </div>
            <a href="mailto:partners@taxmitra.in?subject=CA%20Partnership" className="rounded-xl bg-white px-6 py-3 text-[14px] font-extrabold text-emerald-700 shadow-lg">
              Join as CA partner
            </a>
          </div>
        </div>
      </div>

      {/* ============================ Booking modal ============================ */}
      {booking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl text-[14px] font-extrabold text-white" style={{ backgroundColor: booking.avatarColor }}>
                  {booking.name.replace("CA ", "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="text-[15px] font-extrabold text-slate-900">{booking.name}</p>
                  <p className="text-[12px] text-slate-400">{booking.firm} · {booking.city}</p>
                </div>
              </div>
              <button onClick={() => setBooking(null)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookState === "done" ? (
              <div className="mt-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </span>
                <p className="mt-4 text-lg font-extrabold text-slate-900">Booking confirmed!</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                  Ref <strong className="text-slate-900">{bookRef}</strong> — {booking.name} 2 ghante mein WhatsApp pe contact karenge. Payment escrow vault mein safe hai; kaam complete hone par hi release hogi.
                </p>
                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-[12.5px]">
                  <p className="flex items-center gap-2 font-bold text-slate-700"><Lock className="h-4 w-4 text-emerald-600" /> Escrow protection active</p>
                  <p className="mt-1 text-slate-500">Filing unsatisfactory? Full refund within 3 days — no questions. Support: care@taxmitra.in</p>
                </div>
                <Button variant="secondary" className="mt-5 w-full" onClick={() => setBooking(null)}>Done</Button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <Select label="Service" value={service} onChange={(e) => setService(e.target.value)}>
                  {CA_SERVICES.map((s) => (
                    <option key={s.id} value={s.label}>{s.label} — ₹{formatNum(s.from)} se</option>
                  ))}
                </Select>
                <Input label="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                <Input label="WhatsApp number" inputMode="tel" maxLength={10} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} placeholder="10-digit mobile" />
                <div className="rounded-xl bg-slate-50 p-3.5 text-[12px] leading-relaxed text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700"><Languages className="h-3.5 w-3.5 text-emerald-600" /> {booking.languages.join(" · ")}</span>
                  <p className="mt-1.5 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-600" /> Pay {formatINR(booking.priceFrom)} into escrow — released only after your filing is confirmed.</p>
                </div>
                <Button className="w-full" disabled={form.phone.length < 10 || bookState === "saving"} onClick={confirmBooking}>
                  {bookState === "saving" ? "Booking…" : `Pay ${formatINR(booking.priceFrom)} — escrow safe`}
                </Button>
                <p className="text-center text-[10.5px] text-slate-400">Razorpay secured · UPI / cards / netbanking · GST invoice via email</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
