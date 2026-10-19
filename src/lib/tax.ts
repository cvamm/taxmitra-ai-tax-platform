/**
 * India Income Tax engine — FY 2025-26 (AY 2026-27).
 *
 * New regime slabs (FY 2025-26):
 *   0–4L nil | 4–8L 5% | 8–12L 10% | 12–16L 15% | 16–20L 20% | 20–24L 25% | >24L 30%
 *   Standard deduction ₹75,000 (salaried); §87A rebate up to ₹60,000 if
 *   taxable income ≤ ₹12,00,000 (with marginal relief just above ₹12L).
 *
 * Old regime: 0–2.5L nil | 2.5–5L 5% | 5–10L 20% | >10L 30%
 *   (basic exemption ₹3L for 60–79, ₹5L for 80+); standard deduction ₹50,000;
 *   §87A rebate up to ₹12,500 if taxable ≤ ₹5,00,000.
 *
 * Cess 4% always. Surcharge: 10% >50L, 15% >1Cr, 25% >2Cr, 37% >5Cr (old only).
 */

export type Regime = "new" | "old";
export type IncomeType = "salary" | "business" | "professional" | "other";

export interface TaxInputs {
  income: number; // gross annual income
  age: number;
  incomeType: IncomeType;
  /** Old-regime deductions */
  d80C?: number; // capped 1.5L
  d80D?: number; // capped 1L (simplified)
  nps?: number; // 80CCD(1B), capped 50k
  hra?: number; // HRA exemption amount
  homeLoanInterest?: number; // 24(b), capped 2L
  otherDeductions?: number; // 80G/80E/80TTA etc, capped 5L
}

export interface RegimeResult {
  regime: Regime;
  grossIncome: number;
  stdDeduction: number;
  deductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  taxAfterRebate: number;
  surchargeRate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveRate: number; // % of gross
  monthlyTax: number;
  slabBreakup: { range: string; rate: number; tax: number }[];
}

const NEW_STD_DED = 75_000;
const OLD_STD_DED = 50_000;

function basicExemptionOld(age: number): number {
  if (age >= 80) return 500_000;
  if (age >= 60) return 300_000;
  return 250_000;
}

interface Slab {
  upto: number; // inclusive bracket ceiling (Infinity for last)
  rate: number;
}

function computeFromSlabs(
  taxable: number,
  slabs: Slab[],
  floor: number
): { total: number; breakup: RegimeResult["slabBreakup"] } {
  let total = 0;
  let prev = floor;
  const breakup: RegimeResult["slabBreakup"] = [];
  for (const s of slabs) {
    if (taxable <= prev) break;
    const chunk = Math.min(taxable, s.upto) - prev;
    const tax = chunk * s.rate;
    total += tax;
    if (tax > 0)
      breakup.push({
        range: `${fmtL(prev)} – ${s.upto === Infinity ? "above" : fmtL(s.upto)}`,
        rate: s.rate * 100,
        tax: Math.round(tax),
      });
    prev = s.upto;
  }
  return { total: Math.round(total), breakup };
}

function fmtL(n: number): string {
  if (n === Infinity) return "∞";
  return `₹${(n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 1)}L`;
}

function surchargeRateNew(taxable: number): number {
  if (taxable > 20_000_000) return 0.25;
  if (taxable > 10_000_000) return 0.15;
  if (taxable > 5_000_000) return 0.1;
  return 0;
}

function surchargeRateOld(taxable: number): number {
  if (taxable > 50_000_000) return 0.37;
  if (taxable > 20_000_000) return 0.25;
  if (taxable > 10_000_000) return 0.15;
  if (taxable > 5_000_000) return 0.1;
  return 0;
}

