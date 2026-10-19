"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { LanguageToggle, useI18n } from "@/lib/i18n";
import { cn } from "@/components/ui";

const LINKS: { href: string; key: string }[] = [
  { href: "/itr", key: "nav_itr" },
  { href: "/tax-saver", key: "nav_tax" },
  { href: "/loans", key: "nav_loans" },
  { href: "/gst", key: "nav_gst" },
  { href: "/ca-marketplace", key: "nav_ca" },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="TaxMitra home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="text-[19px] font-extrabold tracking-tight text-slate-900">
            Tax<span className="text-emerald-600">Mitra</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
                pathname.startsWith(l.href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageToggle compact />
          </div>
          <Link
            href="/dashboard"
            className="hidden h-9 items-center rounded-xl px-3.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 md:inline-flex"
          >
            {t("nav_signin")}
          </Link>
          <Link
            href="/tax-saver"
            className="hidden h-9 items-center rounded-xl bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-emerald-600/25 transition-colors hover:bg-emerald-700 md:inline-flex"
          >
            {t("nav_cta")}
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="grid gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-3 text-[15px] font-semibold",
                  pathname.startsWith(l.href) ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
                )}
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <LanguageToggle />
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-[13px] font-semibold text-emerald-700"
              >
                {t("nav_signin")} →
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
