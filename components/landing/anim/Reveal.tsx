"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  as?: "div" | "section" | "header" | "article" | "li" | "ul" | "ol";
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  amount?: number;
  id?: string;
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 20,
  amount = 0.25,
  id,
}: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE, delay },
    },
  };

  const triggerProps = reduce
    ? ({ initial: "visible" as const, animate: "visible" as const })
    : ({
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount },
      });

  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp id={id} className={className} variants={variants} {...triggerProps}>
      {children}
    </Comp>
  );
}
