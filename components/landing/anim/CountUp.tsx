"use client";

import * as React from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  motion,
} from "framer-motion";

interface CountUpProps {
  to: number;
  duration?: number;
  className?: string;
  formatter?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
}

const defaultFormatter = (n: number) =>
  Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ");

export function CountUp({
  to,
  duration = 1.5,
  className,
  formatter = defaultFormatter,
  prefix = "",
  suffix = "",
  ariaLabel,
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  const mv = useMotionValue(reduce ? to : 0);
  const display = useTransform(mv, (v) => `${prefix}${formatter(v)}${suffix}`);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(to);
      return;
    }
    const controls = animate(mv, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, reduce, mv, to, duration]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={ariaLabel ?? `${prefix}${formatter(to)}${suffix}`}
    >
      <motion.span aria-hidden="true">{display}</motion.span>
    </span>
  );
}
