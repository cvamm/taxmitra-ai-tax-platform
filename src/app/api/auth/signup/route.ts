import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, hashPassword, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; phone?: string; password?: string; consent?: boolean };
    const name = String(body.name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 120);
    const phone = String(body.phone ?? "").replace(/\D/g, "").slice(-10) || null;
    const password = String(body.password ?? "");

    if (!name) return NextResponse.json({ ok: false, error: "Naam zaroori hai." }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, error: "Valid email daalein." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ ok: false, error: "Password kam se kam 8 characters ka ho." }, { status: 400 });
    if (!body.consent) return NextResponse.json({ ok: false, error: "DPDP consent required hai." }, { status: 400 });

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: "Is email se account already hai — sign in karein." }, { status: 409 });
    }

    const [row] = await db
      .insert(users)
      .values({ name, email, phone, passwordHash: hashPassword(password), consentAt: new Date() })
      .returning({ id: users.id });

    const token = await createSession(row.id);
    const cookie = sessionCookie(token);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Signup failed. Database ready hai?" }, { status: 500 });
  }
}
