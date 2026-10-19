"use client";

import { formatINR, shortINR } from "@/lib/format";

/** Slider + formatted currency display for Indian amounts. */
export default function CurrencyInput({
  label,
  value,
  onChange,
  min = 0,
  max = 10_000_000,
  step = 10_000,
  prefix = "₹",
  hint,
  chips,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  hint?: string;
  chips?: { label: string; value: number }[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-semibold text-slate-600">{label}</label>
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
          <span className="mr-1 text-[13px] font-bold text-slate-400">{prefix}</span>
          <input
            type="number"
            inputMode="numeric"
            value={value === 0 ? "" : value}
            placeholder="0"
            min={min}
            max={max}
            onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
            className="w-32 bg-transparent text-right text-[15px] font-extrabold text-slate-900 tabular-nums focus:outline-none"
            aria-label={label}
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-brand mt-2.5 w-full"
        aria-label={`${label} slider`}
      />
      <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-slate-400">
        <span>{shortINR(min)}</span>
        <span className="font-semibold text-emerald-700">{value > 0 ? formatINR(value) : ""}</span>
        <span>{shortINR(max)}</span>
      </div>
      {chips && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onChange(c.value)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                value === c.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {hint && <p className="mt-1 text-[11.5px] text-slate-400">{hint}</p>}
    </div>
  );
}
