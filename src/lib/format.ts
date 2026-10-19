/** Indian number + currency formatting helpers (lakh / crore system). */

const inrFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹12,34,567 */
export function formatINR(n: number): string {
  return inrFmt.format(Math.round(n));
}

/** 12,34,567 (no symbol) */
export function formatNum(n: number): string {
  return numFmt.format(Math.round(n));
}

/** ₹12.35 L / ₹1.24 Cr / ₹45,000 */
export function shortINR(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${trim2(n / 1e7)} Cr`;
  if (abs >= 1e5) return `₹${trim2(n / 1e5)} L`;
  return formatINR(n);
}

function trim2(v: number): string {
  return v
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

/** Parse desi amounts: "12L", "12 lakh", "₹12,00,000", "1.2 crore", "50k" */
export function parseIndianAmount(raw: string): number | null {
  if (!raw) return null;
  let s = String(raw).toLowerCase().replace(/[₹,\s]/g, "");
  let mult = 1;
  if (/(crore|cr)$/.test(s)) {
    mult = 1e7;
    s = s.replace(/(crore|cr)$/, "");
  } else if (/(lakh|lakhs|lac|lacs|l)$/.test(s)) {
    mult = 1e5;
    s = s.replace(/(lakh|lakhs|lac|lacs|l)$/, "");
  } else if (/k$/.test(s)) {
    mult = 1e3;
    s = s.replace(/k$/, "");
  }
  const v = parseFloat(s);
  if (isNaN(v) || v < 0) return null;
  return Math.round(v * mult);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function daysUntil(date: Date, from = new Date()): number {
  const ms = date.getTime() - stripTime(from).getTime();
  return Math.ceil(ms / 86_400_000);
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
