import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import SiteNavbar from "@/components/site-navbar";
import BottomNav from "@/components/bottom-nav";
import SiteFooter from "@/components/site-footer";
import PwaRegister from "@/components/pwa-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://taxmitra.in"),
  title: {
    default: "TaxMitra — Aapka Tax, Aapka AI | ITR, GST, Loans & Tax Saving",
    template: "%s | TaxMitra",
  },
  description:
    "AI-powered Finance, Tax & GST platform for 10 Cr+ Indian taxpayers and 6 Cr+ MSMEs. 5-minute ITR filing, old vs new regime comparison, EMI calculator, GST invoices and CA marketplace. FY 2025-26 updated.",
  keywords: [
    "ITR filing FY 2025-26",
    "income tax calculator new regime vs old regime",
    "GST invoice generator",
    "EMI calculator",
    "tax saving 80C",
    "CA marketplace India",
  ],
  openGraph: {
    title: "TaxMitra — Aapka Tax, Aapka AI",
    description:
      "5-minute ITR filing, instant regime comparison, GST invoicing & CA-verified help. Built for Bharat.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-slate-900 antialiased pb-16 md:pb-0">
        <LanguageProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <SiteNavbar />
          <main id="main" className="min-h-[70vh]">
            {children}
          </main>
          <SiteFooter />
          <BottomNav />
          <PwaRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
