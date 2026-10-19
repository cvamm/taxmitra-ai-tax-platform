"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, LogOut } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {}
      }}
      className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 transition-colors hover:bg-emerald-500/30"
      aria-label="Copy referral code"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {}
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[13px] font-bold text-slate-600 hover:border-slate-400"
    >
      <LogOut className="h-3.5 w-3.5" /> Logout
    </button>
  );
}
