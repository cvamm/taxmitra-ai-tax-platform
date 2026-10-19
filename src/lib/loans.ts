/** EMI, amortization, prepayment and CIBIL estimation helpers. */

export interface EmiBreakdown {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
  rate: number;
  months: number;
}

export function calcEmi(principal: number, annualRatePct: number, months: number): EmiBreakdown {
  const r = annualRatePct / 12 / 100;
  let emi: number;
  if (r === 0) emi = principal / months;
  else {
    const f = Math.pow(1 + r, months);
    emi = (principal * r * f) / (f - 1);
  }
  const totalPayment = emi * months;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalPayment - principal),
    totalPayment: Math.round(totalPayment),
    principal,
    rate: annualRatePct,
    months,
  };
}

export interface AmortYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

/** Yearly amortization schedule (aggregated from monthly). */
export function amortization(principal: number, annualRatePct: number, months: number): AmortYear[] {
  const r = annualRatePct / 12 / 100;
  const { emi } = calcEmi(principal, annualRatePct, months);
  let balance = principal;
  const years: AmortYear[] = [];
  let yPrincipal = 0;
  let yInterest = 0;
  let year = 1;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const princ = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - princ);
    yPrincipal += princ;
    yInterest += interest;
    if (m % 12 === 0 || m === months) {
      years.push({
        year,
        principalPaid: Math.round(yPrincipal),
        interestPaid: Math.round(yInterest),
        balance: Math.round(balance),
      });
      year++;
      yPrincipal = 0;
      yInterest = 0;
    }
  }
  return years;
}

/** Savings from a one-time prepayment made after `atMonth` (EMI kept constant). */
export function prepaymentSavings(
  principal: number,
  annualRatePct: number,
  months: number,
  prepayAmount: number,
  atMonth: number
): { interestSaved: number; tenureReduced: number } {
  const r = annualRatePct / 12 / 100;
  const { emi, totalInterest } = calcEmi(principal, annualRatePct, months);
  let balance = principal;
  let preInterest = 0;
  for (let m = 1; m <= atMonth && balance > 0; m++) {
    const interest = balance * r;
    preInterest += interest;
    balance -= Math.min(emi - interest, balance);
  }
  balance = Math.max(0, balance - prepayAmount);
  let remaining = 0;
  let postInterest = 0;
  while (balance > 0.5 && remaining < 1200) {
    const interest = balance * r;
    postInterest += interest;
    balance -= Math.min(emi - interest, balance);
    remaining++;
  }
  const newTotal = preInterest + postInterest;
  const interestSaved = Math.max(0, Math.round(totalInterest - newTotal));
  const tenureReduced = Math.max(0, months - atMonth - remaining);
  return { interestSaved, tenureReduced };
}

/** Home-loan tax benefit (old regime): 24(b) interest ≤ ₹2L + 80C principal ≤ ₹1.5L. */
export function homeLoanTaxBenefit(
  annualPrincipal: number,
  annualInterest: number,
  marginalRate = 0.3
): { interestDeduction: number; principalDeduction: number; taxSaved: number } {
  const interestDeduction = Math.min(annualInterest, 200_000);
  const principalDeduction = Math.min(annualPrincipal, 150_000);
  const taxSaved = Math.round((interestDeduction + principalDeduction) * marginalRate * 1.04);
  return { interestDeduction, principalDeduction, taxSaved };
}

export interface CibilAnswer {
  paymentMisses: number; // 0..2 (0 none, 1 once, 2 often)
  utilization: number; // 0..2 (<=30%, 30-70%, >70%)
  creditAge: number; // 0..2 (<1y, 1-5y, >5y)
  creditMix: number; // 0..2 (none/personal, some, secured+unsecured)
  enquiries: number; // 0..2 (0-1, 2-4, 5+)
}

export function estimateCibil(a: CibilAnswer): { score: number; band: string; tips: string[] } {
  let score = 300;
  score += [225, 160, 60][a.paymentMisses] ?? 60; // 35%
  score += [190, 120, 45][a.utilization] ?? 45; // 30%
  score += [25, 75, 95][a.creditAge] ?? 25; // 15%
  score += [30, 60, 65][a.creditMix] ?? 30; // 10%
  score += [60, 40, 15][a.enquiries] ?? 15; // 10%
  score = Math.min(900, Math.max(300, score + 40));
  const band = score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 650 ? "Fair" : "Needs work";
  const tips: string[] = [];
  if (a.paymentMisses > 0) tips.push("Pay every EMI on time — 6 clean months can add 40–60 points.");
  if (a.utilization > 0) tips.push("Keep credit-card utilisation under 30% for a quick score lift.");
  if (a.enquiries > 1) tips.push("Avoid multiple loan applications — each hard enquiry dents the score.");
  if (a.creditMix < 2) tips.push("A healthy mix (one secured + one credit line) helps long-term.");
  if (tips.length === 0) tips.push("Solid profile! Maintain utilisation and tenure on-time streak.");
  return { score, band, tips };
}

export const LOAN_TYPES = [
  { id: "home", label: "Home Loan", unit: "₹", defaultAmount: 4_000_000, defaultRate: 8.75, defaultYears: 20, maxAmount: 50_000_000 },
  { id: "car", label: "Car Loan", unit: "₹", defaultAmount: 800_000, defaultRate: 9.3, defaultYears: 5, maxAmount: 5_000_000 },
  { id: "personal", label: "Personal Loan", unit: "₹", defaultAmount: 500_000, defaultRate: 11, defaultYears: 4, maxAmount: 5_000_000 },
  { id: "education", label: "Education Loan", unit: "₹", defaultAmount: 2_000_000, defaultRate: 8.6, defaultYears: 8, maxAmount: 15_000_000 },
] as const;

export type LoanTypeId = (typeof LOAN_TYPES)[number]["id"];
