import { NextResponse, type NextRequest } from "next/server";

/**
 * Affiliate referral middleware (Next 16 "proxy" convention).
 * Captures ?ref=CODE / ?utm_source=taxmitra_partner and plants an httpOnly
 * cookie so partner clicks can be attributed to the right channel.
 */
export default function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const res = NextResponse.next();
  if (ref && /^[A-Za-z0-9_-]{3,40}$/.test(ref)) {
    res.cookies.set("tm_ref", ref, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 86_400,
      path: "/",
    });
  }
  // Security headers for SOC-2-ready posture.
  // NOTE: no X-Frame-Options — the app must render inside preview iframes
  // (WebViews, partner dashboards); use CSP frame-ancestors later if needed.
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|sw.js|api/cron).*)"],
};
