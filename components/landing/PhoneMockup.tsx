"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BatteryFull, Signal, Wifi } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const CHASSIS_GRADIENT =
  "linear-gradient(145deg, #1a1a1a 0%, #000000 50%, #2a2a2a 100%)";

const CHASSIS_HIGHLIGHT =
  "linear-gradient(135deg, rgba(255,255,255,0.18), transparent 40%)";

const SCREEN_REFLECTION =
  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%)";

const CHASSIS_SHADOW =
  "0 10px 30px -5px rgba(0,0,0,0.18), 0 30px 60px -15px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.06)";

export interface PhoneMockupProps {
  children: React.ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto"
      style={{ perspective: "1200px" }}
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: EASE, delay: 0.3 }}
      aria-hidden="true"
    >
      <motion.div
        className="relative h-[580px] w-[280px] rounded-[48px] p-3 md:h-[660px] md:w-[320px] md:rounded-[56px] md:p-3.5"
        style={{
          background: CHASSIS_GRADIENT,
          boxShadow: CHASSIS_SHADOW,
          transformStyle: "preserve-3d",
        }}
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={
          reduceMotion
            ? undefined
            : {
                rotateY: 3,
                rotateX: -2,
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" },
              }
        }
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: CHASSIS_HIGHLIGHT }}
        />

        <span className="absolute left-[-2px] top-[88px] h-8 w-[3px] rounded-l-sm bg-neutral-800 md:top-[100px]" />
        <span className="absolute left-[-2px] top-[132px] h-12 w-[3px] rounded-l-sm bg-neutral-800 md:top-[150px]" />
        <span className="absolute left-[-2px] top-[180px] h-12 w-[3px] rounded-l-sm bg-neutral-800 md:top-[200px]" />
        <span className="absolute right-[-2px] top-[124px] h-16 w-[3px] rounded-r-sm bg-neutral-800 md:top-[140px]" />

        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-background md:rounded-[44px]">
          <div
            className="absolute left-1/2 top-2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black"
            style={{ boxShadow: "inset 0 0 2px rgba(255,255,255,0.1)" }}
          />

          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-3 text-[11px] font-medium text-foreground">
            <span className="tabular-nums">9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" strokeWidth={2.5} />
              <Wifi className="h-3 w-3" strokeWidth={2.5} />
              <BatteryFull className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
          </div>

          <div className="h-full overflow-y-auto px-5 pb-8 pt-12">
            {children}
          </div>

          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
            style={{ background: SCREEN_REFLECTION }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
