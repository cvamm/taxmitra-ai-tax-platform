"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Download,
  FilePlus2,
  Mail,
  MessageCircle,
  MessageSquareText,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button, Card, Input, Pill, Select } from "@/components/ui";
import {
  computeInvoiceTotals,
  nextGstDeadlines,
  validateGstin,
  HSN_LOOKUP,
  GST_RATES,
  INDIAN_STATES,
  type InvoiceItem,
} from "@/lib/gst";
import { daysUntil, formatNum, fmtDate, shortINR } from "@/lib/format";

interface Item extends InvoiceItem {
  id: number;
}

const fmtMoney = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let itemId = 2;

export default function GstClient() {
  const [tab, setTab] = useState<"invoice" | "calendar" | "itc">("invoice");

  /* ---------------- Seller / buyer ---------------- */
  const [sellerName, setSellerName] = useState("Gupta Kirana Store");
  const [sellerGstin, setSellerGstin] = useState("");
  const [sellerState, setSellerState] = useState("09"); // UP default
  const [buyerName, setBuyerName] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerState, setBuyerState] = useState("27"); // Maharashtra
  // Deterministic first render (no SSR/CSR hydration mismatch); randomised after mount.
  const [invoiceNo, setInvoiceNo] = useState("TM-2026-001");
  const [today, setToday] = useState("");
  useEffect(() => {
    setInvoiceNo(`TM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setToday(fmtDate(new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [savedFlash, setSavedFlash] = useState(false);

  const gstinCheck = useMemo(() => (buyerGstin ? validateGstin(buyerGstin) : null), [buyerGstin]);
  useEffect(() => {
    if (gstinCheck?.valid && gstinCheck.stateCode) setBuyerState(gstinCheck.stateCode);
  }, [gstinCheck]);

  /* ---------------- Items ---------------- */
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Toor Dal 1kg", hsn: "0713", qty: 10, rate: 145, gstRate: 5 },
  ]);

  const totals = useMemo(
    () => computeInvoiceTotals(items.filter((i) => i.name), sellerState, buyerState),
    [items, sellerState, buyerState]
  );

  const [usedCount, setUsedCount] = useState(0);
  useEffect(() => {
    try {
      setUsedCount(Number(localStorage.getItem("tm-invoice-count") ?? "0") || 0);
    } catch {}
  }, []);

  function updateItem(id: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: itemId++, name: "", hsn: "", qty: 1, rate: 0, gstRate: 18 }]);
  }

  function pickHsn(id: number, code: string) {
    const h = HSN_LOOKUP.find((x) => x.code === code);
    if (h) updateItem(id, { hsn: h.code.replace(/[A-Z]+$/, ""), gstRate: h.rate, name: items.find((i) => i.id === id)?.name || h.name });
  }

  /* ---------------- Deadlines ---------------- */
  const deadlines = useMemo(() => nextGstDeadlines(), []);
  const [remindPhone, setRemindPhone] = useState("");
  const [remindKind, setRemindKind] = useState("GSTR-3B");
  const [remindState, setRemindState] = useState<"idle" | "saving" | "done">("idle");

  async function saveReminder() {
    if (remindPhone.length < 10) return;
    setRemindState("saving");
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: remindPhone, channel: "whatsapp", kind: remindKind }),
      });
    } catch {}
    setRemindState("done");
  }

  /* ---------------- ITC tracker ---------------- */
  const [itcRows, setItcRows] = useState<{ id: number; supplier: string; amount: number; rate: number }[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tm-itc");
      if (raw) setItcRows(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("tm-itc", JSON.stringify(itcRows));
    } catch {}
  }, [itcRows]);
  const itcTotal = useMemo(
    () => itcRows.reduce((a, r) => a + (r.amount * r.rate) / 100, 0),
    [itcRows]
  );

  /* ---------------- Share ---------------- */
  function shareText(): string {
    const lines = [
      `*Tax Invoice ${invoiceNo}*`,
      `${sellerName}${sellerGstin ? ` (GSTIN: ${sellerGstin})` : ""}`,
      `To: ${buyerName || "Cash sale"}`,
      "",
      ...items.filter((i) => i.name).map((i) => `${i.name} x${i.qty} @ ₹${i.rate} — ${fmtMoney(i.qty * i.rate)}`),
      "",
      `Subtotal: ${fmtMoney(totals.subtotal)}`,
      totals.interState ? `IGST: ${fmtMoney(totals.igst)}` : `CGST: ${fmtMoney(totals.cgst)} + SGST: ${fmtMoney(totals.sgst)}`,
      `*Total: ${fmtMoney(totals.total)}*`,
      "",
      "— Generated free on TaxMitra",
    ];
    return lines.join("\n");
  }

  async function saveInvoice() {
    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invoiceNo, sellerName, sellerGstin, sellerState, buyerName, buyerGstin, buyerState,
          items: items.filter((i) => i.name), ...totals,
        }),
      });
    } catch {}
    const next = usedCount + 1;
    setUsedCount(next);
    try { localStorage.setItem("tm-invoice-count", String(next)); } catch {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
    setInvoiceNo(`TM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  }

  const sellerStateName = INDIAN_STATES.find((s) => s.code === sellerState)?.name ?? "";
  const buyerStateName = INDIAN_STATES.find((s) => s.code === buyerState)?.name ?? "";

  const TABS = [
    { id: "invoice", label: "Invoice maker", icon: FilePlus2 },
    { id: "calendar", label: "Filing calendar", icon: CalendarClock },
    { id: "itc", label: "ITC tracker", icon: Receipt },
  ] as const;

  return (
    <div className="light-grid bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-xl">
            <Pill tone="emerald"><Receipt className="h-3.5 w-3.5" /> For 6 Cr+ shops &amp; MSMEs · Free &lt;50 invoices/mo</Pill>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">GST Invoice + Return Reminder</h1>
            <p className="mt-2 text-[14.5px] text-slate-500">
              GSTIN auto-validate, HSN lookup, CGST/SGST/IGST auto-split — aur invoice WhatsApp pe 1-tap. GSTR deadlines ki chinta chhodo.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right">
            <p className="text-[10.5px] font-bold text-slate-400 uppercase">Free plan usage</p>
            <p className="text-[15px] font-extrabold text-slate-900">{usedCount} / 50 invoices</p>
            <div className="mt-1 h-1.5 w-32 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (usedCount / 50) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold transition-colors ${
                tab === t.id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ============================ INVOICE TAB ============================ */}
        {tab === "invoice" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Form */}
            <div className="space-y-5">
              <Card className="p-5">
                <p className="text-[12px] font-extrabold tracking-widest text-slate-800 uppercase">Aapki dukaan (seller)</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input label="Business name" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
                  <Input label="GSTIN (optional)" value={sellerGstin} onChange={(e) => setSellerGstin(e.target.value.toUpperCase())} placeholder="09AAAAA0000A1Z5" maxLength={15} />
                  <Select label="State" value={sellerState} onChange={(e) => setSellerState(e.target.value)}>
                    {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </Select>
                  <Input label="Invoice no." value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-[12px] font-extrabold tracking-widest text-slate-800 uppercase">Buyer</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input label="Buyer name / business" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Cash sale bhi chalega" />
                  <div>
                    <Input label="Buyer GSTIN (auto-validates)" value={buyerGstin} onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())} placeholder="27AAAAA0000A1Z5" maxLength={15} />
                    {buyerGstin.length > 0 && (
                      <p className={`mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold ${gstinCheck?.valid ? "text-emerald-600" : "text-rose-600"}`}>
                        {gstinCheck?.valid ? (<><BadgeCheck className="h-3.5 w-3.5" /> Valid · State: {gstinCheck.stateName}</>) : "Invalid GSTIN format (15 chars: 2-digit state + PAN…)"}
                      </p>
                    )}
                  </div>
                  <Select label="Buyer state" value={buyerState} onChange={(e) => setBuyerState(e.target.value)}>
                    {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </Select>
                  <div className="flex items-end">
                    <Pill tone={totals.interState ? "sky" : "emerald"} className="mb-1">
                      {totals.interState ? "Inter-state → IGST" : "Intra-state → CGST + SGST"}
                    </Pill>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-extrabold tracking-widest text-slate-800 uppercase">Items ({items.filter((i) => i.name).length})</p>
                  <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5" /> Add item</Button>
                </div>
                <div className="mt-4 space-y-4">
                  {items.map((it) => (
                    <div key={it.id} className="rounded-xl border border-slate-200 p-3.5">
                      <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
                        <Input placeholder="Item / service name" value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} aria-label="Item name" />
                        <button onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} className="grid h-11 w-11 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <Select label="HSN/SAC lookup" value="" onChange={(e) => pickHsn(it.id, e.target.value)} aria-label="HSN lookup">
                          <option value="">Pick…</option>
                          {HSN_LOOKUP.map((h) => <option key={h.code} value={h.code}>{h.code} · {h.name} ({h.rate}%)</option>)}
                        </Select>
                        <Input label="Qty" type="number" min={1} value={it.qty || ""} onChange={(e) => updateItem(it.id, { qty: Math.max(1, Number(e.target.value) || 1) })} />
                        <Input label="Rate ₹ (ex-GST)" type="number" min={0} value={it.rate || ""} onChange={(e) => updateItem(it.id, { rate: Math.max(0, Number(e.target.value) || 0) })} />
                        <Select label="GST %" value={String(it.gstRate)} onChange={(e) => updateItem(it.id, { gstRate: Number(e.target.value) })}>
                          {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                        </Select>
                      </div>
                      <p className="mt-2 text-right text-[12px] font-bold text-slate-500">
                        {it.name ? fmtMoney(it.qty * it.rate) : "—"} <span className="text-slate-300">+ {it.gstRate}% GST</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  {[
                    ["Subtotal", fmtMoney(totals.subtotal)],
                    totals.interState ? [`IGST`, fmtMoney(totals.igst)] : [`CGST + SGST`, `${fmtMoney(totals.cgst)} + ${fmtMoney(totals.sgst)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 text-[13px]">
                      <span className="text-slate-500">{k}</span><span className="font-bold text-slate-800 tabular-nums">{v}</span>
                    </div>
                  ))}
                  <div className="mt-1.5 flex justify-between border-t border-slate-200 pt-2.5">
                    <span className="text-[14px] font-extrabold text-slate-900">Grand total</span>
                    <span className="text-[17px] font-extrabold text-emerald-700 tabular-nums">{fmtMoney(totals.total)}</span>
                  </div>
                </div>
              </Card>

              {/* Share actions */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-[13px] font-bold text-white"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href={`sms:?&body=${encodeURIComponent(shareText())}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-[13px] font-bold text-slate-700">
                  <MessageSquareText className="h-4 w-4" /> SMS
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(`Tax Invoice ${invoiceNo} — ${sellerName}`)}&body=${encodeURIComponent(shareText())}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-[13px] font-bold text-slate-700">
                  <Mail className="h-4 w-4" /> Email
                </a>
                <button onClick={() => window.print()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-[13px] font-bold text-slate-700">
                  <Download className="h-4 w-4" /> PDF
                </button>
              </div>
              <Button onClick={saveInvoice} variant={savedFlash ? "secondary" : "primary"} className="w-full">
                {savedFlash ? (<><CheckCircle2 className="h-4 w-4" /> Saved to vault</>) : (<><FilePlus2 className="h-4 w-4" /> Save invoice (free: {50 - usedCount} left)</>)}
              </Button>
            </div>

            {/* Preview */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <p className="mb-2 text-[11.5px] font-bold tracking-widest text-slate-400 uppercase">Live preview — A5/A4 print ready</p>
              <div id="invoice-sheet" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                  <div>
                    <p className="text-lg font-extrabold tracking-tight text-slate-900">{sellerName || "Your Business"}</p>
                    {sellerGstin && <p className="text-[11px] font-semibold text-slate-500">GSTIN: {sellerGstin}</p>}
                    <p className="text-[11px] text-slate-500">{sellerStateName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Tax Invoice</p>
                    <p className="mt-1 text-[15px] font-extrabold text-slate-900">{invoiceNo}</p>
                    <p className="text-[11px] text-slate-500">{today}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-[11.5px]">
                  <div>
                    <p className="font-bold text-slate-400 uppercase">Billed to</p>
                    <p className="mt-1 font-extrabold text-slate-800">{buyerName || "Cash sale"}</p>
                    {buyerGstin && <p className="text-slate-500">GSTIN: {buyerGstin}</p>}
                    <p className="text-slate-500">{buyerStateName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 uppercase">Place of supply</p>
                    <p className="mt-1 font-extrabold text-slate-800">{buyerStateName} ({buyerState})</p>
                    <p className="text-slate-500">{totals.interState ? "Inter-state — IGST" : "Intra-state — CGST+SGST"}</p>
                  </div>
                </div>

                <table className="mt-5 w-full text-[11.5px]">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50 text-slate-500">
                      <th className="px-2 py-2 text-left font-bold">Item</th>
                      <th className="px-2 py-2 text-left font-bold">HSN</th>
                      <th className="px-2 py-2 text-right font-bold">Qty</th>
                      <th className="px-2 py-2 text-right font-bold">Rate</th>
                      <th className="px-2 py-2 text-right font-bold">GST%</th>
                      <th className="px-2 py-2 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.filter((i) => i.name).map((i) => (
                      <tr key={i.id}>
                        <td className="px-2 py-2 font-semibold text-slate-700">{i.name}</td>
                        <td className="px-2 py-2 text-slate-500">{i.hsn || "—"}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{i.qty}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatNum(i.rate)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{i.gstRate}%</td>
                        <td className="px-2 py-2 text-right font-bold tabular-nums">{formatNum(i.qty * i.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 flex justify-end">
                  <div className="w-56 space-y-1.5 text-[12px]">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold tabular-nums">{fmtMoney(totals.subtotal)}</span></div>
                    {totals.interState ? (
                      <div className="flex justify-between"><span className="text-slate-500">IGST</span><span className="font-bold tabular-nums">{fmtMoney(totals.igst)}</span></div>
                    ) : (
                      <>
                        <div className="flex justify-between"><span className="text-slate-500">CGST</span><span className="font-bold tabular-nums">{fmtMoney(totals.cgst)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">SGST</span><span className="font-bold tabular-nums">{fmtMoney(totals.sgst)}</span></div>
                      </>
                    )}
                    <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-[14px]">
                      <span className="font-extrabold">Total</span><span className="font-extrabold text-emerald-700 tabular-nums">{fmtMoney(totals.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4 text-[10.5px] text-slate-400">
                  <p>Generated free on TaxMitra · Invoice subject to GST rules · E&amp;OE</p>
                  <p className="font-bold text-slate-500">Authorised signatory</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================ CALENDAR TAB ============================ */}
        {tab === "calendar" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card className="p-5">
              <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                <CalendarClock className="h-4 w-4 text-emerald-600" /> Upcoming GST deadlines
              </p>
              <div className="mt-4 space-y-3">
                {deadlines.filter((d) => daysUntil(d.due) >= 0).slice(0, 6).map((d, i) => {
                  const left = daysUntil(d.due);
                  return (
                    <div key={`${d.form}-${i}`} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-center ${left <= 3 ? "bg-rose-50 text-rose-600" : left <= 7 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                        <div>
                          <p className="text-[15px] leading-none font-extrabold">{d.due.getDate()}</p>
                          <p className="text-[9px] font-bold uppercase">{d.due.toLocaleDateString("en-IN", { month: "short" })}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-extrabold text-slate-900">{d.form}</p>
                        <p className="text-[12px] text-slate-500">{d.label}</p>
                      </div>
                      <div className="text-right">
                        <Pill tone={left <= 3 ? "rose" : left <= 7 ? "amber" : "emerald"}>{left <= 0 ? "Today!" : `${left} days left`}</Pill>
                        <button
                          onClick={() => { setRemindKind(d.form); }}
                          className="mt-1.5 block w-full text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          Remind me →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Reminder signup */}
            <Card className="h-fit border-emerald-200 p-5 lg:sticky lg:top-24">
              <BellRing className="h-6 w-6 text-emerald-600" />
              <p className="mt-2 text-[15px] font-extrabold text-slate-900">WhatsApp / SMS reminders</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                Due date se <strong>7 din</strong> aur <strong>1 din</strong> pehle automatic reminder. Kabhi late fee nahi doge.
              </p>
              {remindState === "done" ? (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <p className="text-[12.5px] font-semibold text-emerald-800">
                    Reminder set for <strong>{remindKind}</strong>! WhatsApp pe confirmation aayega.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <Select label="Return type" value={remindKind} onChange={(e) => setRemindKind(e.target.value)}>
                    {["GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-4", "ITR (Nov 2)"].map((k) => <option key={k} value={k}>{k}</option>)}
                  </Select>
                  <Input label="WhatsApp number" inputMode="tel" maxLength={10} placeholder="10-digit mobile" value={remindPhone} onChange={(e) => setRemindPhone(e.target.value.replace(/\D/g, ""))} />
                  <Button onClick={saveReminder} disabled={remindPhone.length < 10 || remindState === "saving"} className="w-full">
                    {remindState === "saving" ? "Setting…" : `Set ${remindKind} reminder — free`}
                  </Button>
                  <p className="text-[10.5px] leading-snug text-slate-400">
                    By continuing you consent to WhatsApp/SMS alerts under DPDP 2023. Opt-out anytime by replying STOP.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================ ITC TAB ============================ */}
        {tab === "itc" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">
                  <Receipt className="h-4 w-4 text-emerald-600" /> Purchase entries (input side)
                </p>
                <Button variant="outline" size="sm" onClick={() => setItcRows((r) => [...r, { id: Date.now(), supplier: "", amount: 0, rate: 18 }])}>
                  <Plus className="h-3.5 w-3.5" /> Add purchase
                </Button>
              </div>
              <div className="mt-4 space-y-2.5">
                {itcRows.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-[13px] text-slate-400">
                    Abhi koi entry nahi. Supplier bills add karein — ITC auto-calculate hoga aur GSTR-3B mein offset hoga.
                  </p>
                )}
                {itcRows.map((r) => (
                  <div key={r.id} className="grid grid-cols-[1fr_90px_80px_36px] items-center gap-2 rounded-xl border border-slate-200 p-2.5 sm:grid-cols-[1fr_140px_110px_40px]">
                    <Input placeholder="Supplier name" value={r.supplier} onChange={(e) => setItcRows((rows) => rows.map((x) => (x.id === r.id ? { ...x, supplier: e.target.value } : x)))} aria-label="Supplier" />
                    <Input placeholder="₹ amount" type="number" value={r.amount || ""} onChange={(e) => setItcRows((rows) => rows.map((x) => (x.id === r.id ? { ...x, amount: Math.max(0, Number(e.target.value) || 0) } : x)))} aria-label="Amount" />
                    <Select value={String(r.rate)} onChange={(e) => setItcRows((rows) => rows.map((x) => (x.id === r.id ? { ...x, rate: Number(e.target.value) } : x)))} aria-label="GST rate">
                      {GST_RATES.filter((g) => g > 0).map((g) => <option key={g} value={g}>{g}%</option>)}
                    </Select>
                    <button onClick={() => setItcRows((rows) => rows.filter((x) => x.id !== r.id))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">Claimable ITC</p>
                <p className="mt-1.5 text-3xl font-extrabold">{shortINR(itcTotal)}</p>
                <p className="mt-1 text-[12px] text-slate-400">
                  across {itcRows.length} purchase bills · GSTR-3B Table 4 mein auto-offset
                </p>
              </div>
              <Card className="border-amber-200 bg-amber-50/60 p-5">
                <p className="text-[13px] font-extrabold text-amber-800">ITC pro tips</p>
                <ul className="mt-2.5 space-y-2 text-[12px] leading-snug text-slate-600">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Supplier ki GSTR-1 filing mein bill dikhna zaroori hai (GSTR-2B match).</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Payment 180 din mein na ho toh ITC reverse karna padta hai.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Personal use purchases pe ITC claim mat karein.</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        <p className="mt-8 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[12px] leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          GST rates 0/5/12/18/28% as per GST Council. HSN database sample hai — apne product ka exact HSN cbic.gov.in pe verify karein. <strong>Not financial advice — GST filing se pehle CA review recommended.</strong>
        </p>
      </div>
    </div>
  );
}
