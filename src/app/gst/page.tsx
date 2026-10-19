import type { Metadata } from "next";
import GstClient from "./client";

export const metadata: Metadata = {
  title: "Free GST Invoice Generator + GSTR Reminder — For Shops & MSMEs",
  description:
    "Create GST-compliant invoices in 30 seconds: GSTIN auto-validation, HSN/SAC lookup, CGST/SGST/IGST auto-split. Share on WhatsApp/PDF in 1 tap. GSTR-1, GSTR-3B, GSTR-9 deadline reminders. Free under 50 invoices/month.",
  alternates: { canonical: "/gst" },
};

export default function GstPage() {
  return <GstClient />;
}
