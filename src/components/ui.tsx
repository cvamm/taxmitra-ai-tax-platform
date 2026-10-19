"use client";

import Link from "next/link";
import type { ReactNode, AnchorHTMLAttributes } from "react";
import clsx from "clsx";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return clsx(parts);
}

/* ---------------- Buttons ---------------- */

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp" | "amber";
type BtnSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const btnVariants: Record<BtnVariant, string> = {
  primary:
    "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/25",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-slate-300 bg-white text-slate-800 hover:border-emerald-600 hover:text-emerald-700",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  whatsapp:
    "bg-[#25D366] text-white shadow-sm shadow-[#25D366]/30 hover:bg-[#1fb857] hover:shadow-md",
  amber: "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/30",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-[15px]",
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  const cls = cn(btnBase, btnVariants[variant], btnSizes[size], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...rest} />;
}

/* ---------------- Surfaces ---------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Pill({
  className,
  tone = "emerald",
  children,
}: {
  className?: string;
  tone?: "emerald" | "amber" | "slate" | "rose" | "sky";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-800 ring-amber-600/25",
    slate: "bg-slate-100 text-slate-600 ring-slate-500/15",
    rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
    sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  sub,
  align = "center",
}: {
  kicker?: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      {kicker && (
        <p className="text-xs font-bold tracking-[0.14em] uppercase text-emerald-600">{kicker}</p>
      )}
      <h2 className="mt-2 text-[26px] leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{sub}</p>}
    </div>
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
) {
  const { label, className, id, ...rest } = props;
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>}
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15",
          className
        )}
        {...rest}
      />
    </label>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
) {
  const { label, className, id, children, ...rest } = props;
  return (
    <label className="block" htmlFor={id}>
      {label && <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>}
      <select
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15",
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

/* ---------------- Affiliate / partner tracked link ---------------- */

export function PartnerLink({
  href,
  code,
  target,
  className,
  children,
  ...rest
}: {
  href: string;
  code: string;
  target: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() => {
        try {
          fetch("/api/track", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code, kind: "click", target }),
            keepalive: true,
          });
        } catch {
          /* never block navigation */
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
