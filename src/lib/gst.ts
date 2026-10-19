/** GST utilities: tax split, GSTIN validation, HSN samples, filing calendar. */

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
];

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateGstin(gstin: string): {
  valid: boolean;
  stateCode?: string;
  stateName?: string;
} {
  const g = gstin.trim().toUpperCase();
  if (!GSTIN_REGEX.test(g)) return { valid: false };
  const code = g.slice(0, 2);
  const st = INDIAN_STATES.find((s) => s.code === code);
  return { valid: true, stateCode: code, stateName: st?.name };
}

export interface InvoiceItem {
  name: string;
  hsn?: string;
  qty: number;
  rate: number; // unit price ex-GST
  gstRate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  interState: boolean;
}

export function computeInvoiceTotals(
  items: InvoiceItem[],
  sellerStateCode: string,
  buyerStateCode: string
): InvoiceTotals {
  const interState = sellerStateCode !== buyerStateCode;
  let subtotal = 0;
  let tax = 0;
  for (const it of items) {
    const line = it.qty * it.rate;
    subtotal += line;
    tax += (line * it.gstRate) / 100;
  }
  const cgst = interState ? 0 : tax / 2;
  const sgst = interState ? 0 : tax / 2;
  const igst = interState ? tax : 0;
  return {
    interState,
    subtotal: Math.round(subtotal * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    total: Math.round((subtotal + tax) * 100) / 100,
  };
}

export interface HsnEntry {
  code: string;
  name: string;
  rate: number;
}

export const HSN_LOOKUP: HsnEntry[] = [
  { code: "1006", name: "Rice", rate: 5 },
  { code: "1101", name: "Wheat / Maida Flour (branded)", rate: 5 },
  { code: "1701", name: "Sugar", rate: 5 },
  { code: "1512", name: "Edible Oil (refined)", rate: 5 },
  { code: "0401", name: "Milk & Curd (fresh)", rate: 0 },
  { code: "1905", name: "Biscuits & Bakery", rate: 18 },
  { code: "3401", name: "Soaps & Detergents", rate: 18 },
  { code: "3004", name: "Medicines (formulations)", rate: 12 },
  { code: "4901", name: "Books & Printed Material", rate: 0 },
  { code: "6109", name: "Apparel (per piece ≤ ₹1000)", rate: 5 },
  { code: "6109A", name: "Apparel (per piece > ₹1000)", rate: 12 },
  { code: "6403", name: "Footwear (≤ ₹1000)", rate: 5 },
  { code: "8517", name: "Mobile Phones", rate: 18 },
  { code: "8471", name: "Laptops & Computers", rate: 18 },
  { code: "2523", name: "Cement", rate: 28 },
  { code: "7214", name: "Steel Bars & Rods", rate: 18 },
  { code: "8501", name: "Electric Motors / Fans", rate: 18 },
  { code: "998311", name: "Consulting / Professional Services (SAC)", rate: 18 },
  { code: "9963", name: "Restaurant / Food Services (SAC)", rate: 5 },
  { code: "9954", name: "Construction Services (SAC)", rate: 18 },
];

export interface GstDeadline {
  form: string;
  label: string;
  due: Date;
  frequency: string;
}

/**
 * Build a date at `day` of the month, pushing to the next business day
 * when the nominal deadline falls on a weekend (standard GST practice —
 * e.g. GSTR-1 on the 11th moves to Monday when the 11th is a Saturday).
 */
function businessDay(y: number, m: number, day: number): Date {
  let d = new Date(y, m, day);
  while (d.getDay() === 0 || d.getDay() === 6) d = new Date(d.getTime() + 86_400_000);
  return d;
}

export function nextGstDeadlines(from = new Date()): GstDeadline[] {
  const list: GstDeadline[] = [];
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const y = from.getFullYear();
  const m = from.getMonth();
  for (const [form, day, freq] of [
    ["GSTR-1", 11, "Monthly · outward supplies"],
    ["GSTR-3B", 20, "Monthly · summary return & tax payment"],
    ["ITR (individuals)", 31, "ITR deadline (individuals · extended limit)"],
  ] as const) {
    let d = businessDay(y, m, day);
    if (d < today) d = businessDay(y, m + 1, day);
    list.push({ form, label: freq, due: d, frequency: "monthly" });
    // also add next month occurrence
    list.push({
      form,
      label: freq,
      due: businessDay(d.getFullYear(), d.getMonth() + 1, day),
      frequency: "monthly",
    });
  }
  const fyStart = from.getMonth() >= 3 ? y : y - 1;
  list.push({
    form: "GSTR-9",
    label: "Annual return (FY filing)",
    due: businessDay(fyStart + 1, 11, 31),
    frequency: "annual",
  });
  list.push({
    form: "GSTR-4",
    label: "Composition dealers (annual)",
    due: businessDay(fyStart + 1, 3, 30),
    frequency: "annual",
  });
  return list.sort((a, b) => a.due.getTime() - b.due.getTime());
}

/** ITR deadline (individuals) for the current assessment year. */
export function itrDeadline(from = new Date()): Date {
  // 1 Jan – 31 Mar belongs to the previous AY; deadline 31 Jul of that AY year.
  const ayYear = from.getMonth() < 3 ? from.getFullYear() - 1 : from.getFullYear();
  return businessDay(ayYear, 6, 31);
}
