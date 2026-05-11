"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { PhoneAnimation } from "./PhoneAnimation";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: 0.05,
      },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <section className="relative isolate border-b border-border bg-background">
      <div className="container-page pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        {/* ── Folio en-tête : Nº — Référence — Établi ────────────────── */}
        <motion.header
          initial={reduce ? "visible" : "hidden"}
          animate="visible"
          variants={container}
          className="mb-14 flex flex-wrap items-center justify-between gap-y-2 sm:mb-20 lg:mb-24"
        >
          <motion.div
            variants={item}
            className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-muted"
          >
            <span className="font-serif text-sm italic normal-case tracking-normal text-wine">
              Nº 00
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span>Règlement (UE) 2021/2117</span>
          </motion.div>
          <motion.span
            variants={item}
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted"
          >
            Établi 2026
          </motion.span>
        </motion.header>

        {/* ── Titre + mockup en grille asymétrique ─────────────────────── */}
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
          {/* Bloc texte */}
          <motion.div
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            variants={container}
            className="lg:col-span-7"
          >
            <motion.h1
              variants={item}
              className="font-sans font-medium tracking-display text-foreground"
              style={{ fontSize: "clamp(2.75rem, 7.4vw, 5.25rem)", lineHeight: 1.02 }}
            >
              L&apos;e-label{" "}
              <span className="font-serif italic text-wine">conforme,</span>
              <br />
              en dix minutes.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            >
              Depuis le 8 décembre 2023, tout vin commercialisé dans
              l&apos;UE doit afficher ses ingrédients et valeurs
              nutritionnelles. En France, 53 000 exploitations sont
              concernées. ViniQode est la solution la plus simple et
              la plus rapide pour les vignerons — sans publicité, sans
              tracking, accessible dix ans.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7"
            >
              <Link
                href="/inscription"
                className="group inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors duration-300 ease-editorial hover:bg-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Créer mon e-label
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <span className="flex items-center gap-3 text-xs text-muted">
                <span aria-hidden="true" className="h-px w-6 bg-border" />
                Sans carte bancaire · 3 cuvées gratuites
              </span>
            </motion.div>
          </motion.div>

          {/* Mockup ancré — pas de float, taille modérée */}
          <motion.div
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="hidden justify-end lg:col-span-5 lg:flex"
          >
            <div className="w-full max-w-[260px]">
              <PhoneAnimation />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
