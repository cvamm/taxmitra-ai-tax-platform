import type { Metadata } from "next";
import ItrClient from "./client";

export const metadata: Metadata = {
  title: "ITR Filing Helper FY 2025-26 — AI Chatbot + Form 16 OCR",
  description:
    "File your ITR in 5 minutes with Mitra AI. Upload Form 16 / 26AS / AIS, get instant new vs old regime tax estimate, TDS refund calculation and CA-verified filing from ₹499.",
  alternates: { canonical: "/itr" },
};

export default function ItrPage() {
  return <ItrClient />;
}
