import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-slate-900">404 — Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The link may be broken or the page has moved. Start here to save on taxes:
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-600"
        >
          Home
        </Link>
        <Link
          href="/tax-saver"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Tax Saver
        </Link>
      </div>
    </div>
  );
}
