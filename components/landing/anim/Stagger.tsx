"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

interface StaggerProps {
  as?: "div" | "section" | "ul" | "ol";
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
}

export function Stagger({
  as = "div",
  children,
  className,
  delay = 0,
  stagger = 0.12,
  amount = 0.2,
}: StaggerProps) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: reduce ? 0 : stagger,
      },
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
    <Comp className={className} variants={container} {...triggerProps}>
      {children}
    </Comp>
  );
}

interface StaggerItemProps {
  as?: "div" | "li" | "article" | "section";
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
}

export function StaggerItem({
  as = "div",
  children,
  className,
  y = 20,
  duration = 0.6,
}: StaggerItemProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
  };

  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} variants={variants}>
      {children}
    </Comp>
  );
}
