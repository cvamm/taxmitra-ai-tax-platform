import type { Metadata } from "next";
import { db } from "@/db";
import { bookings, calculations, invoices, refEvents, reminders, users } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { Card } from "@/components/ui";
import { fmtDate, shortINR } from "@/lib/format";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — TaxMitra Ops",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const key = sp.key ?? "";
  const expected = process.env.ADMIN_KEY ?? "admin-local";
  if (key !== expected) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-slate-900">Restricted</h1>
        <p className="mt-2 text-[13px] text-slate-500">
          Append <code className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">?key=ADMIN_KEY</code> (set in env). Default local key: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">admin-local</code>
        </p>
      </div>
    );
  }

  let counts = { users: 0, bookings: 0, invoices: 0, calcs: 0, clicks: 0, reminders: 0 };
  let recentBookings: (typeof bookings.$inferSelect)[] = [];
  try {
    const [u, b, i, c, r, rm] = await Promise.all([
      db.select({ n: sql<number>`count(*)` }).from(users),
      db.select({ n: sql<number>`count(*)` }).from(bookings),
      db.select({ n: sql<number>`count(*)` }).from(invoices),
      db.select({ n: sql<number>`count(*)` }).from(calculations),
      db.select({ n: sql<number>`count(*)` }).from(refEvents),
      db.select({ n: sql<number>`count(*)` }).from(reminders),
    ]);
    counts = {
      users: Number(u[0]?.n ?? 0),
      bookings: Number(b[0]?.n ?? 0),
      invoices: Number(i[0]?.n ?? 0),
      calcs: Number(c[0]?.n ?? 0),
      clicks: Number(r[0]?.n ?? 0),
      reminders: Number(rm[0]?.n ?? 0),
    };
    recentBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(12);
  } catch {
    /* pre-migration */
  }

  const escrowTotal = recentBookings.filter((b) => b.status === "escrow_pending").reduce((a, b) => a + b.amount, 0);
  const commission = Math.round(escrowTotal * 0.175);

  const STATS = [
    ["Users", counts.users],
    ["CA bookings + leads", counts.bookings],
    ["Invoices generated", counts.invoices],
    ["Calculations saved", counts.calcs],
    ["Affiliate clicks", counts.clicks],
    ["Reminders queued", counts.reminders],
  ] as const;

  return (
    <div className="light-grid bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ops dashboard</h1>
        <p className="mt-1 text-[13px] text-slate-500">Escrow pending: <strong className="text-slate-800">{shortINR(escrowTotal)}</strong> · est. commission (17.5%): <strong className="text-emerald-700">{shortINR(commission)}</strong></p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map(([k, v]) => (
            <Card key={k} className="p-4 text-center">
              <p className="text-2xl font-extrabold text-slate-900">{v}</p>
              <p className="mt-1 text-[11px] font-bold tracking-wide text-slate-400 uppercase">{k}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 overflow-hidden">
          <p className="border-b border-slate-100 px-5 py-4 text-[13px] font-extrabold tracking-wide text-slate-800 uppercase">Recent bookings</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[12.5px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-slate-400">
                  <th className="px-5 py-2.5 font-bold">Ref</th>
                  <th className="px-3 py-2.5 font-bold">Kind</th>
                  <th className="px-3 py-2.5 font-bold">User</th>
                  <th className="px-3 py-2.5 font-bold">Service</th>
                  <th className="px-3 py-2.5 font-bold">Amount</th>
                  <th className="px-3 py-2.5 font-bold">Status</th>
                  <th className="px-3 py-2.5 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentBookings.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No bookings yet — seed data chala kar dekhein.</td></tr>
                )}
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-5 py-3 font-mono text-[11.5px] font-bold text-slate-700">{b.refCode}</td>
                    <td className="px-3 py-3 capitalize">{b.kind}</td>
                    <td className="px-3 py-3">{b.userName} <span className="text-slate-400">· {b.userPhone}</span></td>
                    <td className="px-3 py-3 max-w-[220px] truncate">{b.service}</td>
                    <td className="px-3 py-3 font-bold">{b.amount ? shortINR(b.amount) : "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${b.status === "escrow_pending" ? "bg-amber-50 text-amber-700" : b.status === "released" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">{fmtDate(new Date(b.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
