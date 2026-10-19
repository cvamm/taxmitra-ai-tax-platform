"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR, shortINR } from "@/lib/format";

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 12.5,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
};

function TaxTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle} className="bg-white px-3.5 py-2.5">
      {label && <p className="mb-1 text-slate-400">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? "#0f172a" }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  );
}

/** New vs Old regime bar comparison. */
export function RegimeCompareChart({ newTax, oldTax }: { newTax: number; oldTax: number }) {
  const data = [
    { name: "New Regime", Tax: newTax },
    { name: "Old Regime", Tax: oldTax },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={64} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#475569" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => shortINR(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<TaxTooltip />} cursor={{ fill: "rgba(5,150,105,0.05)" }} />
        <Bar dataKey="Tax" radius={[10, 10, 4, 4]}>
          <Cell fill="#059669" />
          <Cell fill="#94a3b8" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 5-year projection area chart. */
export function ProjectionChart({
  points,
}: {
  points: { year: string; newTax: number; oldTax: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gOld" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="year" tick={{ fontSize: 10.5, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => shortINR(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<TaxTooltip />} />
        <Area type="monotone" dataKey="newTax" name="New regime" stroke="#059669" strokeWidth={2.5} fill="url(#gNew)" />
        <Area type="monotone" dataKey="oldTax" name="Old regime" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" fill="url(#gOld)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Principal vs interest donut. */
export function EmiDonut({ principal, interest }: { principal: number; interest: number }) {
  const data = [
    { name: "Principal", value: principal, color: "#059669" },
    { name: "Interest", value: interest, color: "#f59e0b" },
  ];
  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3} strokeWidth={0}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<TaxTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Outstanding balance over years. */
export function BalanceChart({ rows }: { rows: { year: number; balance: number; interestPaid: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="gBal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0369a1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0369a1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="year" tickFormatter={(y: number) => `Y${y}`} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => shortINR(v)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<TaxTooltip />} />
        <Area type="monotone" dataKey="balance" name="Balance" stroke="#0369a1" strokeWidth={2.5} fill="url(#gBal)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** SVG gauge for scores (Tax health / CIBIL). */
export function ScoreGauge({
  value,
  max = 100,
  size = 164,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  label: string;
  sublabel?: string;
}) {
  const pct = Math.min(1, Math.max(0, value / max));
  const angle = -220 + pct * 260; // arc sweep 260deg
  const r = 44;
  const cx = 60;
  const cy = 60;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)}`;
    };
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)}`;
  };
  const color = pct >= 0.75 ? "#059669" : pct >= 0.55 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" style={{ width: size, height: size }}>
        <path d={arc(-130, 130)} fill="none" stroke="#e8edf1" strokeWidth={9} strokeLinecap="round" />
        <path d={arc(-130, Math.min(130, angle + 0))} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
        <text x="60" y="58" textAnchor="middle" fontSize="23" fontWeight="800" fill="#0f172a">
          {Math.round(value)}
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </text>
      </svg>
      {sublabel && <p className="-mt-1 text-xs font-bold" style={{ color }}>{sublabel}</p>}
    </div>
  );
}
