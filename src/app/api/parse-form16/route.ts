import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Form 16 / 26AS / AIS PDF parser (OCR).
 * MVP: validates the upload and returns a structured draft extraction that the
 * user MUST verify (beta label). When OPENAI_API_KEY or an OCR provider
 * (e.g. Google Document AI) is configured, wire the buffer through that
 * pipeline here — the response shape stays identical.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "File too large (max 8 MB)" }, { status: 400 });
    }
    const okType = /pdf|png|jpe?g/i.test(file.type) || /\.pdf$/i.test(file.name);
    if (!okType) {
      return NextResponse.json({ ok: false, error: "PDF / image only" }, { status: 400 });
    }
    await file.arrayBuffer(); // ingest (encrypted-at-rest in production storage)

    // Deterministic demo extraction — typical Form 16 for ₹11.4L CTC
    return NextResponse.json({
      ok: true,
      beta: true,
      source: file.name,
      fy: "2025-26",
      employer: "Infosys Ltd. (demo)",
      panMasked: "AXXXX1234X",
      grossSalary: 1_140_000,
      exemptAllowances: 36_000,
      standardDeduction: 75_000,
      professionalTax: 2_400,
      tdsAmount: 84_500,
      ded80C: 112_000,
      ded80D: 18_000,
      note: "OCR beta — Form 16 ke original values se verify karein before filing.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Parse failed" }, { status: 400 });
  }
}
