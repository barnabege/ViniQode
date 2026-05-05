"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: 1,
    title: "Créez votre compte",
    body: "Inscription en 2 minutes, sans carte bancaire.",
  },
  {
    n: 2,
    title: "Saisissez vos cuvées",
    body:
      "Formulaire guidé, calcul automatique des valeurs nutritionnelles.",
  },
  {
    n: 3,
    title: "Générez le QR code",
    body: "Conforme GS1, haute résolution, prêt pour l'imprimeur.",
  },
  {
    n: 4,
    title: "Mettez à jour sans réimprimer",
    body:
      "Vos données changent, votre page e-label se met à jour instantanément.",
  },
];

const eyebrowVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.1 },
  },
};

const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.2, ease: "easeOut", delay: 0.2 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.3 + i * 0.15 },
  }),
};

export function SolutionSection() {
  const reduceMotion = useReducedMotion();

  // Quand prefers-reduced-motion est actif : aucun trigger viewport,
  // les éléments sont rendus directement à l'état "visible" (pas de mouvement,
  // pas de fade — instantané). Sinon : viewport-trigger avec amount: 0.3 once.
  const triggerProps = reduceMotion
    ? ({ initial: "visible", animate: "visible" } as const)
    : ({
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.3 },
      } as const);

  return (
    <motion.section
      id="fonctionnalites"
      className="bg-surface py-20 sm:py-24"
      {...triggerProps}
    >
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.p variants={eyebrowVariants} className="label-eyebrow">
              La solution
            </motion.p>
            <motion.h2
              variants={titleVariants}
              className="mt-4 font-serif text-3xl leading-[1.1] text-foreground sm:text-4xl lg:text-5xl"
            >
              Créez votre e-label en 4 étapes.
            </motion.h2>
          </div>

          <ol className="relative space-y-10 pl-8 sm:pl-10">
            <motion.span
              aria-hidden="true"
              variants={lineVariants}
              style={{ transformOrigin: "top" }}
              className="absolute left-0 top-0 h-full w-px bg-border"
            />

            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                custom={i}
                variants={stepVariants}
                className="relative"
              >
                <span className="absolute -left-[44px] top-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent bg-background text-sm font-semibold text-accent sm:-left-[52px]">
                  {s.n}
                </span>
                <h3 className="font-serif text-xl text-foreground sm:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {s.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </motion.section>
  );
}
