"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  BotMessageSquare,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  FileText,
  Loader2,
  RotateCcw,
  SendHorizonal,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";
import { ButtonLink, Card, Pill } from "@/components/ui";
import type { BotResponse, ChatResult, ItrState } from "@/lib/chatbot";
import { formatINR, shortINR } from "@/lib/format";

interface Msg {
  id: number;
  role: "bot" | "user";
  text: string;
  result?: ChatResult;
  link?: { href: string; label: string };
}

const STEPS = [
  { id: "type", label: "Income type" },
  { id: "income", label: "Annual income" },
  { id: "age", label: "Age group" },
  { id: "ded", label: "Deductions (80C/80D/NPS)" },
  { id: "tds", label: "TDS from Form 16" },
  { id: "result", label: "Regime verdict" },
];

function stepIndexOf(state: ItrState): number {
  switch (state.step) {
    case "asked_income": return 1;
    case "asked_age": return 2;
    case "asked_80c":
    case "asked_80d":
    case "asked_nps": return 3;
    case "asked_tds": return 4;
    case "done": return 5;
    default: return 0;
  }
}

let idc = 1;
function nextId() {
  return idc++;
}

export default function ItrClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [state, setState] = useState<ItrState>({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [tab, setTab] = useState<"chat" | "summary">("chat");
  const [uploadState, setUploadState] = useState<"idle" | "parsing" | "done">("idle");
  const [parsed, setParsed] = useState<{ grossSalary: number; tds: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const currentStep = stepIndexOf(state);

  useEffect(() => {
    // initial greeting
    void sendToBot("", {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const latestResult = useMemo(() => [...messages].reverse().find((m) => m.result)?.result, [messages]);

  async function sendToBot(text: string, st: ItrState) {
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state: st, input: text }),
      });
      const data = (await res.json()) as BotResponse;
      // small human-like delay
      await new Promise((r) => setTimeout(r, 450));
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", text: data.text, result: data.result, link: data.link },
      ]);
      setQuickReplies(data.quickReplies ?? []);
      setState(data.state ?? {});
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", text: "Network issue — ek baar phir try karein." },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleUser(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed === "Full calculator dekho") {
      window.location.href = "/tax-saver";
      return;
    }
    if (trimmed === "Book CA review ₹499") {
      window.location.href = "/ca-marketplace?service=itr";
      return;
    }
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: trimmed }]);
    setQuickReplies([]);
    setInput("");
    void sendToBot(trimmed, state);
  }

  async function handleUpload(file: File) {
    setUploadState("parsing");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-form16", { method: "POST", body: fd });
      const data = (await res.json()) as { grossSalary: number; tdsAmount: number };
      setParsed({ grossSalary: data.grossSalary, tds: data.tdsAmount });
      setUploadState("done");
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "bot",
          text: `Form 16 parse ho gaya (OCR beta — values verify kar lein):\n• Gross salary: ${formatINR(data.grossSalary)}\n• TDS deducted: ${formatINR(data.tdsAmount)}\n\nMaine income aur TDS pre-fill kar diya hai. Baaki questions continue karte hain!`,
        },
      ]);
      setState((s) => ({ ...s, incomeType: "salary", income: data.grossSalary, tds: data.tdsAmount, step: s.step === undefined || s.step === "asked_type" || s.step === "asked_income" ? "asked_age" : s.step }));
    } catch {
      setUploadState("idle");
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", text: "File upload nahi ho payi. PDF dobara try karein ya values manually batayein." },
      ]);
    }
  }

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-xl">
            <Pill tone="emerald"><BotMessageSquare className="h-3.5 w-3.5" /> AI-assisted · CA-backed</Pill>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">ITR Filing Helper</h1>
            <p className="mt-2 text-[14.5px] text-slate-500">
              Mitra AI se baat karein — income, deductions, TDS — aur 5 minute mein FY 2025-26 ka exact estimate + refund status paa lein.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[12px] font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4" /> Encrypted &amp; DPDP-safe
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="mt-6 grid grid-cols-2 gap-2 lg:hidden">
          {(["chat", "summary"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl py-2.5 text-[13px] font-bold capitalize transition-colors ${
                tab === t ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {t === "chat" ? "AI Chat" : "ITR Snapshot"}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ======================== CHAT ======================== */}
          <Card className={`flex h-[68vh] min-h-[480px] flex-col overflow-hidden lg:h-[74vh] ${tab === "chat" ? "" : "hidden lg:flex"}`}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white">
                  <BotMessageSquare className="h-5 w-5" />
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <div>
                  <p className="text-[14px] font-extrabold text-slate-900">Mitra AI</p>
                  <p className="text-[11.5px] font-semibold text-emerald-600">Online · FY 2025-26 brain</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMessages([]);
                  setState({});
                  setParsed(null);
                  setUploadState("idle");
                  void sendToBot("", {});
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-5">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] sm:max-w-[75%] ${m.role === "user" ? "order-1" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line shadow-sm ${
                        m.role === "user"
                          ? "rounded-br-md bg-slate-900 text-white"
                          : "rounded-bl-md border border-slate-200/80 bg-white text-slate-700"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.result && (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                        <div className="bg-emerald-600 px-4 py-2.5 text-[12px] font-extrabold tracking-wider text-white uppercase">
                          FY 2025-26 · Tax estimate
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                          <div className={`p-4 ${m.result.better === "new" ? "bg-emerald-50/70" : ""}`}>
                            <p className="text-[11px] font-bold text-slate-400 uppercase">New regime</p>
                            <p className="mt-1 text-xl font-extrabold text-slate-900">{formatINR(m.result.newTax)}</p>
                            {m.result.better === "new" && <Pill tone="emerald" className="mt-1 px-2 py-0.5 text-[10px]">Best</Pill>}
                          </div>
                          <div className={`p-4 ${m.result.better === "old" ? "bg-emerald-50/70" : ""}`}>
                            <p className="text-[11px] font-bold text-slate-400 uppercase">Old regime</p>
                            <p className="mt-1 text-xl font-extrabold text-slate-900">{formatINR(m.result.oldTax)}</p>
                            {m.result.better === "old" && <Pill tone="emerald" className="mt-1 px-2 py-0.5 text-[10px]">Best</Pill>}
                          </div>
                        </div>
                        <div className="border-t border-slate-100 px-4 py-3 text-[12.5px] font-semibold">
                          {m.result.refundOrDue > 0 ? (
                            <p className="text-emerald-700">Expected refund: {formatINR(m.result.refundOrDue)}</p>
                          ) : m.result.refundOrDue < 0 ? (
                            <p className="text-rose-600">Balance tax payable: {formatINR(-m.result.refundOrDue)}</p>
                          ) : (
                            <p className="text-slate-600">TDS perfectly matched — na refund, na due.</p>
                          )}
                          <p className="mt-0.5 text-[11.5px] font-medium text-slate-400">
                            Savings vs other regime: {formatINR(m.result.savings)} · effective rate {m.result.effectiveRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                    {m.link && (
                      <ButtonLink href={m.link.href} size="sm" className="mt-2">
                        {m.link.label}
                      </ButtonLink>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            {quickReplies.length > 0 && !typing && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-4 py-2.5">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleUser(q)}
                    className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[12px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUser(input);
              }}
              className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type karein… jaise '12 lakh' ya 'salaried'"
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] focus:border-emerald-600 focus:bg-white focus:outline-none"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
                aria-label="Send"
              >
                <SendHorizonal className="h-5 w-5" />
              </button>
            </form>
          </Card>

          {/* ======================== SNAPSHOT ======================== */}
          <div className={`space-y-5 ${tab === "summary" ? "" : "hidden lg:block"}`}>
            {/* Progress */}
            <Card className="p-5">
              <p className="text-[12px] font-extrabold tracking-widest text-slate-800 uppercase">Progress tracker</p>
              <div className="mt-4 space-y-3">
                {STEPS.map((s, i) => {
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      ) : active ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-500" />
                      ) : (
                        <CircleDashed className="h-5 w-5 shrink-0 text-slate-300" />
                      )}
                      <p className={`text-[13px] font-semibold ${done ? "text-emerald-700 line-through" : active ? "text-slate-900" : "text-slate-400"}`}>
                        {s.label}
                      </p>
                      {active && <span className="ml-auto text-[10.5px] font-bold text-slate-400">ETA ~{Math.max(1, 5 - i)} min</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </Card>

            {/* Form16 upload */}
            <Card className="p-5">
              <p className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-slate-800 uppercase">
                <FileText className="h-4 w-4 text-sky-600" /> Form 16 / 26AS / AIS
              </p>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) void handleUpload(f);
                }}
                className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  uploadState === "done" ? "border-emerald-300 bg-emerald-50/60" : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                  }}
                />
                {uploadState === "parsing" ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="mt-2 text-[13px] font-bold text-slate-700">OCR parse ho raha hai…</p>
                  </>
                ) : uploadState === "done" ? (
                  <>
                    <FileCheck2 className="h-8 w-8 text-emerald-600" />
                    <p className="mt-2 text-[13px] font-bold text-emerald-800">Parse complete</p>
                    {parsed && (
                      <p className="mt-1 text-[11.5px] text-slate-500">
                        Salary {shortINR(parsed.grossSalary)} · TDS {shortINR(parsed.tds)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-[13px] font-bold text-slate-700">PDF drop karein ya tap karke upload</p>
                    <p className="mt-1 text-[11px] text-slate-400">AES-256 encrypted · OCR beta</p>
                  </>
                )}
              </label>
            </Card>

            {/* Live result */}
            {latestResult && (
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">Your verdict</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {latestResult.better === "new" ? "New Regime" : "Old Regime"}
                </p>
                <p className="mt-1 text-[13px] text-slate-300">
                  Tax {formatINR(latestResult.better === "new" ? latestResult.newTax : latestResult.oldTax)} · save {shortINR(latestResult.savings)}
                </p>
                {latestResult.refundOrDue > 0 && (
                  <p className="mt-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-[12.5px] font-bold text-emerald-300">
                    Refund expected: {formatINR(latestResult.refundOrDue)}
                  </p>
                )}
              </div>
            )}

            {/* Doc checklist */}
            <Card className="p-5">
              <p className="text-[12px] font-extrabold tracking-widest text-slate-800 uppercase">Ready rakhein</p>
              <ul className="mt-3 space-y-2 text-[12.5px] font-medium text-slate-600">
                {["PAN card", "Form 16 (salaried)", "AIS / 26AS download", "Bank statement (interest)", "80C investment proofs", "Rent receipts (HRA)"].map((d) => (
                  <li key={d} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {d}
                  </li>
                ))}
              </ul>
            </Card>

            {/* CA handoff */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
              <BadgeCheck className="h-7 w-7" />
              <p className="mt-2.5 text-[15px] font-extrabold">CA se verified filing</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-emerald-50/90">
                ICAI-verified CA aapka poora return review + file karega. Escrow payment — filing confirm hone par hi release. ₹499 se.
              </p>
              <ButtonLink href="/ca-marketplace?service=itr" variant="amber" size="sm" className="mt-3.5 w-full">
                <User className="h-4 w-4" /> Book CA review — ₹499
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
