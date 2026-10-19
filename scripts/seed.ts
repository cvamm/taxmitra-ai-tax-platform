/**
 * Seed script — run with: npx tsx scripts/seed.ts
 * Idempotent: wipes and re-inserts catalogue tables + a demo user.
 */
import "dotenv/config";
import { db } from "../src/db";
import {
  bookings,
  calculations,
  caProfiles,
  invoices,
  loanProducts,
  referrals,
  taxSlabs,
  users,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { CA_PROFILES_STATIC, LOAN_PRODUCTS_STATIC } from "../src/lib/data";

async function main() {
  console.log("Seeding TaxMitra…");

  // ---- CA profiles (10) ----
  await db.delete(caProfiles);
  await db.insert(caProfiles).values(
    CA_PROFILES_STATIC.map((c) => ({
      name: c.name,
      firm: c.firm,
      city: c.city,
      specialties: c.specialties,
      languages: c.languages,
      rating: c.rating,
      reviews: c.reviews,
      priceFrom: c.priceFrom,
      experienceYears: c.experienceYears,
      verified: c.verified,
      filingsDone: c.filingsDone,
      avatarColor: c.avatarColor,
    }))
  );
  console.log(`  ca_profiles: ${CA_PROFILES_STATIC.length}`);

  // ---- Loan products (15) ----
  await db.delete(loanProducts);
  await db.insert(loanProducts).values(
    LOAN_PRODUCTS_STATIC.map((p) => ({
      bank: p.bank,
      type: p.type,
      rateMin: p.rateMin,
      rateMax: p.rateMax,
      processingFee: p.processingFee,
      tenureMaxMonths: p.tenureMaxMonths,
      maxAmount: p.maxAmount,
      highlight: p.highlight,
      affiliateCode: p.affiliateCode,
      affiliateUrl: p.affiliateUrl,
    }))
  );
  console.log(`  loan_products: ${LOAN_PRODUCTS_STATIC.length}`);

  // ---- Tax slabs FY 2025-26 ----
  await db.delete(taxSlabs);
  const newRegime = [
    { fromInr: 0, toInr: 400_000, rate: 0 },
    { fromInr: 400_000, toInr: 800_000, rate: 0.05 },
    { fromInr: 800_000, toInr: 1_200_000, rate: 0.1 },
    { fromInr: 1_200_000, toInr: 1_600_000, rate: 0.15 },
    { fromInr: 1_600_000, toInr: 2_000_000, rate: 0.2 },
    { fromInr: 2_000_000, toInr: 2_400_000, rate: 0.25 },
    { fromInr: 2_400_000, toInr: null, rate: 0.3 },
  ];
  const oldRegime = [
    { fromInr: 0, toInr: 250_000, rate: 0 },
    { fromInr: 250_000, toInr: 500_000, rate: 0.05 },
    { fromInr: 500_000, toInr: 1_000_000, rate: 0.2 },
    { fromInr: 1_000_000, toInr: null, rate: 0.3 },
  ];
  await db.insert(taxSlabs).values([
    ...newRegime.map((s) => ({ fy: "2025-26", regime: "new", ...s })),
    ...oldRegime.map((s) => ({ fy: "2025-26", regime: "old", ...s })),
  ]);
  console.log(`  tax_slabs: ${newRegime.length + oldRegime.length}`);

  // ---- Referral codes ----
  await db.delete(referrals);
  await db.insert(referrals).values(
    LOAN_PRODUCTS_STATIC.slice(0, 5).map((p) => ({
      code: p.affiliateCode,
      partner: p.bank,
      kind: "affiliate",
      target: p.type,
      clicks: 0,
      conversions: 0,
    }))
  );

  // ---- Demo user (login: demo@taxmitra.in / demo1234) ----
  await db.delete(bookings);
  await db.delete(calculations);
  await db.delete(invoices);
  await db.delete(users);
  const [demo] = await db
    .insert(users)
    .values({
      name: "Ananya Sharma",
      email: "demo@taxmitra.in",
      phone: "9876543210",
      passwordHash: hashPassword("demo1234"),
      plan: "premium",
      businessName: "Sharma Design Studio",
      consentAt: new Date(),
    })
    .returning({ id: users.id });

  await db.insert(calculations).values([
    {
      userId: demo.id,
      kind: "tax",
      inputs: { income: 1_450_000, age: 29, incomeType: "salary", d80C: 150_000, d80D: 25_000, nps: 50_000 },
      results: { newTax: 88_400, oldTax: 112_320, better: "new", savings: 23_920 },
    },
    {
      userId: demo.id,
      kind: "emi",
      inputs: { amount: 3_500_000, rate: 8.75, months: 240 },
      results: { emi: 30_930 },
    },
  ]);

  await db.insert(invoices).values([
    {
      userId: demo.id,
      invoiceNo: "TM-2025-101",
      sellerName: "Sharma Design Studio",
      sellerGstin: "07AAACS1234A1Z2",
      sellerState: "07",
      buyerName: "Nimbus Retail LLP",
      buyerGstin: "27AAAFN5678B1Z4",
      buyerState: "27",
      items: [
        { name: "Brand identity design", hsn: "998311", qty: 1, rate: 48_000, gstRate: 18 },
        { name: "Social media kit", hsn: "998311", qty: 1, rate: 12_000, gstRate: 18 },
      ],
      subtotal: 60_000,
      cgst: 0,
      sgst: 0,
      igst: 10_800,
      total: 70_800,
      status: "issued",
    },
    {
      userId: demo.id,
      invoiceNo: "TM-2025-102",
      sellerName: "Sharma Design Studio",
      sellerGstin: "07AAACS1234A1Z2",
      sellerState: "07",
      buyerName: "Cafe Amaltas",
      buyerState: "07",
      items: [{ name: "Menu design + print consulting", hsn: "998311", qty: 1, rate: 15_000, gstRate: 18 }],
      subtotal: 15_000,
      cgst: 1_350,
      sgst: 1_350,
      igst: 0,
      total: 17_700,
      status: "paid",
    },
  ]);

  console.log("  demo user + calculations + invoices: done");
  console.log("Seed complete ✓  (login demo@taxmitra.in / demo1234)");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
