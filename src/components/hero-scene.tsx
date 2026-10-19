"use client";

import {
  BellRing,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Pill } from "@/components/ui";
import Tilt3D from "@/components/tilt-3d";

/**
 * Layered 3D "tax health" device for the hero:
 * - outer layer: perspective + gentle idle float (CSS)
 * - Tilt3D: pointer-driven rotateX/rotateY with glare
 * - inner content pushed on the Z axis so chips feel physically separated
 * All animations are transform/opacity only — cheap on 3G-class phones.
 */
export default function HeroScene() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] lg:max-w-[380px]" style={{ perspective: "1400px" }}>
      <Tilt3D maxTilt={9} glare className="animate-float-3d">
        <div
          className="relative rounded-[2.6rem] border border-white/10 bg-gradient-to-b from-slate-800/95 to-slate-900 p-2.5 shadow-2xl shadow-emerald-950/60"
          style={{ transform: "translateZ(28px)", transformStyle: "preserve-3d" }}
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-50 p-4 text-slate-900">
            {/* soft depth light behind the inner screen */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-emerald-300/25 blur-3xl"
            />
            <div className="relative">
              <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Tax Health FY 25-26</p>
                <Pill tone="emerald" className="px-2 py-0.5 text-[10px]">
                  LIVE
                </Pill>
              </div>

              <div className="mt-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-900/30">
                <p className="text-[11px] font-semibold text-emerald-100">
                  New regime se aap bachayenge
                </p>
                <p className="mt-0.5 text-3xl font-extrabold tracking-tight">₹42,500</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-emerald-100">
                    <span>New regime</span>
                    <span>₹28,600</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <div className="h-full w-[34%] rounded-full bg-white" />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-emerald-100/80">
                    <span>Old regime</span>
                    <span>₹71,100</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <div className="h-full w-[84%] rounded-full bg-amber-300/90" />
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  <p className="mt-1.5 text-[11px] font-bold text-slate-800">ITR-1 ready</p>
                  <p className="text-[10px] text-slate-400">ETA 4:32 min</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <BellRing className="h-4 w-4 text-amber-500" />
                  <p className="mt-1.5 text-[11px] font-bold text-slate-800">GSTR-3B</p>
                  <p className="text-[10px] text-slate-400">Due in 6 days</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-[10.5px] leading-snug font-semibold text-emerald-800">
                  87A rebate applied — ₹12L tak zero tax. Nice!
                </p>
              </div>
            </div>
          </div>
        </div>
      </Tilt3D>

      {/* Floating 3D chips — separate layers on the Z axis */}
      <div
        className="animate-orbit-point absolute -left-5 top-8 hidden sm:block"
        style={{ perspective: "600px" }}
      >
        <div className="animate-float-3d [animation-delay:1.2s]">
          <div
            className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-xl shadow-emerald-950/30 backdrop-blur-md [transform:rotateX(14deg)_rotateY(-16deg)_translateZ(40px)]"
          >
            <p className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
              CIBIL estimate
            </p>
            <p className="text-lg font-extrabold text-emerald-300">782</p>
          </div>
        </div>
      </div>

      <div
        className="animate-orbit-point absolute -right-4 bottom-14 hidden sm:block"
        style={{ perspective: "600px" }}
      >
        <div className="animate-float-3d [animation-delay:2.1s]">
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-xl shadow-emerald-950/30 backdrop-blur-md [transform:rotateX(-12deg)_rotateY(14deg)_translateZ(40px)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#25D366]/90 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                WhatsApp
              </p>
              <p className="text-xs font-bold text-white">Invoice shared ✓</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient rings for depth — placed in the hero parent's perspective context */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10"
        style={{ perspective: "1000px" }}
      >
        <div className="absolute inset-0 rounded-[3rem] border border-emerald-400/10 [transform:rotateX(58deg)_translateZ(-60px)]" />
        <div className="absolute inset-6 rounded-[3rem] border border-emerald-400/15 [transform:rotateX(58deg)_translateZ(-30px)]" />
      </div>
    </div>
  );
}
