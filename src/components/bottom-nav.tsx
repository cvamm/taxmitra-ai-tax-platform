"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, FileCheck2, Home, Landmark, Receipt } from "lucide-react";
import { cn } from "@/components/ui";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tax-saver", label: "Tax Saver", icon: Calculator },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/gst", label: "GST", icon: Receipt },
  { href: "/itr", label: "ITR AI", icon: FileCheck2 },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      aria-label="Quick tools"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[10.5px] font-semibold transition-colors",
                active ? "text-emerald-700" : "text-slate-400"
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-14 place-items-center rounded-full transition-colors",
                  active && "bg-emerald-100"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
