"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./anim/Reveal";

interface Plan {
  name: string;
  price: string;
  cadence: string;
  subtitle: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Gratuit",
    price: "0 €",
    cadence: "à vie",
    subtitle: "Pour vos trois premières cuvées.",
    features: [
      "Jusqu'à 3 QR codes e-label",
      "Page hébergée et conforme",
      "Tableau de bord simple",
      "Sans carte bancaire",
    ],
    cta: "Commencer gratuitement",
    ctaHref: "/inscription",
  },
  {
    name: "Essentiel",
    price: "99 €",
    cadence: "/ an",
    subtitle: "Soit 8,25 € par mois.",
    features: [
      "QR codes illimités",
      "Mises à jour illimitées",
      "Multilingue UE — 24 langues",
      "Support email sous 48 h",
    ],
    cta: "Choisir Essentiel",
    ctaHref: "/inscription?plan=essentiel",
    featured: true,
  },
  {
    name: "Pro",
    price: "149 €",
    cadence: "/ an",
    subtitle: "Soit 12,40 € par mois.",
    features: [
      "Tout l'Essentiel inclus",
      "Analytics des scans",
      "Export PDF technique",
      "Support prioritaire 24 h",
    ],
    cta: "Choisir Pro",
    ctaHref: "/inscription?plan=pro",
  },
];

export function PricingSection() {
  return (
    <section
      id="tarifs"
      className="relative border-b border-border bg-background"
    >
      <div className="container-page py-24 sm:py-28 lg:py-32">
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm italic text-wine">Nº 06</span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Tarifs
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Sans carte bancaire
          </span>
        </Reveal>

        <Reveal y={16} delay={0.1}>
          <h2
            className="mt-10 max-w-3xl font-sans font-medium tracking-display text-foreground"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Commencez gratuitement.{" "}
            <span className="font-serif italic text-wine">
              Évoluez sans engagement.
            </span>
          </h2>
        </Reveal>

        {/* ── Trois colonnes typographiques, hairline rules entre elles ── */}
        <div className="mt-14 grid divide-y divide-border border-y border-border lg:mt-20 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {PLANS.map((plan, i) => (
            <Reveal
              key={plan.name}
              y={16}
              delay={0.05 + i * 0.08}
              className="px-2 py-10 lg:px-10 lg:py-14"
            >
              <PlanColumn plan={plan} />
            </Reveal>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted">
          Besoin d&apos;une API ou de plusieurs établissements ?{" "}
          <Link
            href="mailto:contact@viniqode.fr"
            className="link-editorial text-foreground"
          >
            Contactez-nous
          </Link>{" "}
          pour une offre Business.
        </p>
      </div>
    </section>
  );
}

function PlanColumn({ plan }: { plan: Plan }) {
  return (
    <article className="flex h-full flex-col">
      {plan.featured && (
        <span className="font-serif text-sm italic text-wine">
          Recommandé
        </span>
      )}
      <h3
        className={`font-sans text-lg font-medium tracking-tight text-foreground ${
          plan.featured ? "mt-2" : ""
        }`}
      >
        {plan.name}
      </h3>

      <div className="mt-6 flex items-baseline gap-2">
        <p
          className="font-serif italic leading-none tracking-[-0.025em] text-foreground"
          style={{ fontSize: "clamp(2.75rem, 5vw, 3.75rem)" }}
        >
          {plan.price}
        </p>
        <p className="text-sm text-muted">{plan.cadence}</p>
      </div>
      <p className="mt-2 text-sm text-muted">{plan.subtitle}</p>

      <ul className="mt-8 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
          >
            <span aria-hidden="true" className="mt-2 h-px w-3 flex-shrink-0 bg-foreground" />
            <span className="leading-relaxed text-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {plan.featured ? (
          <Link
            href={plan.ctaHref}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors duration-300 ease-editorial hover:bg-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {plan.cta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ) : (
          <Link
            href={plan.ctaHref}
            className="group inline-flex w-full items-center justify-between gap-2 border-b border-foreground pb-3 text-sm font-medium text-foreground transition-colors duration-300 ease-editorial hover:border-wine hover:text-wine focus-visible:outline-none focus-visible:text-wine focus-visible:border-wine"
          >
            {plan.cta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </article>
  );
}
