import { parseIndianAmount, formatINR, shortINR } from "@/lib/format";
import {
  compareRegimes,
  type IncomeType,
  type TaxComparison,
} from "@/lib/tax";
import { CHAT_SYSTEM_PROMPT } from "@/lib/data";

export { CHAT_SYSTEM_PROMPT };

export type ChatStep =
  | "asked_type"
  | "asked_income"
  | "asked_age"
  | "asked_80c"
  | "asked_80d"
  | "asked_nps"
  | "asked_tds"
  | "done";

export interface ItrState {
  step?: ChatStep;
  incomeType?: IncomeType;
  income?: number;
  age?: number;
  d80C?: number;
  d80D?: number;
  nps?: number;
  tds?: number;
}

export interface ChatResult {
  newTax: number;
  oldTax: number;
  better: "new" | "old";
  savings: number;
  tds: number;
  refundOrDue: number; // +ve refund (after TDS), -ve still payable
  bestRegimeTaxable: number;
  effectiveRate: number;
}

export interface BotResponse {
  text: string;
  quickReplies: string[];
  state: ItrState;
  result?: ChatResult;
  comparison?: TaxComparison;
  link?: { href: string; label: string };
}

const RESTART_WORDS = ["restart", "start over", "reset", "shuru", "dobara", "again"];
const SKIP_WORDS = ["skip", "na", "nahi", "no", "0", "nahin", "pata nahi", "unknown"];

function isRestart(input: string): boolean {
  const s = input.toLowerCase();
  return RESTART_WORDS.some((w) => s.includes(w));
}

function isSkip(input: string): boolean {
  const s = input.toLowerCase().trim();
  return SKIP_WORDS.some((w) => s === w || s.includes(w));
}

function classifyIncomeType(input: string): IncomeType | null {
  const s = input.toLowerCase();
  if (/(salary|salaried|naukri|job|employee|form ?16)/.test(s)) return "salary";
  if (/(business|dukaan|vyapar|shop|kirana|trader)/.test(s)) return "business";
  if (/(freelance|professional|consult|gig|practice)/.test(s)) return "professional";
  if (/(multiple|both|dono|mix)/.test(s)) return "salary";
  return null;
}

function classifyAge(input: string): number | null {
  const s = input.toLowerCase();
  const num = parseInt(s.replace(/[^\d]/g, "") || "");
  if (/80|super/.test(s)) return 82;
  if (/60|senior/.test(s)) return 65;
  if (!isNaN(num) && num >= 18 && num <= 100) return num;
  if (/18|young|below 60/.test(s)) return 30;
  return null;
}

export function botGreeting(): BotResponse {
  return {
    text: "Namaste! Main hoon Mitra — aapka AI tax assistant. FY 2025-26 ke hisaab se aapka exact tax nikalta hoon. Pehle batayiye: aapki income kis type ki hai?",
    quickReplies: ["Salaried (job)", "Business / dukaan", "Freelancer / professional", "Multiple sources"],
    state: { step: "asked_type" },
  };
}

