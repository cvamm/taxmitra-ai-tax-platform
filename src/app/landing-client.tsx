"use client";

import Link from "next/link";
import { motion } from "@/components/motion-lite";
import {
  ArrowRight,
  BadgeCheck,
  BotMessageSquare,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  FileText,
  Landmark,
  Languages,
  Lock,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ButtonLink, Card, Pill, SectionHeading } from "@/components/ui";
import Reveal from "@/components/reveal";
import Tilt3D from "@/components/tilt-3d";
import HeroScene from "@/components/hero-scene";
import { FAQS, PARTNER_BANKS, TESTIMONIALS, waLink } from "@/lib/data";

const FEATURES = [
  {
    href: "/itr",
    icon: BotMessageSquare,
    color: "from-emerald-500 to-teal-600",
    chip: "AI Chat + Form 16 OCR",
    title: "ITR Filing Helper",
    desc: "Conversational AI poochh-taach karta hai — income, deductions, TDS — aur 5 minute mein ITR-ready estimate deta hai. CA handoff ₹499 se.",
  },
  {
    href: "/tax-saver",
    icon: Calculator,
    color: "from-amber-500 to-orange-600",
    chip: "Most loved",
    title: "Tax Saving Calculator",
    desc: "New vs old regime ka exact comparison, 80C/80D/NPS optimizer aur ELSS-PPF-NPS suggestions ranked by returns.",
  },
  {
    href: "/loans",
    icon: Landmark,
    color: "from-sky-500 to-blue-600",
    chip: "15 live bank products",
    title: "Loan & EMI Calculator",
    desc: "HDFC, SBI, ICICI, Axis, Kotak, Bajaj ke real rates compare karein. EMI, amortization, prepayment savings aur CIBIL estimator.",
  },
  {
    href: "/gst",
    icon: Receipt,
    color: "from-violet-500 to-purple-600",
    chip: "For 6 Cr+ MSMEs",
    title: "GST Invoice + Reminders",
    desc: "GSTIN auto-validate, HSN lookup, CGST/SGST/IGST auto-split, 1-tap WhatsApp share aur GSTR-1/3B/9 WhatsApp reminders.",
  },
];

const STATS = [
  { value: "10 Cr+", label: "taxpayers in India" },
  { value: "6 Cr+", label: "MSMEs & shops" },
  { value: "₹210 Cr+", label: "tax saved by users" },
  { value: "4.8 / 5", label: "avg. CA rating" },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Har taxpayer ke liye",
    features: ["Tax & EMI calculators (offline)", "50 GST invoices / month", "Regime comparison + AI chat", "GSTR due-date calendar"],
    cta: "Start free",
    href: "/tax-saver",
    highlight: false,
  },
  {
    name: "Premium",
    price: "₹499",
    period: "/ year",
    tagline: "Smart tax planning",
    features: ["Everything in Free", "AIS / 26AS auto-sync", "Unlimited invoices + e-sign", "Priority CA chat", "Advanced tax planning reports"],
    cta: "Go Premium",
    href: "/premium",
    highlight: true,
  },
  {
    name: "MSME Suite",
    price: "₹999",
    period: "/ month",
    tagline: "Business ke liye SaaS",
    features: ["Multi-user + multi-GSTIN", "Tally / Zoho sync", "Payroll + inventory", "ITC reconciliation", "Dedicated CA partner"],
    cta: "Talk to sales",
    href: "/premium#sme",
    highlight: false,
  },
];

