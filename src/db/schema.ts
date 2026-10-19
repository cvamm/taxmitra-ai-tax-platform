import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/* ------------------------------ Auth & users ----------------------------- */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"), // free | premium | sme
  businessName: text("business_name"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------------------- Reference / seed --------------------------- */

export const caProfiles = pgTable("ca_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  firm: text("firm").notNull(),
  city: text("city").notNull(),
  specialties: text("specialties").array().notNull(),
  languages: text("languages").array().notNull(),
  rating: real("rating").notNull().default(4.7),
  reviews: integer("reviews").notNull().default(0),
  priceFrom: integer("price_from").notNull(), // ₹ starting price
  experienceYears: integer("experience_years").notNull(),
  verified: boolean("verified").notNull().default(true),
  filingsDone: integer("filings_done").notNull().default(0),
  avatarColor: text("avatar_color").notNull().default("#059669"),
});

export const loanProducts = pgTable("loan_products", {
  id: serial("id").primaryKey(),
  bank: text("bank").notNull(),
  type: text("type").notNull(), // home | car | personal | education
  rateMin: real("rate_min").notNull(),
  rateMax: real("rate_max").notNull(),
  processingFee: text("processing_fee").notNull(),
  tenureMaxMonths: integer("tenure_max_months").notNull(),
  maxAmount: integer("max_amount").notNull(),
  highlight: text("highlight").notNull().default(""),
  affiliateCode: text("affiliate_code").notNull(),
  affiliateUrl: text("affiliate_url").notNull().default("#"),
});

export const taxSlabs = pgTable("tax_slabs", {
  id: serial("id").primaryKey(),
  fy: text("fy").notNull().default("2025-26"),
  regime: text("regime").notNull(), // new | old
  fromInr: integer("from_inr").notNull(),
  toInr: integer("to_inr"), // null = open-ended
  rate: real("rate").notNull(),
});

/* ------------------------------ App entities ----------------------------- */

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  invoiceNo: text("invoice_no").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerGstin: text("seller_gstin"),
  sellerState: text("seller_state").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerGstin: text("buyer_gstin"),
  buyerState: text("buyer_state").notNull(),
  items: jsonb("items").$type<
    { name: string; hsn?: string; qty: number; rate: number; gstRate: number }[]
  >(),
  subtotal: real("subtotal").notNull().default(0),
  cgst: real("cgst").notNull().default(0),
  sgst: real("sgst").notNull().default(0),
  igst: real("igst").notNull().default(0),
  total: real("total").notNull().default(0),
  status: text("status").notNull().default("issued"), // issued | paid | cancelled
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  kind: text("kind").notNull(), // tax | emi | cibil | itr
  inputs: jsonb("inputs").$type<Record<string, unknown>>(),
  results: jsonb("results").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  refCode: text("ref_code").notNull().unique(),
  kind: text("kind").notNull().default("ca"), // ca | loan | premium | lead
  userName: text("user_name").notNull(),
  userPhone: text("user_phone").notNull(),
  caId: integer("ca_id").references(() => caProfiles.id, { onDelete: "set null" }),
  service: text("service").notNull(),
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default("escrow_pending"), // escrow_pending | released | new | refunded
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. TM-HDFC-HOME
  partner: text("partner").notNull(),
  kind: text("kind").notNull().default("affiliate"), // affiliate | user-referral
  target: text("target").notNull().default(""),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refEvents = pgTable("ref_events", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  kind: text("kind").notNull().default("click"),
  target: text("target").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  channel: text("channel").notNull().default("whatsapp"), // whatsapp | sms
  kind: text("kind").notNull(), // GSTR-1 | GSTR-3B | GSTR-9 | ITR
  dueDate: text("due_date").notNull(),
  sendAt: timestamp("send_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"), // pending | sent | failed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type CaProfile = typeof caProfiles.$inferSelect;
export type LoanProduct = typeof loanProducts.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
