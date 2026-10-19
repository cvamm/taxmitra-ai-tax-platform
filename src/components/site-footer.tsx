import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { WHATSAPP_NUMBER, waLink } from "@/lib/data";

const TOOLS = [
  { href: "/itr", label: "ITR Filing Helper" },
  { href: "/tax-saver", label: "Tax Saving Calculator" },
  { href: "/loans", label: "Loan & EMI Calculator" },
  { href: "/gst", label: "GST Invoice Generator" },
  { href: "/ca-marketplace", label: "CA Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/premium", label: "Premium ₹499/yr" },
];

const LEGAL = [
  { href: "/premium#privacy", label: "Privacy & DPDP 2023" },
  { href: "/premium#terms", label: "Terms of Use" },
  { href: "/premium#refunds", label: "Refund Policy" },
  { href: "/dashboard#data", label: "Delete my data" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="text-[19px] font-extrabold tracking-tight text-slate-900">
                Tax<span className="text-emerald-600">Mitra</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-slate-500">
              India ka apna AI tax companion — ITR, GST, loans and savings for 10 Cr+ taxpayers and 6 Cr+ MSMEs.
            </p>
            <a
              href={waLink("Namaste! Mujhe ITR file karna hai.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp: +91 {WHATSAPP_NUMBER.slice(2)}
            </a>
          </div>

          <nav aria-label="Tools">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Tools</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] font-medium text-slate-600">
              {TOOLS.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-emerald-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Legal & Trust</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] font-medium text-slate-600">
              {LEGAL.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-emerald-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold tracking-widest text-amber-800 uppercase">Disclaimer</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-amber-900/90">
              TaxMitra is a technology platform, not a financial adviser. All calculations are estimates
              based on FY 2025-26 rules. <strong>Not financial advice — please consult a Chartered
              Accountant</strong> before making tax or investment decisions. Banking/insurance partners
              are independent entities; we may earn referral fees.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-[12.5px] text-slate-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} TaxMitra Technologies Pvt. Ltd. · Proudly made in Bharat</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>DPDP Act 2023 ready</span>
            <span>·</span>
            <span>AES-256 at rest</span>
            <span>·</span>
            <span>HTTPS only</span>
            <span>·</span>
            <span>SOC-2 ready architecture</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
