import type { Metadata } from "next";
import LandingClient from "./landing-client";

export const metadata: Metadata = {
  title: "TaxMitra — Aapka Tax, Aapka AI | 5 Minute Mein ITR Ready",
  description:
    "AI-powered Finance, Tax & GST platform for 10 Cr+ Indian taxpayers & 6 Cr+ MSMEs. Free tax calculator (new vs old regime FY 2025-26), ITR filing, EMI & loan comparison, GST invoices and CA marketplace from ₹499.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <LandingClient />;
}
