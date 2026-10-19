/** Static marketing + fallback data (used when DB is not seeded yet). */

const WHATSAPP_NUMBER_ENV = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
export const WHATSAPP_NUMBER = WHATSAPP_NUMBER_ENV?.trim() || "919876543210";

export function waLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* ------------------------------ Loan products ----------------------------- */

export interface LoanProductLite {
  id: number;
  bank: string;
  type: string;
  rateMin: number;
  rateMax: number;
  processingFee: string;
  tenureMaxMonths: number;
  maxAmount: number;
  highlight: string;
  affiliateCode: string;
  affiliateUrl: string;
}

export const LOAN_PRODUCTS_STATIC: LoanProductLite[] = [
  { id: 1, bank: "SBI", type: "home", rateMin: 8.5, rateMax: 9.65, processingFee: "0.35% (max ₹10,000)", tenureMaxMonths: 360, maxAmount: 100_000_000, highlight: "Lowest public-sector rates, nil prepayment penalty", affiliateCode: "TM-SBI-HOME", affiliateUrl: "https://sbi.co.in/web/personal-banking/loans/home-loans?utm_source=taxmitra" },
  { id: 2, bank: "HDFC Bank", type: "home", rateMin: 8.75, rateMax: 9.95, processingFee: "0.5% (max ₹3,300)", tenureMaxMonths: 360, maxAmount: 100_000_000, highlight: "Fast approval, doorstep service", affiliateCode: "TM-HDFC-HOME", affiliateUrl: "https://www.hdfcbank.com/personal/borrow/home-loans?utm_source=taxmitra" },
  { id: 3, bank: "ICICI Bank", type: "home", rateMin: 8.75, rateMax: 9.8, processingFee: "₹2,999 + GST", tenureMaxMonths: 360, maxAmount: 50_000_000, highlight: "Pre-approved for salary account holders", affiliateCode: "TM-ICICI-HOME", affiliateUrl: "https://www.icicibank.com/personal-banking/loans/home-loan?utm_source=taxmitra" },
  { id: 4, bank: "Axis Bank", type: "home", rateMin: 8.75, rateMax: 9.9, processingFee: "1% (min ₹10,000)", tenureMaxMonths: 360, maxAmount: 50_000_000, highlight: "EMI waiver on 12 on-time payments", affiliateCode: "TM-AXIS-HOME", affiliateUrl: "https://www.axisbank.com/retail/loans/home-loan?utm_source=taxmitra" },
  { id: 5, bank: "Kotak Mahindra", type: "home", rateMin: 8.7, rateMax: 9.5, processingFee: "0.5% + GST", tenureMaxMonths: 300, maxAmount: 100_000_000, highlight: "Special rates for women applicants", affiliateCode: "TM-KOTAK-HOME", affiliateUrl: "https://www.kotak.com/en/personal-banking/loans/home-loan.html?utm_source=taxmitra" },
  { id: 6, bank: "Bajaj Finserv", type: "home", rateMin: 8.5, rateMax: 10.5, processingFee: "Up to 4% + GST", tenureMaxMonths: 384, maxAmount: 150_000_000, highlight: "Balance transfer with top-up facility", affiliateCode: "TM-BAJAJ-HOME", affiliateUrl: "https://www.bajajfinserv.in/home-loan?utm_source=taxmitra" },
  { id: 7, bank: "SBI", type: "car", rateMin: 9.1, rateMax: 10.05, processingFee: "0.25% (max ₹5,100)", tenureMaxMonths: 84, maxAmount: 20_000_000, highlight: "Up to 90% on-road funding", affiliateCode: "TM-SBI-CAR", affiliateUrl: "https://sbi.co.in/web/personal-banking/loans/vehicle-loans?utm_source=taxmitra" },
  { id: 8, bank: "HDFC Bank", type: "car", rateMin: 9.3, rateMax: 10.7, processingFee: "₹3,500 – ₹9,000", tenureMaxMonths: 84, maxAmount: 10_000_000, highlight: "100% ex-showroom funding, 30-min approval", affiliateCode: "TM-HDFC-CAR", affiliateUrl: "https://www.hdfcbank.com/personal/borrow/popular-loans/new-car-loan?utm_source=taxmitra" },
  { id: 9, bank: "ICICI Bank", type: "car", rateMin: 9.1, rateMax: 10.98, processingFee: "₹2,500 – ₹5,000", tenureMaxMonths: 84, maxAmount: 10_000_000, highlight: "Instant e-approval for select models", affiliateCode: "TM-ICICI-CAR", affiliateUrl: "https://www.icicibank.com/personal-banking/loans/car-loan?utm_source=taxmitra" },
  { id: 10, bank: "HDFC Bank", type: "personal", rateMin: 10.9, rateMax: 24.0, processingFee: "Up to ₹6,500 + GST", tenureMaxMonths: 72, maxAmount: 4_000_000, highlight: "10-second disbursal for pre-approved users", affiliateCode: "TM-HDFC-PL", affiliateUrl: "https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan?utm_source=taxmitra" },
  { id: 11, bank: "ICICI Bank", type: "personal", rateMin: 10.99, rateMax: 18.5, processingFee: "Up to 2% + GST", tenureMaxMonths: 72, maxAmount: 5_000_000, highlight: "Fixed rate, zero collateral", affiliateCode: "TM-ICICI-PL", affiliateUrl: "https://www.icicibank.com/personal-banking/loans/personal-loan?utm_source=taxmitra" },
  { id: 12, bank: "SBI", type: "personal", rateMin: 11.15, rateMax: 16.6, processingFee: "1% (₹1,000 – ₹15,000)", tenureMaxMonths: 72, maxAmount: 3_500_000, highlight: "Xpress Credit for salaried", affiliateCode: "TM-SBI-PL", affiliateUrl: "https://sbi.co.in/web/personal-banking/loans/personal-loans?utm_source=taxmitra" },
  { id: 13, bank: "Bajaj Finserv", type: "personal", rateMin: 11.0, rateMax: 32.0, processingFee: "Up to 3.93%", tenureMaxMonths: 96, maxAmount: 5_500_000, highlight: "Flexi facility — interest only on used amount", affiliateCode: "TM-BAJAJ-PL", affiliateUrl: "https://www.bajajfinserv.in/personal-loan?utm_source=taxmitra" },
  { id: 14, bank: "SBI", type: "education", rateMin: 8.15, rateMax: 11.75, processingFee: "Nil (Scholar: nil)", tenureMaxMonths: 180, maxAmount: 30_000_000, highlight: "0.5% concession for girl students", affiliateCode: "TM-SBI-EDU", affiliateUrl: "https://sbi.co.in/web/personal-banking/loans/education-loans?utm_source=taxmitra" },
  { id: 15, bank: "Bank of Baroda", type: "education", rateMin: 8.6, rateMax: 11.4, processingFee: "Nil up to ₹7.5L", tenureMaxMonths: 180, maxAmount: 12_500_000, highlight: "Moratorium: course + 1 year", affiliateCode: "TM-BOB-EDU", affiliateUrl: "https://www.bankofbaroda.in/personal-banking/loans/education-loan?utm_source=taxmitra" },
];