export function respond(state: ItrState, rawInput: string): BotResponse {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  if (isRestart(lower)) return botGreeting();

  // Global intents
  if (state.step === undefined) {
    if (/(gst|invoice|gstr)/.test(lower))
      return {
        text: "GST ke liye humara free invoice generator + GSTR reminder tool try karein — CGST/SGST/IGST auto-calculate hota hai aur invoice WhatsApp pe 1-tap share hota hai.",
        quickReplies: ["Start ITR instead"],
        state: { step: "asked_type" },
        link: { href: "/gst", label: "Open GST tool" },
      };
    if (/(loan|emi)/.test(lower))
      return {
        text: "Loans compare karna hai? 6+ banks ke real rates, EMI calculator aur amortization schedule ready hai.",
        quickReplies: ["Start ITR instead"],
        state: { step: "asked_type" },
        link: { href: "/loans", label: "Compare loans" },
      };
    return botGreeting();
  }

  switch (state.step) {
    case "asked_type": {
      const t = classifyIncomeType(input);
      if (!t)
        return {
          text: "Ek second — options mein se choose kar lijiye: salaried, business, ya freelancer? (Form 16 milta hai toh 'Salaried' select karein.)",
          quickReplies: ["Salaried (job)", "Business / dukaan", "Freelancer / professional"],
          state,
        };
      return {
        text:
          t === "salary"
            ? "Perfect. Ab aapki annual gross salary batayiye (Form 16 mein 'Gross Salary' wala figure). Approx chalega — jaise '8.5L' ya '₹12,00,000'."
            : "Theek hai. Ab FY 2025-26 ki annual income (gross, GST ke bina) batayiye. Approx bhi chalega — jaise '6L' ya '₹9,50,000'.",
        quickReplies: ["₹6 L", "₹10 L", "₹15 L", "₹25 L"],
        state: { ...state, incomeType: t, step: "asked_income" },
      };
    }
    case "asked_income": {
      const amt = parseIndianAmount(input);
      if (!amt || amt < 20_000 || amt > 100_000_000)
        return {
          text: "Hmm, ye number samajh nahi aaya. Kripya annual income likhiye — jaise '12 lakh', '₹8,50,000' ya '75k/month'.",
          quickReplies: ["₹6 L", "₹10 L", "₹15 L", "₹25 L"],
          state,
        };
      const income = input.toLowerCase().includes("month") ? amt * 12 : amt;
      return {
        text: `Got it — annual income ${formatINR(income)}. Aapki age group kya hai? (Senior citizens ko old regime mein zyada basic exemption milta hai.)`,
        quickReplies: ["18–59 years", "60–79 years (senior)", "80+ (super senior)"],
        state: { ...state, income, step: "asked_age" },
      };
    }
    case "asked_age": {
      const age = classifyAge(input);
      if (!age)
        return {
          text: "Age group select kar dijiye — senior citizen benefits ke liye zaroori hai.",
          quickReplies: ["18–59", "60–79", "80+"],
          state,
        };
      return {
        text: "Noted. Ab 80C investments batayiye — PPF, ELSS, EPF, LIC premium, home-loan principal, tuition fees sab mila kar kitna? (max fayda ₹1.5L tak)",
        quickReplies: ["₹0", "₹50,000", "₹1,00,000", "₹1.5 L (max)"],
        state: { ...state, age, step: "asked_80c" },
      };
    }
    case "asked_80c": {
      const v = isSkip(input) ? 0 : parseIndianAmount(input) ?? 0;
      return {
        text: `80C: ${formatINR(Math.min(v, 150_000))}${v > 150_000 ? " (₹1.5L cap lagaya — extra ka fayda nahi milta)" : ""}. Ab health insurance premium (80D) — self + family + parents?`,
        quickReplies: ["₹0", "₹10,000", "₹25,000", "₹50,000"],
        state: { ...state, d80C: v, step: "asked_80d" },
      };
    }
    case "asked_80d": {
      const v = isSkip(input) ? 0 : parseIndianAmount(input) ?? 0;
      return {
        text: "Done. NPS mein kitna daala (80CCD(1B) — extra ₹50k deduction)? Na ho toh 0 likhiye.",
        quickReplies: ["₹0", "₹25,000", "₹50,000"],
        state: { ...state, d80D: v, step: "asked_nps" },
      };
    }
    case "asked_nps": {
      const v = isSkip(input) ? 0 : parseIndianAmount(input) ?? 0;
      return {
        text: "Last step! Form 16 / salary slips ke hisaab se total TDS kitna kata? Approx bhi theek hai.",
        quickReplies: ["₹0", "₹25,000", "₹50,000", "₹1,00,000"],
        state: { ...state, nps: v, step: "asked_tds" },
      };
    }
    case "asked_tds":
    case "done": {
      const tds = isSkip(input) ? (state.tds ?? 0) : (parseIndianAmount(input) ?? state.tds ?? 0);
      const cmp = compareRegimes({
        income: state.income ?? 0,
        age: state.age ?? 30,
        incomeType: state.incomeType ?? "salary",
        d80C: state.d80C ?? 0,
        d80D: state.d80D ?? 0,
        nps: state.nps ?? 0,
      });
      const best = cmp.better === "new" ? cmp.newRegime : cmp.oldRegime;
      const refundOrDue = tds - best.totalTax;
      const result: ChatResult = {
        newTax: cmp.newRegime.totalTax,
        oldTax: cmp.oldRegime.totalTax,
        better: cmp.better,
        savings: cmp.savings,
        tds,
        refundOrDue,
        bestRegimeTaxable: best.taxableIncome,
        effectiveRate: best.effectiveRate,
      };
      const betterLabel = cmp.better === "new" ? "NEW regime" : "OLD regime";
      const refundLine =
        refundOrDue > 0
          ? `Aapko approx ${formatINR(refundOrDue)} REFUND milega (TDS zyada kata hai).`
          : refundOrDue < 0
            ? `${formatINR(-refundOrDue)} aur tax dena hoga (advance/self-assessment tax).`
            : "TDS bilkul perfect kata gaya hai — na refund, na due.";
      return {
        text: `Aapka FY 2025-26 estimate ready hai!\n\nNew regime tax: ${formatINR(cmp.newRegime.totalTax)}\nOld regime tax: ${formatINR(cmp.oldRegime.totalTax)}\n\nRecommendation: ${betterLabel} — aap ${shortINR(cmp.savings)} bacha sakte hain. ${refundLine}\n\nYeh financial advice nahi hai — final filing se pehle CA review recommended hai (₹499 se).`,
        quickReplies: ["Book CA review ₹499", "Full calculator dekho", "Restart"],
        state: { ...state, tds, step: "done" },
        result,
        comparison: cmp,
        link: { href: "/ca-marketplace", label: "Book CA review" },
      };
    }
  }
}
