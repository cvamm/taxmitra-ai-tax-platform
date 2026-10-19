import type { Metadata } from "next";
import TaxSaverClient from "./client";

export const metadata: Metadata = {
  title: "Income Tax Calculator FY 2025-26 — New vs Old Regime + Tax Saver",
  description:
    "Free income tax calculator for FY 2025-26 (AY 2026-27). Compare new regime vs old regime with 80C, 80D, NPS, HRA deductions. Get AI investment suggestions — ELSS, PPF, NPS — and save up to ₹1.5 lakh.",
  alternates: { canonical: "/tax-saver" },
};

export default function TaxSaverPage() {
  return <TaxSaverClient />;
}
