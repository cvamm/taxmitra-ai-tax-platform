import { NextResponse } from "next/server";
import { db } from "@/db";
import { loanProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LOAN_PRODUCTS_STATIC } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type");
  try {
    const rows = type
      ? await db.select().from(loanProducts).where(eq(loanProducts.type, type))
      : await db.select().from(loanProducts);
    if (rows.length > 0) return NextResponse.json({ source: "db", items: rows });
  } catch {
    /* fall through */
  }
  const items = type ? LOAN_PRODUCTS_STATIC.filter((p) => p.type === type) : LOAN_PRODUCTS_STATIC;
  return NextResponse.json({ source: "static", items });
}
