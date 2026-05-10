"use client";

import { Reveal } from "./anim/Reveal";

interface Step {
  num: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Créez votre compte",
    body: "Inscription en deux minutes, sans carte bancaire.",
  },
  {
    num: "02",
    title: "Saisissez vos cuvées",
    body: "Formulaire guidé, calcul automatique des valeurs nutritionnelles.",
  },
  {
    num: "03",
    title: "Générez votre QR code",
    body: "Conforme GS1, haute résolution, prêt pour l'imprimeur.",
  },
  {
    num: "04",
    title: "Mettez à jour sans réimprimer",
    body: "Vos données changent, votre page e-label suit instantanément.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="comment-ca-marche"
      className="relative border-b border-border bg-background"
    >
      <div className="container-page py-24 sm:py-28 lg:py-32">
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm italic text-wine">Nº 03</span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Méthode
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Quatre étapes
          </span>
        </Reveal>

        <Reveal y={16} delay={0.1}>
          <h2
            className="mt-10 max-w-3xl font-sans font-medium tracking-display text-foreground"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 1.05 }}
          >
            De l&apos;inscription{" "}
            <span className="font-serif italic text-wine">
              au QR code imprimé.
            </span>
          </h2>
        </Reveal>

        {/* Liste numérotée éditoriale — pas de cartes, pas d'icônes */}
        <ol className="mt-14 lg:mt-20">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.num}
              as="li"
              y={16}
              delay={0.05 + i * 0.08}
              className="border-t border-border first:border-t-0 lg:first:border-t lg:first:border-foreground"
            >
              <div className="grid gap-y-3 py-7 lg:grid-cols-[120px_1fr_2fr] lg:items-baseline lg:gap-x-10 lg:py-9">
                <span
                  className="font-serif text-3xl italic leading-none text-wine sm:text-4xl"
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <h3 className="font-sans text-lg font-medium leading-tight text-foreground sm:text-xl">
                  {step.title}
                </h3>
                <p className="max-w-md text-sm leading-relaxed text-muted lg:max-w-none">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