export function computeOldRegime(inp: TaxInputs, opts?: { otherCap?: number }): RegimeResult {
  const salaried = inp.incomeType === "salary";
  const stdDeduction = salaried ? Math.min(OLD_STD_DED, inp.income) : 0;
  const otherCap = opts?.otherCap ?? 500_000;
  const deductions =
    Math.min(inp.d80C ?? 0, 150_000) +
    Math.min(inp.d80D ?? 0, 100_000) +
    Math.min(inp.nps ?? 0, 50_000) +
    Math.max(0, inp.hra ?? 0) +
    Math.min(inp.homeLoanInterest ?? 0, 200_000) +
    Math.min(inp.otherDeductions ?? 0, otherCap);

  const taxable = Math.max(0, inp.income - stdDeduction - deductions);
  const floor = basicExemptionOld(inp.age);
  const slabs: Slab[] = [
    { upto: 500_000, rate: 0.05 },
    { upto: 1_000_000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];
  const { total, breakup } = computeFromSlabs(taxable, slabs, floor);
  const rebate = taxable <= 500_000 ? Math.min(total, 12_500) : 0;
  const afterRebate = Math.max(0, total - rebate);
  const sRate = surchargeRateOld(taxable);
  const surcharge = Math.round(afterRebate * sRate);
  const cess = Math.round((afterRebate + surcharge) * 0.04);
  const totalTax = afterRebate + surcharge + cess;

  return {
    regime: "old",
    grossIncome: inp.income,
    stdDeduction,
    deductions,
    taxableIncome: taxable,
    taxBeforeRebate: total,
    rebate,
    taxAfterRebate: afterRebate,
    surchargeRate: sRate,
    surcharge,
    cess,
    totalTax,
    effectiveRate: inp.income > 0 ? (totalTax / inp.income) * 100 : 0,
    monthlyTax: totalTax / 12,
    slabBreakup: breakup,
  };
}

export function computeNewRegime(inp: TaxInputs): RegimeResult {
  const salaried = inp.incomeType === "salary";
  const stdDeduction = salaried ? Math.min(NEW_STD_DED, inp.income) : 0;
  const taxable = Math.max(0, inp.income - stdDeduction);

  const slabs: Slab[] = [
    { upto: 400_000, rate: 0 },
    { upto: 800_000, rate: 0.05 },
    { upto: 1_200_000, rate: 0.1 },
    { upto: 1_600_000, rate: 0.15 },
    { upto: 2_000_000, rate: 0.2 },
    { upto: 2_400_000, rate: 0.25 },
    { upto: Infinity, rate: 0.3 },
  ];
  const { total, breakup } = computeFromSlabs(taxable, slabs, 0);

  // §87A rebate + marginal relief (FY 2025-26).
  // Budget 2025 made it unconditional: total slab tax above ₹12L stays capped
  // at ₹60,000, so a salaried person earning up to ~₹12.75L owes zero.
  let afterRebate = total;
  let rebate = 0;
  if (taxable <= 1_200_000) {
    rebate = Math.min(total, 60_000);
    afterRebate = total - rebate;
  } else {
    const cap = 60_000;
    if (total > cap) {
      rebate = total - cap;
      afterRebate = cap;
    }
  }

  const sRate = surchargeRateNew(taxable);
  const surcharge = Math.round(afterRebate * sRate);
  const cess = Math.round((afterRebate + surcharge) * 0.04);
  const totalTax = afterRebate + surcharge + cess;

  return {
    regime: "new",
    grossIncome: inp.income,
    stdDeduction,
    deductions: 0,
    taxableIncome: taxable,
    taxBeforeRebate: total,
    rebate,
    taxAfterRebate: afterRebate,
    surchargeRate: sRate,
    surcharge,
    cess,
    totalTax,
    effectiveRate: inp.income > 0 ? (totalTax / inp.income) * 100 : 0,
    monthlyTax: totalTax / 12,
    slabBreakup: breakup,
  };
}

export interface TaxComparison {
  newRegime: RegimeResult;
  oldRegime: RegimeResult;
  better: Regime;
  savings: number;
  /** Deductions needed for old regime to match the new regime (null if impossible/atypical) */
  oldBreakevenDeductions: number | null;
  explanation: string;
}

export function compareRegimes(inp: TaxInputs): TaxComparison {
  const n = computeNewRegime(inp);
  const o = computeOldRegime(inp);
  const better: Regime = n.totalTax <= o.totalTax ? "new" : "old";
  const savings = Math.abs(n.totalTax - o.totalTax);

  // Breakeven scan: increase old-regime deductions until it ties the new regime
  let breakeven: number | null = null;
  if (o.totalTax > n.totalTax && inp.income <= 20_000_000) {
    const current =
      (inp.d80C ?? 0) +
      (inp.d80D ?? 0) +
      (inp.nps ?? 0) +
      (inp.hra ?? 0) +
      (inp.homeLoanInterest ?? 0) +
      (inp.otherDeductions ?? 0);
    for (let extra = 5_000; extra <= 2_500_000; extra += 5_000) {
      const trial = computeOldRegime(
        {
          ...inp,
          otherDeductions: (inp.otherDeductions ?? 0) + extra,
        },
        { otherCap: 2_500_000 } // scan must not hit the UI cap of ₹5L
      );
      if (trial.totalTax <= n.totalTax) {
        breakeven = current + extra;
        break;
      }
    }
  }

  const explanation =
    better === "new"
      ? breakeven != null
        ? `New regime saves you more. Old regime would beat it only if your total deductions cross about ₹${(
            breakeven / 100_000
          ).toFixed(1)} lakh.`
        : "New regime wins — 87A rebate keeps your tax low even without deductions."
      : "Old regime wins — your deductions are working hard for you.";

  return {
    newRegime: n,
    oldRegime: o,
    better,
    savings,
    oldBreakevenDeductions: o.totalTax > n.totalTax ? breakeven : null,
    explanation,
  };
}

/** 5-year projection with assumed income growth, keeping deductions constant. */
export function project5Year(
  inp: TaxInputs,
  growthPct = 8
): { year: string; newTax: number; oldTax: number; income: number }[] {
  const out: { year: string; newTax: number; oldTax: number; income: number }[] = [];
  const startYear = 2025;
  for (let i = 0; i < 5; i++) {
    const income = Math.round(inp.income * Math.pow(1 + growthPct / 100, i));
    const p = { ...inp, income };
    out.push({
      year: `FY ${startYear + i}-${String((startYear + i + 1) % 100).padStart(2, "0")}`,
      income,
      newTax: computeNewRegime(p).totalTax,
      oldTax: computeOldRegime(p).totalTax,
    });
  }
  return out;
}