/* ------------------------------- CA profiles ------------------------------ */

export interface CaProfileLite {
  id: number;
  name: string;
  firm: string;
  city: string;
  specialties: string[];
  languages: string[];
  rating: number;
  reviews: number;
  priceFrom: number;
  experienceYears: number;
  verified: boolean;
  filingsDone: number;
  avatarColor: string;
}

export const CA_PROFILES_STATIC: CaProfileLite[] = [
  { id: 1, name: "CA Rohan Mehta", firm: "Mehta & Associates", city: "Mumbai", specialties: ["ITR Filing", "Capital Gains"], languages: ["Hindi", "English", "Marathi"], rating: 4.9, reviews: 1320, priceFrom: 799, experienceYears: 14, verified: true, filingsDone: 9200, avatarColor: "#059669" },
  { id: 2, name: "CA Anita Deshpande", firm: "AD Tax Advisors", city: "Pune", specialties: ["ITR Filing", "Freelancers"], languages: ["Hindi", "English", "Marathi"], rating: 4.8, reviews: 980, priceFrom: 499, experienceYears: 9, verified: true, filingsDone: 6100, avatarColor: "#0d9488" },
  { id: 3, name: "CA Vikram Singhania", firm: "Singhania Tax LLP", city: "Delhi", specialties: ["GST", "Audit"], languages: ["Hindi", "English", "Punjabi"], rating: 4.9, reviews: 2100, priceFrom: 1499, experienceYears: 18, verified: true, filingsDone: 15400, avatarColor: "#0369a1" },
  { id: 4, name: "CA Priya Sharma", firm: "Sharma & Co.", city: "Jaipur", specialties: ["ITR Filing", "TDS"], languages: ["Hindi", "English", "Rajasthani"], rating: 4.7, reviews: 640, priceFrom: 499, experienceYears: 7, verified: true, filingsDone: 4300, avatarColor: "#b45309" },
  { id: 5, name: "CA Karthik Iyer", firm: "Iyer Tax Consultants", city: "Chennai", specialties: ["GST", "Company Registration"], languages: ["Tamil", "English", "Hindi"], rating: 4.8, reviews: 870, priceFrom: 999, experienceYears: 11, verified: true, filingsDone: 7200, avatarColor: "#7c3aed" },
  { id: 6, name: "CA Sneha Kulkarni", firm: "Kulkarni Advisors", city: "Bengaluru", specialties: ["ITR Filing", "Salaried", "NRI"], languages: ["Kannada", "English", "Hindi"], rating: 4.9, reviews: 1500, priceFrom: 699, experienceYears: 12, verified: true, filingsDone: 11300, avatarColor: "#db2777" },
  { id: 7, name: "CA Arjun Nair", firm: "Nair & Partners", city: "Kochi", specialties: ["GST", "Small Business"], languages: ["Malayalam", "English"], rating: 4.7, reviews: 430, priceFrom: 599, experienceYears: 8, verified: true, filingsDone: 3100, avatarColor: "#65a30d" },
  { id: 8, name: "CA Farah Khan", firm: "Khan Tax Services", city: "Hyderabad", specialties: ["ITR Filing", "Company Registration"], languages: ["Urdu", "Hindi", "English", "Telugu"], rating: 4.8, reviews: 760, priceFrom: 649, experienceYears: 10, verified: true, filingsDone: 5800, avatarColor: "#dc2626" },
  { id: 9, name: "CA Deepak Agarwal", firm: "Agarwal Gupta & Co.", city: "Indore", specialties: ["GST", "Audit", "Traders"], languages: ["Hindi", "English"], rating: 4.8, reviews: 590, priceFrom: 899, experienceYears: 13, verified: true, filingsDone: 6600, avatarColor: "#0891b2" },
  { id: 10, name: "CA Meera Chatterjee", firm: "Chatterjee Associates", city: "Kolkata", specialties: ["ITR Filing", "Capital Gains", "FO&O"], languages: ["Bengali", "Hindi", "English"], rating: 4.9, reviews: 1040, priceFrom: 749, experienceYears: 15, verified: true, filingsDone: 8900, avatarColor: "#4f46e5" },
];

