"use client";

/**
 * Lightweight language context: English (en) / हिंदी (hi) / Hinglish (hing).
 * Covers landing-page & navigation copy; tool pages stay English-first in v1.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi" | "hing";

const STRINGS: Record<string, Record<Lang, string>> = {
  nav_itr: { en: "ITR Filing", hi: "आईटीआर फाइलिंग", hing: "ITR Filing" },
  nav_tax: { en: "Tax Saver", hi: "टैक्स सेवर", hing: "Tax Saver" },
  nav_loans: { en: "Loans & EMI", hi: "लोन और EMI", hing: "Loans & EMI" },
  nav_gst: { en: "GST for Shops", hi: "दुकानों के लिए GST", hing: "GST for Shops" },
  nav_ca: { en: "CA Marketplace", hi: "CA मार्केटप्लेस", hing: "CA Marketplace" },
  nav_dashboard: { en: "Dashboard", hi: "डैशबोर्ड", hing: "Dashboard" },
  nav_signin: { en: "Sign in", hi: "साइन इन", hing: "Sign in" },
  nav_cta: { en: "Start free", hi: "फ्री शुरू करें", hing: "Free shuru karein" },

  hero_badge: {
    en: "CA-verified · Made for Bharat",
    hi: "CA-सत्यापित · भारत के लिए बना",
    hing: "CA-verified · Bharat ke liye bana",
  },
  hero_title_a: {
    en: "Your Tax, Your AI —",
    hi: "आपका टैक्स, आपका AI —",
    hing: "Aapka Tax, Aapka AI —",
  },
  hero_title_b: {
    en: "ITR ready in 5 minutes",
    hi: "5 मिनट में ITR तैयार",
    hing: "5 minute mein ITR ready",
  },
  hero_sub: {
    en: "The AI finance, tax & GST platform for 10 Cr+ taxpayers and 6 Cr+ MSMEs. Compare regimes, save tax, file returns and get CA-verified help — all in one app.",
    hi: "10 करोड़+ करदाताओं और 6 करोड़+ MSMEs के लिए AI फाइनेंस, टैक्स और GST प्लेटफ़ॉर्म। रजीम तुलना करें, टैक्स बचाएं, रिटर्न फाइल करें और CA की मदद पाएं।",
    hing: "10 Cr+ taxpayers aur 6 Cr+ MSMEs ka AI tax & GST platform. Regime compare karo, tax bachao, return file karo — sab ek jagah, CA-verified.",
  },
  hero_cta1: {
    en: "Calculate my tax free",
    hi: "मेरा टैक्स फ्री जानें",
    hing: "Mera tax free check karo",
  },
  hero_cta2: {
    en: "File ITR on WhatsApp",
    hi: "WhatsApp पर ITR फाइल करें",
    hing: "WhatsApp pe ITR file karo",
  },
  trust_taxpayers: { en: "taxpayers in India", hi: "करदाता भारत में", hing: "taxpayers India mein" },
  trust_msme: { en: "MSMEs & shops", hi: "MSMEs और दुकानें", hing: "MSMEs & shops" },
  trust_ca: { en: "CA-verified advice", hi: "CA-सत्यापित सलाह", hing: "CA-verified advice" },
  feat_title: {
    en: "Everything your money needs",
    hi: "आपके पैसों की हर ज़रूरत",
    hing: "Paise ki har zaroorat, ek app",
  },
  feat_sub: {
    en: "From salaried employees to kirana stores — tools built for Indian tax rules, updated for FY 2025-26.",
    hi: "नौकरीपेशा से लेकर किराना स्टोर तक — भारतीय टैक्स नियमों के लिए बने टूल्स, FY 2025-26 के लिए अपडेटेड।",
    hing: "Salaried se kirana store tak — Indian tax rules ke liye bane tools, FY 2025-26 updated.",
  },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof STRINGS | string) => string;
}

// "en" default: SSR + first client render agree, so there is no
// hydration mismatch; a saved preference is applied post-paint.
const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("tm-lang") as Lang | null;
    if (saved && ["en", "hi", "hing"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("tm-lang", l);
    } catch {}
  };

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      setLang,
      t: (key) => STRINGS[key]?.[lang] ?? STRINGS[key]?.en ?? String(key),
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): LangCtx {
  return useContext(Ctx);
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const opts: { id: Lang; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "hi", label: "हिं" },
    { id: "hing", label: compact ? "Hing" : "Hinglish" },
  ];
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === o.id ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
