import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

/**
 * Drop-in, CSS-only replacement for the few `motion.*` elements on the landing page.
 * framer-motion server-renders `initial={{opacity:0}}` as inline style, which leaves the
 * page blank until hydration completes (bad on 3G / blocked JS). This version is always
 * visible without JS; `transition.delay` maps to a CSS animation-delay.
 */
type Props = HTMLAttributes<HTMLElement> & {
  initial?: unknown;
  animate?: unknown;
  transition?: { delay?: number; duration?: number; ease?: unknown };
  children?: ReactNode;
};

function make(tag: ElementType) {
  return function MotionLite({ initial, animate, transition, className, style, children, ...rest }: Props) {
    void initial;
    void animate;
    const Tag = tag;
    const own = className ?? "";
    const hasOwnAnim = /\banimate-/.test(own);
    const s: CSSProperties = { ...style, ...(hasOwnAnim ? {} : { animationDelay: `${Math.min(transition?.delay ?? 0, 0.5)}s` }) };
    return (
      <Tag className={`${hasOwnAnim ? "" : "animate-rise "}${own}`} style={s} {...rest}>
        {children}
      </Tag>
    );
  };
}

export const motion = {
  div: make("div"),
  h1: make("h1"),
  p: make("p"),
};
