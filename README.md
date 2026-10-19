# TaxMitra — Aapka Tax, Aapka AI

AI-powered Finance, Tax & GST platform for India's 10 Cr+ individual taxpayers and 6 Cr+ MSMEs.
Trust-first fintech design (Zerodha × ClearTax × Razorpay), Hinglish voice, mobile-first for ₹6,000 Androids on 3G.

## What's inside

| Route | Feature |
|---|---|
| `/` | Landing with EN/हिंदी/Hinglish toggle, WhatsApp CTA, pricing, testimonials |
| `/tax-saver` | FY 2025-26 tax calculator — new vs old regime, 87A marginal relief, 5-yr projection, optimizer + ranked investments |
| `/loans` | EMI + amortization (CSV export), 15 bank products, prepayment savings, CIBIL estimator, eligibility lead-gen |
| `/itr` | Mitra AI chatbot (state machine + optional LLM polish), Form 16 OCR upload (beta), progress tracker, CA handoff |
| `/gst` | GST invoice generator (GSTIN validation, HSN lookup, CGST/SGST/IGST), 1-tap WhatsApp/SMS/Email/PDF, GSTR calendar + reminders, ITC tracker |
| `/ca-marketplace` | 10 verified CA profiles, filters, escrow booking flow (15–20% commission model) |
| `/dashboard` | Session auth, Tax Health Score, deadlines, saved calcs, doc vault, referrals |
| `/premium` | ₹499/yr + ₹999/mo plans, Razorpay checkout (demo mode without keys) |
| `/admin` | Ops stats + escrow commission view (`?key=ADMIN_KEY`, default `admin-local`) |
| `/api/cron/gst-reminders` | Daily cron → WhatsApp/SMS reminders (Gupshup/Interakt hook) |

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**, Framer Motion, Recharts, lucide-react
- **PostgreSQL + Drizzle ORM** (`src/db/schema.ts`: users, sessions, ca_profiles, loan_products, tax_slabs, invoices, calculations, bookings, referrals, ref_events, reminders)
- Auth: scrypt-hashed passwords + httpOnly session cookies
- PWA: `public/sw.js` caches the calculators → offline-first
- Affiliate attribution: `src/proxy.ts` (`?ref=`) + `/api/track` beacon

## Setup

```bash
npm install
cp .env.example .env            # or set vars below
npx drizzle-kit push            # create tables
npx tsx scripts/seed.ts         # 10 CAs, 15 loan products, FY 25-26 slabs, demo user
npm run dev
```

Demo login: **demo@taxmitra.in / demo1234**

## Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `OPENAI_API_KEY` (+`OPENAI_MODEL`) | Optional — LLM polish for the ITR chatbot (structured rule engine works without it) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Live payments (`/api/checkout` returns demo orders without them) |
| `WHATSAPP_API_KEY` / `WHATSAPP_API_URL` | Gupshup/Interakt for reminder cron |
| `CRON_SECRET` | Protects `/api/cron/gst-reminders` (header `x-cron-secret` or `?secret=`) |
| `ADMIN_KEY` | `/admin` access |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Business WhatsApp for CTAs |

## Deploy (Vercel)

`vercel.json` ships with `bom1` region + daily cron (`0 4 * * *` = 09:30 IST).
Add env vars in the Vercel dashboard, point a Postgres instance (Neon/Supabase/RDS) at `DATABASE_URL`, run `drizzle-kit push`, deploy. Put Cloudflare in front for CDN + WAF.

**Zero-env deploy mode:** the app also ships to production with *no* `DATABASE_URL` at all — it runs in static mode (offline calculators, seeded/static data, PWA) and every DB-backed route degrades gracefully to its static fallback. Add `DATABASE_URL` later to switch on users, invoices, bookings and reminders without a redeploy-breaking change.

## Go-live checklist

- [ ] `.env` from `.env.example` (only `DATABASE_URL` + WhatsApp/Razorpay keys needed for v1)

- [ ] Real WhatsApp Business number + provider keys (Interakt/Gupshup)
- [ ] Razorpay KYC'd production keys (+ webhook → release escrow)
- [ ] CA KYC flow: ICAI membership verification queue
- [ ] Storage bucket with SSE (AES-256) for uploaded Form 16/26AS
- [x] Static-mode fallback (no `DATABASE_URL` required; DB routes degrade gracefully)
- [ ] PostHog + GA4 (`NEXT_PUBLIC_POSTHOG_KEY`, data-layer events on CTAs)
- [ ] next-intl full rollout: 6 more regional languages
- [ ] DPDP consent log + data-deletion SLA automation (currently email + 72h manual)
- [ ] Lighthouse CI budget: >90 mobile, LCP <2s on 3G
- [ ] Programmatic SEO pages: `ITR filing FY 2025-26`, `GST rate for <product>`, `EMI for <amount>`

## Compliance

Every page carries the disclaimer: **“Not financial advice. Consult a CA.”**
FY 2025-26 rules implemented: new-regime slabs (0–4L nil … >24L 30%), ₹75k standard deduction, §87A rebate ₹60k ≤₹12L taxable + marginal relief, 4% cess, surcharge tiers, old-regime deductions (80C/80D/80CCD(1B)/HRA/24b). GST rates 0/5/12/18/28%.
