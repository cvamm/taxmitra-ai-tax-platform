import type { Metadata } from "next";
import { db } from "@/db";
import { loanProducts } from "@/db/schema";
import LoansClient from "./client";
import { LOAN_PRODUCTS_STATIC, type LoanProductLite } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EMI Calculator + Loan Comparison — HDFC, SBI, ICICI, Axis, Kotak",
  description:
    "Compare home, car, personal & education loans from 15+ bank products. Free EMI calculator with amortization schedule, prepayment savings, CIBIL estimator and home-loan tax benefits (24b + 80C).",
  alternates: { canonical: "/loans" },
};

async function getProducts(): Promise<LoanProductLite[]> {
  try {
    const rows = await db.select().from(loanProducts);
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        bank: r.bank,
        type: r.type,
        rateMin: r.rateMin,
        rateMax: r.rateMax,
        processingFee: r.processingFee,
        tenureMaxMonths: r.tenureMaxMonths,
        maxAmount: r.maxAmount,
        highlight: r.highlight,
        affiliateCode: r.affiliateCode,
        affiliateUrl: r.affiliateUrl,
      }));
    }
  } catch {
    /* DB not seeded yet — use static catalogue */
  }
  return LOAN_PRODUCTS_STATIC;
}

export default async function LoansPage() {
  const products = await getProducts();
  return <LoansClient products={products} />;
}
