"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CountUp } from "./anim/CountUp";
import { Reveal } from "./anim/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const SUB_STATS = [
  {
    value: 10,
    suffix: " min",
    label: "Pour être conforme",
    sub: "Bout-à-bout, première cuvée publiée.",
  },
  {
    value: 24,
    suffix: " langues",
    label: "UE supportées",
    sub: "Détection automatique, sans configuration.",
  },
  {
    value: 8,
    suffix: " déc. 2023",
    label: "Entrée en vigueur",
    sub: "Règlement européen 2021/2117.",
  },
] as const;

export function StatsSection() {
  const reduce = useReducedMotion();

  const ruleVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.9, ease: EASE, delay: 0.4 },
    },
  };

  const ruleTrigger = reduce
    ? ({ initial: "visible" as const, animate: "visible" as const })
    : ({
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.4 },
      });

  return (
    <section className="relative border-b border-border bg-background">
      <div className="container-page py-24 sm:py-28 lg:py-32">
        {/* ── Folio en-tête ───────────────────────────────────────────── */}
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="font-serif text-sm italic text-wine"
            >
              Nº 01
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Le constat
            </h2>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            ViniQode — En chiffres
          </span>
        </Reveal>

        {/* ── Numéral héroïque + marginalia ───────────────────────────── */}
        <div className="mt-14 grid items-start gap-y-16 lg:mt-20 lg:grid-cols-12 lg:gap-x-16">
          {/* Hero numeral */}
          <div className="lg:col-span-7">
            <Reveal y={28} delay={0.05}>
              <p
                className="font-serif italic leading-[0.82] tracking-[-0.025em] text-foreground"
                style={{ fontSize: "clamp(4rem, 15vw, 13rem)" }}
              >
                <CountUp
                  to={47000}
                  duration={2}
                  ariaLabel="47 000 vignerons concernés"
                />
              </p>
            </Reveal>

            {/* Rature wine — seul accent wine de la section */}
            <motion.span
              aria-hidden="true"
              variants={ruleVariants}
              {...ruleTrigger}
              style={{ transformOrigin: "left" }}
              className="mt-7 block h-[2px] w-20 bg-wine"
            />

            <Reveal y={12} delay={0.3}>
              <p className="mt-7 font-sans text-xl font-medium leading-snug text-foreground sm:text-2xl">
                vignerons concernés en France
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Soit la quasi-totalité de la filière artisanale, des
                exploitations familiales aux grandes maisons.
              </p>
            </Reveal>
          </div>

          {/* Marginalia : trois sous-statistiques */}
          <ol className="space-y-12 lg:col-span-5 lg:space-y-14 lg:pt-10">
            {SUB_STATS.map((stat, i) => (
              <Reveal
                key={stat.label}
                as="li"
                y={16}
                delay={0.2 + i * 0.1}
              >
                <article className="relative pl-6 sm:pl-7">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-1 w-px bg-border"
                  />
                  <p className="font-serif text-4xl italic leading-none tracking-[-0.02em] text-foreground sm:text-5xl">
                    <CountUp
                      to={stat.value}
                      suffix={stat.suffix}
                      ariaLabel={`${stat.value}${stat.suffix} ${stat.label}`}
                    />
                  </p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.25em] text-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1.5 max-w-[28ch] text-sm leading-relaxed text-muted">
                    {stat.sub}
                  </p>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