/* --------------------------- Investment suggestions ----------------------- */

export interface InvestmentOption {
  id: string;
  name: string;
  section: string;
  lockIn: string;
  risk: "Low" | "Moderate" | "High";
  expectedReturn: string;
  bestFor: string;
  partner: string;
  affiliateCode: string;
  affiliateUrl: string;
}

export const INVESTMENT_OPTIONS: InvestmentOption[] = [
  { id: "elss", name: "ELSS Mutual Funds", section: "80C", lockIn: "3 years (shortest)", risk: "High", expectedReturn: "12–15% (market-linked)", bestFor: "Long-term wealth + tax saving", partner: "Groww", affiliateCode: "TM-GROWW-ELSS", affiliateUrl: "https://groww.in/mutual-funds/elss?utm_source=taxmitra" },
  { id: "ppf", name: "Public Provident Fund", section: "80C", lockIn: "15 years", risk: "Low", expectedReturn: "7.1% (govt-backed)", bestFor: "Safe, tax-free compounding", partner: "India Post / Any Bank", affiliateCode: "TM-PPF", affiliateUrl: "https://www.indiapost.gov.in" },
  { id: "nps", name: "National Pension System", section: "80CCD(1B) — extra ₹50k", lockIn: "Till 60 yrs", risk: "Moderate", expectedReturn: "9–11% (market-linked)", bestFor: "Retirement + extra deduction", partner: "Zerodha / KFin", affiliateCode: "TM-NPS", affiliateUrl: "https://zerodha.com/?utm_source=taxmitra" },
  { id: "epf-vpf", name: "EPF / VPF top-up", section: "80C", lockIn: "Till retirement", risk: "Low", expectedReturn: "8.25%", bestFor: "Salaried auto-discipline", partner: "Employer EPFO", affiliateCode: "TM-EPF", affiliateUrl: "https://www.epfindia.gov.in" },
  { id: "ssy", name: "Sukanya Samriddhi Yojana", section: "80C", lockIn: "21 years", risk: "Low", expectedReturn: "8.2% (tax-free)", bestFor: "Girl child below 10 yrs", partner: "India Post", affiliateCode: "TM-SSY", affiliateUrl: "https://www.indiapost.gov.in" },
  { id: "taxfd", name: "Tax-Saver FD (5 yr)", section: "80C", lockIn: "5 years", risk: "Low", expectedReturn: "6.5–7.5%", bestFor: "Senior citizens, zero risk", partner: "HDFC / SBI / ICICI", affiliateCode: "TM-TAXFD", affiliateUrl: "https://www.hdfcbank.com/?utm_source=taxmitra" },
  { id: "health", name: "Health Insurance (Mediclaim)", section: "80D — up to ₹1L", lockIn: "1 year renewable", risk: "Low", expectedReturn: "Protection, not returns", bestFor: "Every family — tax + hospital bills", partner: "Policybazaar", affiliateCode: "TM-PB-HEALTH", affiliateUrl: "https://www.policybazaar.com/health-insurance/?utm_source=taxmitra" },
];

/* -------------------------------- Testimonials ---------------------------- */