export default function LandingClient() {
  const { t } = useI18n();

  return (
    <div className="overflow-x-clip">
      {/* ================================ HERO ================================ */}
      <section className="relative bg-slate-950 text-white">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -top-32 left-1/2 h-96 w-[110%] -translate-x-1/2 rounded-[100%] bg-emerald-500/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20 lg:pb-24">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> {t("hero_badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-[34px] leading-[1.12] font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]"
            >
              {t("hero_title_a")}{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                {t("hero_title_b")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-300 sm:text-base"
            >
              {t("hero_sub")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <ButtonLink href="/tax-saver" size="lg">
                {t("hero_cta1")} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={waLink("Namaste TaxMitra! Mujhe ITR file karna hai.")} variant="whatsapp" size="lg">
                <MessageCircle className="h-5 w-5" /> {t("hero_cta2")}
              </ButtonLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] font-semibold text-slate-400"
            >
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-400" /> 10 Cr+ {t("trust_taxpayers")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-emerald-400" /> 6 Cr+ {t("trust_msme")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-400" /> {t("trust_ca")}
              </span>
            </motion.div>
          </div>

          {/* 3D layered tax-health device */}
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <HeroScene />
          </motion.div>
        </div>

        {/* Partner marquee */}
        <div className="relative border-t border-white/10 py-5">
          <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-hidden px-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-marquee flex shrink-0 items-center gap-10">
              {[...PARTNER_BANKS, ...PARTNER_BANKS].map((b, i) => (
                <span key={i} className="flex items-center gap-2 text-[13px] font-bold tracking-wide whitespace-nowrap text-slate-500">
                  <Landmark className="h-4 w-4 text-slate-600" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[12.5px] font-semibold text-slate-500">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section className="light-grid bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <SectionHeading kicker="4 free tools" title={t("feat_title")} sub={t("feat_sub")} />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.href} delay={i * 0.07}>
                <div className="h-full [perspective:1200px]">
                  <Tilt3D maxTilt={5.5} className="h-full">
                    <Link
                      href={f.href}
                      className="group block h-full rounded-2xl transition-[box-shadow] duration-300"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Card className="h-full p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-[0_24px_60px_-24px_rgba(5,150,105,0.4)]">
                        <div className="flex items-start justify-between" style={{ transform: "translateZ(24px)" }}>
                          <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                            <f.icon className="h-6 w-6" strokeWidth={2.1} />
                          </span>
                          <Pill tone="slate" className="text-[10.5px]">{f.chip}</Pill>
                        </div>
                        <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{f.title}</h3>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{f.desc}</p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700">
                          Try free <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </Card>
                    </Link>
                  </Tilt3D>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Reveal delay={0.05}>
              <Link href="/ca-marketplace" className="group block">
                <Card className="flex h-full items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
                    <BadgeCheck className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[15px] font-extrabold text-slate-900">CA Marketplace</p>
                    <p className="text-[12.5px] text-slate-500">ICAI-verified CAs · escrow payment · ₹499 se start</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </Card>
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/dashboard" className="group block">
                <Card className="flex h-full items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[15px] font-extrabold text-slate-900">Tax Health Dashboard</p>
                    <p className="text-[12.5px] text-slate-500">Score 0–100 · deadlines · docs vault · referrals</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </Card>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="3 simple steps"
            title="Chai banne se pehle ITR ready"
            sub="No CA jargon. No 40-field forms. Bas simple sawaal, seedha jawaab."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: MessageCircle, step: "Step 1", title: "WhatsApp ya app pe baat karein", desc: "AI Hindi, English ya Hinglish mein poochhta hai — income type, 80C, TDS. Form 16 photo bhej dijiye, OCR values bhar dega." },
            { icon: Sparkles, step: "Step 2", title: "AI sab kuch compute karta hai", desc: "FY 2025-26 slabs, 87A rebate, marginal relief, cess — sab live. New vs old regime ka exact rupee-level comparison." },
            { icon: FileText, step: "Step 3", title: "CA verify karta hai, aap relax", desc: "ICAI-verified CA review (₹499 se). Escrow payment — kaam poora hone par hi paise release. Refund tracking included." },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 0.08}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
                <span className="absolute top-5 right-5 text-[11px] font-extrabold tracking-widest text-slate-200 uppercase">{s.step}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 [transform:translateZ(18px)]">
                  <s.icon className="h-6 w-6" strokeWidth={2.1} />
                </span>
                <h3 className="mt-4 text-[17px] font-extrabold tracking-tight text-slate-900">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ TESTIMONIALS ============================ */}
      <section className="border-y border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <SectionHeading kicker="Bharat bhar se" title="Dukaan se desk tak — sabki kahaani" />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {TESTIMONIALS.map((ts, i) => (
              <Reveal key={ts.name} delay={i * 0.06}>
                <Card className="h-full p-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < ts.stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-slate-700">&ldquo;{ts.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full text-[13px] font-extrabold text-white"
                      style={{ backgroundColor: ts.color }}
                    >
                      {ts.initials}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-slate-900">{ts.name}</p>
                      <p className="text-[12px] text-slate-400">{ts.role}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== PRICING ============================== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24" id="pricing">
        <Reveal>
          <SectionHeading kicker="Simple pricing" title="Itna sasta ki CA bhi impress" />
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 ${p.highlight ? "border-emerald-500 bg-slate-950 text-white shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-900/40" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"}`}
              >
                {p.highlight && (
                  <Pill tone="amber" className="absolute -top-3 left-5">Most popular</Pill>
                )}
                <p className={`text-[13px] font-bold tracking-widest uppercase ${p.highlight ? "text-emerald-400" : "text-slate-400"}`}>{p.name}</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                  <span className={`text-[13px] font-semibold ${p.highlight ? "text-slate-400" : "text-slate-400"}`}>{p.period}</span>
                </div>
                <p className={`mt-1 text-[12.5px] ${p.highlight ? "text-slate-400" : "text-slate-500"}`}>{p.tagline}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] font-medium">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span className={p.highlight ? "text-slate-200" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink href={p.href} variant={p.highlight ? "amber" : "outline"} className="mt-6 w-full">
                  {p.cta}
                </ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================================ FAQ ================================ */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal>
            <SectionHeading kicker="FAQ" title="Sawaal? Jawaab ready." />
          </Reveal>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:border-emerald-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-bold text-slate-800 marker:hidden">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FINAL CTA ============================== */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
              <Lock className="h-3.5 w-3.5" /> DPDP 2023 compliant · AES-256 encrypted
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-[2.6rem] sm:leading-tight">
              Tax ka tension khatam. <span className="text-emerald-300">Aaj hi shuru karein — free.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-slate-300">
              2 minute mein apna regime comparison dekhein. Koi card nahi, koi signup nahi — calculators seedha khulte hain.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/tax-saver" size="lg">
                <Calculator className="h-5 w-5" /> Tax Saver kholein
              </ButtonLink>
              <ButtonLink href={waLink("Namaste! Tax planning start karni hai.")} variant="whatsapp" size="lg">
                <MessageCircle className="h-5 w-5" /> WhatsApp pe baat karein
              </ButtonLink>
            </div>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> Works on 3G + ₹6,000 Android</span>
              <span className="inline-flex items-center gap-1.5"><Languages className="h-4 w-4" /> Hindi · English · Hinglish</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> CA-verified</span>
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
