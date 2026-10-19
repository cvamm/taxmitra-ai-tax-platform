import type { Metadata } from "next";
import PremiumClient from "./client";

export const metadata: Metadata = {
  title: "TaxMitra Premium — ₹499/year | AIS Sync, Unlimited Invoices, Priority CA",
  description:
    "Upgrade to TaxMitra Premium: AIS/26AS auto-sync, unlimited GST invoices with e-signature, priority CA chat, advanced tax planning and multi-business profiles. ₹499/year.",
  alternates: { canonical: "/premium" },
};

export default function PremiumPage() {
  return <PremiumClient />;
}