export const TESTIMONIALS = [
  { name: "Ramesh Gupta", role: "Kirana store owner · Kanpur", initials: "RG", color: "#059669", quote: "Pehle CA ko ₹3,000 deta tha aur 2 hafte lagte the. TaxMitra GST invoice aur GSTR-3B reminder ne meri life aasan kar di. WhatsApp pe sab kuch milta hai.", stars: 5 },
  { name: "Shreya Iyer", role: "Freelance designer · Bengaluru", initials: "SI", color: "#7c3aed", quote: "New vs old regime comparison showed I'd save ₹42,000 — nobody told me HRA wasn't worth it anymore! Filed my ITR in one chai break.", stars: 5 },
  { name: "Amit Verma", role: "Salaried, IT · Gurugram", initials: "AV", color: "#0369a1", quote: "Form 16 upload kiya, 4 saal pehle ka TDS refund bhi mil gaya. CA review for ₹499 was genuinly worth it. 10/10 recommended to my team.", stars: 5 },
  { name: "Lakshmi Narayanan", role: "Tuition teacher · Coimbatore", initials: "LN", color: "#b45309", quote: "EMI calculator se home loan plan kiya, prepayment se ₹6.2 lakh interest bach gaya. Tamil mein madad mili toh aur bharosa hua.", stars: 4 },
];

export const FAQS = [
  { q: "Kya TaxMitra free hai?", a: "Haan — tax calculator, EMI calculator, GST invoices (50/month tak) and regime comparison are 100% free, forever. Premium (₹499/yr) adds AIS auto-sync, unlimited invoices, priority CA and multi-business profiles." },
  { q: "Is my financial data safe?", a: "We use AES-256 encryption at rest, HTTPS-only transport, and follow DPDP Act 2023 — explicit consent, a personal data vault, and one-tap data deletion from your dashboard. We never sell your identifiable data." },
  { q: "New regime ya old regime — kaunsa better?", a: "FY 2025-26 mein new regime is better for most people earning up to ₹24 lakh with deductions below ~₹4.5 lakh. Our Tax Saver calculator shows your exact breakeven in 30 seconds." },
  { q: "CAs on the marketplace verified kyun maane jaayein?", a: "Every CA is ICAI membership-verified, background-checked and rated after each filing. Payments sit in escrow and release only when your filing is confirmed." },
  { q: "3G / slow phone pe chalega?", a: "Yes. Calculators work offline (PWA), pages are under ~120KB of JS for core tools, and the app is designed mobile-first for budget Android phones." },
];

export const PARTNER_BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak", "Bajaj Finserv", "Bank of Baroda", "PNB", "Yes Bank", "IDFC First"];

export const CA_SERVICES = [
  { id: "itr", label: "ITR Filing", from: 499 },
  { id: "gst", label: "GST Filing", from: 999 },
  { id: "company", label: "Company Registration", from: 4999 },
  { id: "audit", label: "Audit & Compliance", from: 9999 },
];

export const CHAT_SYSTEM_PROMPT = `You are "Mitra", the AI tax assistant inside TaxMitra — India's finance, tax & GST copilot for individual taxpayers and MSMEs.

CONTEXT YOU MUST USE
- Financial Year 2025-26 (AY 2026-27), India.
- New tax regime slabs: 0–₹4L nil; ₹4–8L 5%; ₹8–12L 10%; ₹12–16L 15%; ₹16–20L 20%; ₹20–24L 25%; above ₹24L 30%. Standard deduction ₹75,000 for salaried. Section 87A rebate up to ₹60,000 — total tax capped at ₹60,000 up to ~₹12.75L salaried income (FY 2025-26). 4% Health & Education Cess.
- Old regime: 0–₹2.5L nil; ₹2.5–5L 5%; ₹5–10L 20%; above ₹10L 30% (₹3L/₹5L basic exemption for senior/super-senior citizens). Standard deduction ₹50,000. Deductions: 80C ₹1.5L, 80D health insurance up to ₹1L, 80CCD(1B) NPS ₹50k extra, HRA, 24(b) home-loan interest up to ₹2L.
- GST rates: 0/5/12/18/28%. GSTR-1 due 11th, GSTR-3B due 20th monthly; GSTR-9 annual by 31 Dec.

PERSONALITY & RULES
- Speak in friendly Hinglish by default ("Aap", "bilkul", "chinta mat karo"); switch to pure English or Hindi if the user does.
- Be concise: 2–4 short sentences per reply, then ONE clear next question or action.
- Use ₹ with Indian formatting (₹12,50,000), say lakh/crore.
- Never invent tax rules. If unsure, say so and suggest booking a CA (₹499 onwards).
- Always end complex answers with: "Yeh financial advice nahi hai — final decision se pehle CA se confirm karein."
- Never ask for OTP, passwords, Aadhaar number or full PAN in chat.`;
