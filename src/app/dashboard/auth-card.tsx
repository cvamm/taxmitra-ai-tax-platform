"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";

export default function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, consent }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Kuch gadbad ho gayi. Dobara try karein.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network issue — dobara try karein.");
      setBusy(false);
    }
  }

  return (
    <Card className="mt-8 p-6">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`rounded-lg py-2.5 text-[13px] font-bold capitalize transition-colors ${
              mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
            }`}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3.5">
        {mode === "signup" && (
          <>
            <Input label="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ramesh Gupta" />
            <Input label="Mobile (for reminders)" inputMode="tel" maxLength={10} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} placeholder="10-digit" />
          </>
        )}
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value.trim() }))} placeholder="you@example.com" />
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={mode === "signup" ? "Min 8 characters" : "Your password"} />

        {mode === "signup" && (
          <label className="flex items-start gap-2.5 text-[11.5px] leading-snug text-slate-500">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="range-brand mt-0.5 h-4 w-4" />
            Main DPDP Act 2023 ke tahat explicit consent deta/deti hoon ki TaxMitra mera data sirf services dene ke liye process kare. Main chahe to kabhi bhi data delete karwa sakta/sakti hoon.
          </label>
        )}

        {error && <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-rose-700">{error}</p>}

        <Button
          onClick={submit}
          disabled={busy || !form.email.includes("@") || form.password.length < (mode === "signup" ? 8 : 1) || (mode === "signup" && (!form.name || !consent))}
          className="w-full"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signup" ? (
            <><UserPlus className="h-4 w-4" /> Create free account</>
          ) : (
            <><LogIn className="h-4 w-4" /> Sign in</>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> scrypt-hashed passwords · httpOnly sessions · no data selling
        </p>
      </div>
    </Card>
  );
}
