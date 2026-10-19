import type { Metadata } from "next";
import Link from "next/link";
import {
  BellRing,
  CalendarClock,
  Crown,
  FilePlus2,
  FileText,
  FolderLock,
  Gift,
  Landmark,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/db";
import { bookings, calculations, invoices } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import AuthCard from "./auth-card";
import { CopyButton, LogoutButton } from "./widgets";
import { Card, Pill } from "@/components/ui";
import { ScoreGauge } from "@/components/charts";
import { nextGstDeadlines, itrDeadline } from "@/lib/gst";
import { daysUntil, fmtDate, shortINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Tax Health Score, Deadlines & Vault",
  robots: { index: false, follow: true },
  description: "Your TaxMitra dashboard: tax health score, upcoming GST/ITR deadlines, saved calculations, document vault and referral earnings.",
};

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="light-grid bg-slate-50/60">
        <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">Aapka Tax Health Dashboard</h1>
            <p className="mt-2 text-[13.5px] text-slate-500">
              Score 0–100, deadlines, documents aur referral kamai — sab ek jagah. Sign in karein ya 30 second mein account banayein.
            </p>
          </div>
          <AuthCard />
          <p className="mt-4 text-center text-[11.5px] text-slate-400">
            Demo: <strong>demo@taxmitra.in</strong> / <strong>demo1234</strong> (seed ke baad available)
          </p>
        </div>
      </div>
    );
  }

  // ---- logged-in data ----
  let calcs: (typeof calculations.$inferSelect)[] = [];
  let invList: (typeof invoices.$inferSelect)[] = [];
  let bookingList: (typeof bookings.$inferSelect)[] = [];
  try {
    [calcs, invList, bookingList] = await Promise.all([
      db.select().from(calculations).where(eq(calculations.userId, user.id)).orderBy(desc(calculations.createdAt)).limit(6),
      db.select().from(invoices).where(eq(invoices.userId, user.id)).orderBy(desc(invoices.createdAt)).limit(5),
      db.select().from(bookings).where(eq(bookings.userPhone, user.phone ?? "—")).orderBy(desc(bookings.createdAt)).limit(3),
    ]);
  } catch {
    /* tables may not exist pre-migration */
  }

  const latestTax = calcs.find((c) => c.kind === "tax");
  const deductionsUsed = (() => {
    try {
      const inp = (latestTax?.inputs ?? {}) as Record<string, number>;
      return (inp.d80C ?? 0) + (inp.d80D ?? 0) + (inp.nps ?? 0) + (inp.hra ?? 0);
    } catch {
      return 0;
    }
  })();

  const score = Math.min(
    97,
    42 +
      (calcs.length > 0 ? 18 : 0) +
      (deductionsUsed >= 150_000 ? 14 : deductionsUsed > 0 ? 8 : 0) +
      (invList.length > 0 ? 10 : 0) +
      (bookingList.length > 0 ? 8 : 0) +
      (user.plan !== "free" ? 5 : 0)
  );

  const gstDeadlines = nextGstDeadlines().slice(0, 2);
  const itrDue = itrDeadline();
  const referralCode = `TM${user.id}${(user.email.charCodeAt(0) % 26 + 10).toString(36).toUpperCase()}X`;

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase">Namaste {user.name.split(" ")[0]},</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Aapka tax command center</h1>
          </div>
          <div className="flex items-center gap-2">
            {user.plan === "free" ? (
              <Link href="/premium" className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-[13px] font-extrabold text-slate-950 shadow-sm hover:bg-amber-400">
                <Crown className="h-4 w-4" /> Premium ₹499/yr
              </Link>
            ) : (
              <Pill tone="amber"><Crown className="h-3.5 w-3.5" /> {user.plan.toUpperCase()} plan</Pill>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {/* Score */}
          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-[12px] font-extrabold tracking-widest text-slate-500 uppercase">Tax Health Score</p>
            <ScoreGauge value={score} max={100} size={170} label="/ 100" sublabel={score >= 75 ? "Excellent" : score >= 55 ? "Good" : "Needs attention"} />
            <p className="mt-3 text-[12px] leading-snug text-slate-500">
              {score >= 75
                ? "Zabardast! Deductions optimized, filings on track."
                : deductionsUsed === 0
                  ? "80C/80D deductions add karo — score 20 points tak jump karega."
                  : "AIS sync ke liye Premium try karein — score aur behtar hoga."}
            </p>
          </Card>

          {/* Deadlines */}
          <Card className="p-6">
            <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-slate-500 uppercase">
              <CalendarClock className="h-4 w-4 text-amber-500" /> Upcoming deadlines
            </p>
            <div className="mt-4 space-y-3">
              {gstDeadlines.map((d, i) => {
                const left = daysUntil(d.due);
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
                    <div>
                      <p className="text-[13.5px] font-extrabold text-slate-900">{d.form}</p>
                      <p className="text-[11.5px] text-slate-400">{fmtDate(d.due)}</p>
                    </div>
                    <Pill tone={left <= 3 ? "rose" : left <= 7 ? "amber" : "emerald"}>{left}d left</Pill>
                  </div>
                );
              })}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
                <div>
                  <p className="text-[13.5px] font-extrabold text-slate-900">ITR (AY 2026-27)</p>
                  <p className="text-[11.5px] text-slate-400">{fmtDate(itrDue)}</p>
                </div>
                {daysUntil(itrDue) > 0 ? (
                  <Pill tone={daysUntil(itrDue) <= 7 ? "amber" : "slate"}>{daysUntil(itrDue)}d left</Pill>
                ) : (
                  <Pill tone="rose">Due passed — check status</Pill>
                )}
              </div>
            </div>
            <Link href="/gst" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700 hover:underline">
              <BellRing className="h-3.5 w-3.5" /> WhatsApp reminders set karein
            </Link>
          </Card>

          {/* Money snapshot */}
          <Card className="p-6">
            <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-slate-500 uppercase">
              <Receipt className="h-4 w-4 text-emerald-600" /> This FY snapshot
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-100">
                <p className="text-[10.5px] font-bold text-emerald-700 uppercase">Est. tax saved</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-700">
                  {latestTax ? shortINR(Number((latestTax.results as Record<string, number>)?.savings ?? 0)) : "₹0"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                <p className="text-[10.5px] font-bold text-slate-500 uppercase">Invoices</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{invList.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                <p className="text-[10.5px] font-bold text-slate-500 uppercase">Deductions used</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{shortINR(deductionsUsed)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
                <p className="text-[10.5px] font-bold text-slate-500 uppercase">CA bookings</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{bookingList.length}</p>
              </div>
            </div>
            {!latestTax && (
              <Link href="/tax-saver" className="mt-4 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-[13px] font-extrabold text-white hover:bg-emerald-700">
                Pehli calculation karein →
              </Link>
            )}
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {/* Saved calculations */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-slate-500 uppercase">
                <Landmark className="h-4 w-4 text-sky-600" /> Saved calculations
              </p>
              <Link href="/tax-saver" className="text-[12px] font-bold text-emerald-700 hover:underline">New +</Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {calcs.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-[13px] text-slate-400">
                  Tax Saver ya EMI calculator use karte hi aapki calculations yahan save hongi.
                </p>
              )}
              {calcs.map((c) => {
                const res = (c.results ?? {}) as Record<string, number>;
                const isTax = c.kind === "tax";
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-lg ${isTax ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"}`}>
                        {isTax ? <TrendingUp className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="text-[13px] font-extrabold text-slate-800 capitalize">{c.kind} calculation</p>
                        <p className="text-[11px] text-slate-400">{fmtDate(new Date(c.createdAt))}</p>
                      </div>
                    </div>
                    <p className="text-[13px] font-extrabold text-slate-900">
                      {isTax && res.savings !== undefined ? `saved ${shortINR(res.savings)}` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Vault + referrals */}
          <div className="space-y-5">
            <Card className="p-6">
              <p id="data" className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-slate-500 uppercase">
                <FolderLock className="h-4 w-4 text-violet-600" /> Document vault
              </p>
              <ul className="mt-3 space-y-2 text-[12.5px] font-medium text-slate-600">
                {invList.length > 0 ? (
                  invList.slice(0, 3).map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-400" /> {inv.invoiceNo}</span>
                      <span className="font-bold text-slate-800">{shortINR(inv.total)}</span>
                    </li>
                  ))
                ) : (
                  <li className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-slate-400">
                    Form 16, 26AS, AIS aur invoices yahan AES-256 encrypted rahenge.
                  </li>
                )}
              </ul>
              <Link href="/gst" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700 hover:underline">
                <FilePlus2 className="h-3.5 w-3.5" /> Invoice banayein
              </Link>
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                <p className="text-[11px] font-bold text-rose-700">DPDP 2023 — aapka data, aapka control</p>
                <p className="mt-1 text-[11px] leading-snug text-rose-600/90">
                  Data export ya permanent delete ke liye: <strong>privacy@taxmitra.in</strong> — 72h mein processed.
                </p>
              </div>
            </Card>

            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                <Gift className="h-4 w-4" /> Referral earnings
              </p>
              <p className="mt-2.5 text-[13px] text-slate-300">
                Har friend ke Premium join karne pe <strong className="text-white">₹100</strong>, CA booking pe <strong className="text-white">₹50</strong>.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white/10 px-3 py-2.5 text-center text-[14px] font-extrabold tracking-widest">{referralCode}</code>
                <CopyButton text={referralCode} />
              </div>
              <p className="mt-3 text-[11.5px] text-slate-500">Earnings: ₹0 · {user.plan === "free" ? "Premium members ke liye 2x rewards" : "2x rewards active"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
