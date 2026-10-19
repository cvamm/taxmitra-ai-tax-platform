import type { ReactNode } from "react";

/**
 * Entrance animation that NEVER hides content when JS is slow/blocked:
 * pure CSS (`animate-rise`), server-rendered, no hydration dependency.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <div className={`animate-rise ${className ?? ""}`} style={{ animationDelay: `${Math.min(delay, 0.4)}s` }}>
      {children}
    </div>
  );
}
