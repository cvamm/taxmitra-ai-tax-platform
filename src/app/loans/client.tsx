"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  CheckCircle2,
  Download,
  Gauge,
  Home,
  Info,
  TrendingDown,
} from "lucide-react";
import { Button, Card, Input, Pill, PartnerLink, Select } from "@/components/ui";
import CurrencyInput from "@/components/currency-input";
import type { AmortYear } from "@/lib/loans";
import { BalanceChart, EmiDonut, ScoreGauge } from "@/components/charts";
import {
  amortization,
  calcEmi,
  estimateCibil,
  homeLoanTaxBenefit,
  prepaymentSavings,
  LOAN_TYPES,
  type LoanTypeId,
} from "@/lib/loans";
import { formatINR, formatNum, shortINR } from "@/lib/format";
import type { LoanProductLite } from "@/lib/data";

const TYPE_ICONS: Record<string, string> = {
  home: "Home Loan",
  car: "Car Loan",
  personal: "Personal Loan",
  education: "Education Loan",
};

export default function LoansClient({ products }: { products: LoanProductLite[] }) {
  const [type, setType] = useState<LoanTypeId>("home");
  const typeCfg = LOAN_TYPES.find((t) => t.id === type)!;

  const [amount, setAmount] = useState<number>(typeCfg.defaultAmount);
  const [rate, setRate] = useState<number>(typeCfg.defaultRate);
  const [years, setYears] = useState<number>(typeCfg.defaultYears);

  const months = Math.round(years * 12);
  const bd = useMemo(() => calcEmi(amount, rate, months), [amount, rate, months]);
  const schedule = useMemo(() => amortization(amount, rate, months), [amount, rate, months]);

  const firstYear = schedule[0];
  const taxBenefit = useMemo(
    () =>
      type === "home" && firstYear
        ? homeLoanTaxBenefit(firstYear.principalPaid, firstYear.interestPaid, 0.3)
        : null,
    [type, firstYear, rate]
  );

  /* Prepayment */
  const [prepayAmt, setPrepayAmt] = useState(0);
  const [prepayAt, setPrepayAt] = useState(3);
  const prepay = useMemo(
    () => (prepayAmt > 0 ? prepaymentSavings(amount, rate, months, prepayAmt, Math.min(prepayAt * 12, months - 1)) : null),
    [amount, rate, months, prepayAmt, prepayAt]
  );

  /* Eligibility lead form */
  const [lead, setLead] = useState({ name: "", phone: "", income: "" });
  const [leadState, setLeadState] = useState<"idle" | "saving" | "done">("idle");

  /* CIBIL quiz */
  const [cibilQ, setCibilQ] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const cibil = useMemo(
    () =>
      estimateCibil({
        paymentMisses: cibilQ[0],
        utilization: cibilQ[1],
        creditAge: cibilQ[2],
        creditMix: cibilQ[3],
        enquiries: cibilQ[4],
      }),
    [cibilQ]
  );

  const bankProducts = useMemo(
    () => products.filter((p) => p.type === type).sort((a, b) => a.rateMin - b.rateMin),
    [products, type]
  );

  function switchType(t: LoanTypeId) {
    const cfg = LOAN_TYPES.find((x) => x.id === t)!;
    setType(t);
    setAmount(cfg.defaultAmount);
    setRate(cfg.defaultRate);
    setYears(cfg.defaultYears);
  }

  function downloadCsv() {
    const header = "Year,Principal Paid,Interest Paid,Outstanding Balance\n";
    const body = schedule
      .map((r) => `${r.year},${r.principalPaid},${r.interestPaid},${r.balance}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amortization-${type}-${amount}-${months}m.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function submitLead() {
    setLeadState("saving");
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "loan",
          service: `${TYPE_ICONS[type]} eligibility — ${shortINR(amount)} @ ${rate}% (${months}m)`,
          name: lead.name || "Guest",
          phone: lead.phone || "-",
          amount: 0,
        }),
      });
    } catch {}
    setLeadState("done");
  }

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="max-w-2xl">
          <Pill tone="sky">15+ bank products · Live rates</Pill>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Loan Comparison + EMI Calculator
          </h1>
          <p className="mt-2 text-[14.5px] text-slate-500">
            EMI, total interest, amortization schedule aur bank-wise real rates — sab ek jagah. Home loan pe tax benefit bhi dekhein.
          </p>
        </div>

        {/* Type pills */}
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {LOAN_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => switchType(t.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                type === t.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ===================== Inputs + EMI ===================== */}
          <div className="space-y-6">
            <Card className="p-5">
              <div className="space-y-6">
                <CurrencyInput
                  label="Loan amount"
                  value={amount}
                  onChange={setAmount}
                  min={50_000}
                  max={typeCfg.maxAmount}
                  step={50_000}
                  chips={[
                    { label: "₹5L", value: 500_000 },
                    { label: "₹25L", value: 2_500_000 },
                    { label: "₹50L", value: 5_000_000 },
                  ]}
                />
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="text-[13px] font-semibold text-slate-600">Interest rate (% p.a.)</label>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[15px] font-extrabold text-slate-900 tabular-nums">{rate.toFixed(2)}%</span>
                  </div>
                  <input type="range" min={7} max={28} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="range-brand mt-2.5 w-full" aria-label="Interest rate" />
                  <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400"><span>7%</span><span>28%</span></div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="text-[13px] font-semibold text-slate-600">Tenure</label>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[15px] font-extrabold text-slate-900 tabular-nums">{years} yrs</span>
                  </div>
                  <input type="range" min={1} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="range-brand mt-2.5 w-full" aria-label="Tenure" />
                  <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400"><span>1 yr</span><span>30 yrs</span></div>
                </div>
              </div>
            </Card>

            {/* EMI verdict */}
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <p className="text-[11.5px] font-bold tracking-widest text-emerald-400 uppercase">Monthly EMI</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">{formatINR(bd.emi)}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-slate-400">Total interest</p>
                  <p className="mt-0.5 text-lg font-extrabold text-amber-300">{shortINR(bd.totalInterest)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-slate-400">Total payment</p>
                  <p className="mt-0.5 text-lg font-extrabold">{shortINR(bd.totalPayment)}</p>
                </div>
              </div>
              <EmiDonut principal={bd.principal} interest={bd.totalInterest} />
              <div className="-mt-2 flex justify-center gap-5 text-[11.5px] font-bold">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Principal {shortINR(bd.principal)}</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Interest {shortINR(bd.totalInterest)}</span>
              </div>
            </div>

            {/* Home-loan tax benefit */}
            {taxBenefit && (
              <Card className="border-emerald-200 bg-emerald-50/60 p-5">
                <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-emerald-800 uppercase">
                  <Home className="h-4 w-4" /> Home loan tax benefit (old regime)
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["24(b) interest", shortINR(taxBenefit.interestDeduction)],
                    ["80C principal", shortINR(taxBenefit.principalDeduction)],
                    ["Year-1 tax saved", shortINR(taxBenefit.taxSaved)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
                      <p className="text-[10.5px] font-bold text-slate-400 uppercase">{k}</p>
                      <p className="mt-1 text-[15px] font-extrabold text-emerald-700">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-500">Assumes 30% marginal slab. New regime mein 24(b)/80C nahi milta — Tax Saver pe compare karein.</p>
              </Card>
            )}
          </div>

          {/* ===================== Right column ===================== */}
          <div className="space-y-6">
            {/* Bank comparison */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5">
                <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                  <BadgePercent className="h-4 w-4 text-emerald-600" /> {TYPE_ICONS[type]} — best rates
                </p>
                <Pill tone="slate" className="text-[10px]">EMI on {shortINR(amount)}</Pill>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-[12.5px]">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/80 text-left text-slate-400">
                      <th className="px-5 py-2.5 font-bold">Bank</th>
                      <th className="px-3 py-2.5 font-bold">Rate p.a.</th>
                      <th className="px-3 py-2.5 font-bold">Your EMI</th>
                      <th className="px-3 py-2.5 font-bold">Processing fee</th>
                      <th className="px-3 py-2.5 font-bold">Highlight</th>
                      <th className="px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bankProducts.map((p, i) => {
                      const emi = calcEmi(amount, p.rateMin, Math.min(months, p.tenureMaxMonths));
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3.5 font-extrabold text-slate-900">
                            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[10px] text-white">{i + 1}</span>
                            {p.bank}
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="font-extrabold text-emerald-700">{p.rateMin}%</span>
                            <span className="text-slate-400"> – {p.rateMax}%</span>
                          </td>
                          <td className="px-3 py-3.5 font-bold text-slate-800 tabular-nums">{formatINR(emi.emi)}<span className="text-[10.5px] font-medium text-slate-400">/mo</span></td>
                          <td className="px-3 py-3.5 text-slate-500">{p.processingFee}</td>
                          <td className="px-3 py-3.5 text-slate-500 max-w-[180px]">{p.highlight}</td>
                          <td className="px-3 py-3.5">
                            <PartnerLink
                              href={p.affiliateUrl}
                              code={p.affiliateCode}
                              target={`loans:${p.bank}-${p.type}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-emerald-700 whitespace-nowrap"
                            >
                              Apply <ArrowRight className="h-3 w-3" />
                            </PartnerLink>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-[11px] text-slate-400">Rates are indicative (seeded catalogue) — final rate depends on CIBIL, income & LTV. We may earn a referral fee from partners.</p>
            </Card>

            {/* Amortization */}
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                  <TrendingDown className="h-4 w-4 text-sky-600" /> Amortization schedule
                </p>
                <Button variant="outline" size="sm" onClick={downloadCsv}>
                  <Download className="h-3.5 w-3.5" /> CSV download
                </Button>
              </div>
              <div className="mt-4">
                <BalanceChart rows={schedule.filter((_, i) => i % Math.ceil(schedule.length / 30) === 0 || i === schedule.length - 1)} />
              </div>
              <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-[12px]">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold">Year</th>
                      <th className="px-3 py-2 text-right font-bold">Principal</th>
                      <th className="px-3 py-2 text-right font-bold">Interest</th>
                      <th className="px-3 py-2 text-right font-bold">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedule.map((r: AmortYear) => (
                      <tr key={r.year}>
                        <td className="px-3 py-2 font-bold text-slate-700">Year {r.year}</td>
                        <td className="px-3 py-2 text-right text-slate-600 tabular-nums">{formatNum(r.principalPaid)}</td>
                        <td className="px-3 py-2 text-right text-amber-700 tabular-nums">{formatNum(r.interestPaid)}</td>
                        <td className="px-3 py-2 text-right font-bold text-slate-800 tabular-nums">{formatNum(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Prepayment */}
            <Card className="p-5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                <Banknote className="h-4 w-4 text-emerald-600" /> Prepayment ka magic
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <CurrencyInput label={`One-time prepayment`} value={prepayAmt} onChange={setPrepayAmt} max={Math.min(amount, 5_000_000)} step={25_000} chips={[{ label: "₹1L", value: 100_000 }, { label: "₹3L", value: 300_000 }, { label: "₹5L", value: 500_000 }]} />
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="text-[13px] font-semibold text-slate-600">Prepay after year</label>
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[15px] font-extrabold text-slate-900 tabular-nums">Y{prepayAt}</span>
                  </div>
                  <input type="range" min={1} max={Math.max(2, years - 1)} step={1} value={prepayAt} onChange={(e) => setPrepayAt(Number(e.target.value))} className="range-brand mt-2.5 w-full" aria-label="Prepay after years" />
                </div>
              </div>
              {prepay && prepayAmt > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase">Interest saved</p>
                    <p className="mt-1 text-xl font-extrabold text-emerald-700">{shortINR(prepay.interestSaved)}</p>
                  </div>
                  <div className="rounded-xl bg-sky-50 p-4 text-center ring-1 ring-sky-100">
                    <p className="text-[11px] font-bold text-sky-800 uppercase">Tenure reduced by</p>
                    <p className="mt-1 text-xl font-extrabold text-sky-700">{Math.floor(prepay.tenureReduced / 12)}y {prepay.tenureReduced % 12}m</p>
                  </div>
                </div>
              )}
            </Card>

            {/* CIBIL estimator */}
            <Card className="p-5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                <Gauge className="h-4 w-4 text-amber-500" /> CIBIL score estimator (soft — no bureau hit)
              </p>
              <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto]">
                <div className="space-y-3.5">
                  {[
                    { q: "Ever missed an EMI / card payment?", opts: ["Never", "Once or twice", "Often"], k: 0 },
                    { q: "Credit card utilisation?", opts: ["Under 30%", "30–70%", "Above 70%"], k: 1 },
                    { q: "Oldest credit line?", opts: ["Less than 1 yr", "1–5 yrs", "5+ yrs"], k: 2 },
                    { q: "Credit mix?", opts: ["Only cards/none", "Some loans", "Home/auto + cards"], k: 3 },
                    { q: "Loan enquiries (last 12 mo)?", opts: ["0–1", "2–4", "5+"], k: 4 },
                  ].map((item) => (
                    <div key={item.k}>
                      <p className="text-[12.5px] font-semibold text-slate-600">{item.q}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.opts.map((o, oi) => (
                          <button
                            key={o}
                            onClick={() => setCibilQ((prev) => prev.map((v, i) => (i === item.k ? oi : v)) as [number, number, number, number, number])}
                            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
                              cibilQ[item.k] === oi ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-400"
                            }`}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-5 md:w-52">
                  <ScoreGauge value={cibil.score} max={900} size={150} label="CIBIL est." sublabel={cibil.band} />
                  <ul className="mt-3 space-y-1.5 text-[11px] leading-snug text-slate-500">
                    {cibil.tips.map((tp) => (
                      <li key={tp} className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />{tp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Eligibility lead form */}
            <Card className="border-emerald-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-extrabold text-slate-900">Check eligibility in 30 seconds</p>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">Partner banks se best offer — soft check only, CIBIL pe koi asar nahi.</p>
                </div>
                <Pill tone="emerald" className="shrink-0 text-[10px]">Free</Pill>
              </div>
              {leadState === "done" ? (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[14px] font-extrabold text-emerald-800">Request received!</p>
                    <p className="text-[12.5px] text-emerald-700">Bank partner 24 ghante mein call karega. Ref: <span className="font-bold">TM-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span></p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input placeholder="Full name" value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))} aria-label="Full name" />
                  <Input placeholder="Mobile number" inputMode="tel" maxLength={10} value={lead.phone} onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value.replace(/\D/g, "") }))} aria-label="Mobile number" />
                  <Button onClick={submitLead} disabled={leadState === "saving" || lead.phone.length < 10}>
                    {leadState === "saving" ? "Sending…" : "Check now"}
                  </Button>
                </div>
              )}
            </Card>

            <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[12px] leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              EMI formula: P·r·(1+r)ⁿ/((1+r)ⁿ−1), standard reducing-balance. Rates indicative as of FY 2025-26. <strong>Not financial advice</strong> — bank se final terms confirm karein.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
