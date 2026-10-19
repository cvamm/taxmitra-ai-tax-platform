"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Crown,
  Info,
  Lightbulb,
  PiggyBank,
  ShieldQuestion,
  TrendingUp,
} from "lucide-react";
import { Card, Pill, Select, PartnerLink } from "@/components/ui";
import CurrencyInput from "@/components/currency-input";
import { ProjectionChart, RegimeCompareChart } from "@/components/charts";
import { compareRegimes, project5Year, type IncomeType } from "@/lib/tax";
import { formatINR, shortINR, clamp } from "@/lib/format";
import { INVESTMENT_OPTIONS } from "@/lib/data";

const AGE_OPTIONS = [
  { value: "30", label: "Below 60 years" },
  { value: "65", label: "60 – 79 years (senior)" },
  { value: "82", label: "80+ (super senior)" },
];

function marginalRateOld(taxable: number, age: number): number {
  const floor = age >= 80 ? 500_000 : age >= 60 ? 300_000 : 250_000;
  if (taxable > 1_000_000) return 0.3;
  if (taxable > 500_000) return 0.2;
  if (taxable > floor) return 0.05;
  return 0;
}

export default function TaxSaverClient() {
  const [income, setIncome] = useState(1_200_000);
  const [incomeType, setIncomeType] = useState<IncomeType>("salary");
  const [age, setAge] = useState(30);
  const [d80C, setD80C] = useState(50_000);
  const [d80D, setD80D] = useState(15_000);
  const [nps, setNps] = useState(0);
  const [hra, setHra] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [other, setOther] = useState(0);
  const [showBreakup, setShowBreakup] = useState(false);

  const inputs = useMemo(
    () => ({ income, age, incomeType, d80C, d80D, nps, hra, homeLoanInterest: homeLoan, otherDeductions: other }),
    [income, age, incomeType, d80C, d80D, nps, hra, homeLoan, other]
  );

  const cmp = useMemo(() => compareRegimes(inputs), [inputs]);
  const projection = useMemo(() => project5Year(inputs), [inputs]);
  const best = cmp.better === "new" ? cmp.newRegime : cmp.oldRegime;

  // Optimizer suggestions (old-regime levers)
  const suggestions = useMemo(() => {
    const m = marginalRateOld(cmp.oldRegime.taxableIncome, age);
    const list: { key: string; text: string; save: number; section: string }[] = [];
    const cGap = clamp(150_000 - d80C, 0, 150_000);
    if (cGap > 0 && m > 0)
      list.push({
        key: "80c",
        section: "80C",
        text: `${shortINR(cGap)} aur invest karein (ELSS/PPF/EPF) — 80C abhi poora use nahi ho raha.`,
        save: Math.round(cGap * m * 1.04),
      });
    if (nps < 50_000 && m > 0)
      list.push({
        key: "nps",
        section: "80CCD(1B)",
        text: `NPS mein ${shortINR(50_000 - nps)} extra — ye 80C ke upar alag se milta hai.`,
        save: Math.round((50_000 - nps) * m * 1.04),
      });
    if (d80D < 25_000 && m > 0)
      list.push({
        key: "80d",
        section: "80D",
        text: `Health insurance (₹25k premium) se ${shortINR(25_000 - d80D)} deduction + family protection.`,
        save: Math.round((25_000 - d80D) * m * 1.04),
      });
    return list.sort((a, b) => b.save - a.save).slice(0, 3);
  }, [cmp.oldRegime.taxableIncome, age, d80C, nps, d80D]);

  // Persist calculation for dashboard (silent, fire-and-forget)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        fetch("/api/calculations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: "tax",
            inputs,
            results: { newTax: cmp.newRegime.totalTax, oldTax: cmp.oldRegime.totalTax, better: cmp.better, savings: cmp.savings },
          }),
          keepalive: true,
        });
      } catch {}
    }, 1_500);
    return () => clearTimeout(t);
  }, [inputs, cmp]);

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <div className="max-w-2xl">
          <Pill tone="emerald">FY 2025-26 · AY 2026-27 · Budget 2025 updated</Pill>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tax Saving Calculator
          </h1>
          <p className="mt-2 text-[14.5px] text-slate-500">
            New regime (0–4L nil, 87A rebate caps tax at ₹60,000 up to ~₹12.75L) vs old regime — exact comparison with 80C, 80D, NPS, HRA. 30 second mein apna best option dekhein.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* ======================= INPUTS ======================= */}
          <Card className="h-fit p-5 lg:sticky lg:top-24">
            <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
              <BadgeIndianRupee className="h-4 w-4 text-emerald-600" /> Aapki details
            </p>
            <div className="mt-5 space-y-6">
              <CurrencyInput
                label="Annual gross income"
                value={income}
                onChange={setIncome}
                max={30_000_000}
                step={25_000}
                chips={[
                  { label: "₹6L", value: 600_000 },
                  { label: "₹12L", value: 1_200_000 },
                  { label: "₹18L", value: 1_800_000 },
                  { label: "₹30L", value: 3_000_000 },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Income type"
                  value={incomeType}
                  onChange={(e) => setIncomeType(e.target.value as IncomeType)}
                >
                  <option value="salary">Salaried</option>
                  <option value="business">Business</option>
                  <option value="professional">Professional</option>
                  <option value="other">Other</option>
                </Select>
                <Select label="Age" value={String(age)} onChange={(e) => setAge(Number(e.target.value))}>
                  {AGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-extrabold tracking-wide text-slate-500 uppercase">
                  <PiggyBank className="h-3.5 w-3.5 text-amber-500" /> Old-regime deductions
                </p>
                <div className="mt-4 space-y-5">
                  <CurrencyInput label="80C (ELSS, PPF, EPF, LIC)" value={d80C} onChange={setD80C} max={150_000} step={5_000} hint="Cap ₹1.5 lakh" />
                  <CurrencyInput label="80D health insurance" value={d80D} onChange={setD80D} max={100_000} step={5_000} />
                  <CurrencyInput label="NPS 80CCD(1B)" value={nps} onChange={setNps} max={50_000} step={5_000} hint="Extra ₹50k over 80C" />
                  <CurrencyInput label="HRA exemption" value={hra} onChange={setHra} max={600_000} step={10_000} hint="Rent payers only — Form 16 value" />
                  <CurrencyInput label="Home loan interest 24(b)" value={homeLoan} onChange={setHomeLoan} max={200_000} step={10_000} hint="Cap ₹2 lakh" />
                  <CurrencyInput label="Other (80G, 80E…)" value={other} onChange={setOther} max={300_000} step={10_000} />
                </div>
              </div>
            </div>
          </Card>

          {/* ======================= RESULTS ======================= */}
          <div className="space-y-6">
            {/* Verdict */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white sm:p-7">
              <div className="hero-grid absolute inset-0" />
              <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-bold tracking-widest text-emerald-400 uppercase">Recommendation</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {cmp.better === "new" ? "New Regime" : "Old Regime"} best hai
                  </h2>
                  <p className="mt-2 max-w-md text-[13.5px] text-slate-300">
                    Estimated tax: <strong className="text-white">{formatINR(best.totalTax)}</strong> · effective rate{" "}
                    <strong className="text-white">{best.effectiveRate.toFixed(1)}%</strong> · {formatINR(best.monthlyTax)}/month
                  </p>
                  {cmp.oldBreakevenDeductions && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-slate-200">
                      <Info className="h-3.5 w-3.5 text-emerald-300" />
                      Old regime tabhi better jab total deductions ≈ {shortINR(cmp.oldBreakevenDeductions)} se zyada ho
                    </p>
                  )}
                </div>
                <div className="rounded-2xl bg-emerald-500/15 px-5 py-4 text-center ring-1 ring-emerald-400/30">
                  <p className="text-[11px] font-bold text-emerald-300 uppercase">Aap bacha rahe hain</p>
                  <p className="mt-0.5 text-3xl font-extrabold text-emerald-300">{shortINR(cmp.savings)}</p>
                  <p className="text-[11px] text-slate-400">per year</p>
                </div>
              </div>
            </div>

            {/* Regime cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { r: cmp.newRegime, title: "New Regime", sub: "Default · FY 25-26", best: cmp.better === "new" },
                { r: cmp.oldRegime, title: "Old Regime", sub: "With deductions", best: cmp.better === "old" },
              ].map(({ r, title, sub, best: isBest }) => (
                <Card key={title} className={`relative p-5 ${isBest ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""}`}>
                  {isBest && (
                    <span className="absolute -top-3 right-4">
                      <Pill tone="emerald" className="shadow-sm"><Crown className="h-3 w-3" /> Best</Pill>
                    </span>
                  )}
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                  <p className="text-[11.5px] text-slate-400">{sub}</p>
                  <p className="mt-3 text-[26px] font-extrabold tracking-tight text-slate-900">{formatINR(r.totalTax)}</p>
                  <dl className="mt-3 space-y-1.5 text-[12.5px]">
                    {[
                      ["Taxable income", shortINR(r.taxableIncome)],
                      ["Slab tax", formatINR(r.taxBeforeRebate)],
                      ["87A rebate", r.rebate > 0 ? `– ${formatINR(r.rebate)}` : "—"],
                      ["Cess (4%)", `+ ${formatINR(r.cess)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <dt className="text-slate-400">{k}</dt>
                        <dd className="font-bold text-slate-700 tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <Card className="p-5">
              <p className="text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">Side-by-side</p>
              <div className="mt-3">
                <RegimeCompareChart newTax={cmp.newRegime.totalTax} oldTax={cmp.oldRegime.totalTax} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> 5-year projection (8% growth)
                </p>
              </div>
              <div className="mt-3">
                <ProjectionChart points={projection} />
              </div>
              <p className="mt-2 text-[11.5px] text-slate-400">
                Assumes income grows 8%/yr with same deductions. 5-year gap: {shortINR(Math.abs(projection.reduce((a, p) => a + p.newTax - p.oldTax, 0)))} in favour of {projection.reduce((a, p) => a + p.newTax, 0) <= projection.reduce((a, p) => a + p.oldTax, 0) ? "new" : "old"} regime.
              </p>
            </Card>

            {/* Slab breakup */}
            <Card className="p-5">
              <button
                onClick={() => setShowBreakup((v) => !v)}
                className="flex w-full items-center justify-between text-[13px] font-extrabold tracking-wide text-slate-800 uppercase"
              >
                <span className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4 text-slate-400" /> Slab-wise breakup ({cmp.better} regime)</span>
                <span className="text-emerald-700 normal-case">{showBreakup ? "Hide" : "Show"}</span>
              </button>
              {showBreakup && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-[12.5px]">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold">Slab</th>
                        <th className="px-3 py-2 text-right font-bold">Rate</th>
                        <th className="px-3 py-2 text-right font-bold">Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {best.slabBreakup.length === 0 && (
                        <tr><td colSpan={3} className="px-3 py-3 text-center text-slate-400">Zero tax — 87A rebate / below exemption limit.</td></tr>
                      )}
                      {best.slabBreakup.map((s) => (
                        <tr key={s.range}>
                          <td className="px-3 py-2.5 font-semibold text-slate-700">{s.range}</td>
                          <td className="px-3 py-2.5 text-right text-slate-500">{s.rate}%</td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-800 tabular-nums">{formatINR(s.tax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Optimizer */}
            {suggestions.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/60 p-5">
                <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-amber-800 uppercase">
                  <Lightbulb className="h-4 w-4" /> Smart optimizer
                </p>
                <div className="mt-3 space-y-3">
                  {suggestions.map((s) => (
                    <div key={s.key} className="flex items-start justify-between gap-3 rounded-xl bg-white p-3.5 ring-1 ring-amber-100">
                      <div className="flex items-start gap-2.5">
                        <Pill tone="amber" className="mt-0.5 shrink-0 px-2 py-0.5 text-[10px]">{s.section}</Pill>
                        <p className="text-[13px] leading-snug text-slate-600">{s.text}</p>
                      </div>
                      <p className="shrink-0 text-right text-[12px] font-extrabold whitespace-nowrap text-emerald-700">
                        save {shortINR(s.save)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Investment suggestions */}
            <div>
              <div className="flex items-end justify-between">
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">Kahan invest karein? (ranked)</h3>
                <p className="text-[11.5px] text-slate-400">Risk-adjusted returns ke hisaab se</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {INVESTMENT_OPTIONS.map((inv, idx) => (
                  <Card key={inv.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-extrabold text-slate-900">
                          <span className="mr-1.5 text-slate-300">#{idx + 1}</span>{inv.name}
                        </p>
                        <p className="mt-0.5 text-[11.5px] font-semibold text-slate-400">{inv.section} · Lock-in {inv.lockIn}</p>
                      </div>
                      <Pill tone={inv.risk === "High" ? "rose" : inv.risk === "Moderate" ? "amber" : "emerald"} className="shrink-0 px-2 py-0.5 text-[10px]">
                        {inv.risk} risk
                      </Pill>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                      <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <dt className="text-slate-400">Returns</dt>
                        <dd className="font-bold text-slate-700">{inv.expectedReturn}</dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                        <dt className="text-slate-400">Best for</dt>
                        <dd className="font-bold text-slate-700">{inv.bestFor}</dd>
                      </div>
                    </dl>
                    <PartnerLink
                      href={inv.affiliateUrl}
                      code={inv.affiliateCode}
                      target={`tax-saver:${inv.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Invest via {inv.partner} <ArrowRight className="h-3.5 w-3.5" />
                    </PartnerLink>
                  </Card>
                ))}
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[12px] leading-relaxed text-slate-500">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Calculation FY 2025-26 slabs + 87A rebate (₹60,000 cap, effective up to ~₹12.75L for salaried) + 4% cess ke hisaab se. Surcharge &gt;50L pe applicable. <strong>Not financial advice — final filing se pehle CA se verify karein.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
