"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

/**
 * 3D tilt on pointer hover, powered by CSS perspective + transform.
 * GPU-composited (transform/opacity only), no layout work. Disabled
 * automatically when `prefers-reduced-motion` is set, so it degrades
 * to a static card on most phones / accessibility settings.
 */
function motionOk(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches
  );
}

export default function Tilt3D({
  children,
  className = "",
  perspective = 900,
  maxTilt = 8,
  glare = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  perspective?: number;
  maxTilt?: number;
  glare?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // `enabled` is read during render so SSR/hydration stay identical;
  // motion queries are only trusted client-side.
  const [enabled] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia?.("(pointer: fine)").matches && motionOk()
  );

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = ((0.5 - py) * 2 * maxTilt).toFixed(2);
    const ry = ((px - 0.5) * 2 * maxTilt).toFixed(2);
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1)`;
    if (glare) {
      el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-on", "1");
    }
  }

  function onLeave() {
    if (!ref.current) return;
    ref.current.style.transform = "";
    if (glare) ref.current.style.setProperty("--glare-on", "0");
  }

  return (
    <div style={{ perspective: `${perspective}px`, ...style }} className={className}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative h-full w-full transition-transform duration-200 ease-out [transform-style:preserve-3d] will-change-transform"
      >
        {children}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              opacity: "calc(var(--glare-on, 0) * 0.55)",
              transition: "opacity 300ms ease",
              background:
                "radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 45%, transparent 72%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
