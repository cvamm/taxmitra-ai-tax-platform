import type { Metadata } from "next";
import { db } from "@/db";
import { caProfiles } from "@/db/schema";
import CaClient from "./client";
import { CA_PROFILES_STATIC, type CaProfileLite } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CA Marketplace — ICAI-Verified Chartered Accountants from ₹499",
  description:
    "Book verified CAs for ITR filing, GST, company registration & audit. Escrow-protected payments, ratings after every filing, chat + document vault. Starting ₹499.",
  alternates: { canonical: "/ca-marketplace" },
};

async function getCas(): Promise<CaProfileLite[]> {
  try {
    const rows = await db.select().from(caProfiles);
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        firm: r.firm,
        city: r.city,
        specialties: r.specialties,
        languages: r.languages,
        rating: r.rating,
        reviews: r.reviews,
        priceFrom: r.priceFrom,
        experienceYears: r.experienceYears,
        verified: r.verified,
        filingsDone: r.filingsDone,
        avatarColor: r.avatarColor,
      }));
    }
  } catch {
    /* fall back to static catalogue */
  }
  return CA_PROFILES_STATIC;
}

export default async function CaMarketplacePage() {
  const cas = await getCas();
  return <CaClient cas={cas} />;
}
