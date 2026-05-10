"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./anim/Reveal";

export function CtaFinalSection() {
  return (
    <section className="relative border-b border-border bg-paper">
      <div className="container-page py-28 sm:py-36 lg:py-44">
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm italic text-wine">Nº 08</span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Conformité immédiate
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Sans engagement
          </span>
        </Reveal>

        <div className="mt-14 grid items-end gap-y-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-12">
          <Reveal y={20} className="lg:col-span-8">
            <h2
              className="font-sans font-medium tracking-display text-foreground"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.04 }}
            >
              Prêt à mettre votre domaine{" "}
              <span className="font-serif italic text-wine">
                en conformité ?
              </span>
            </h2>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              En dix minutes, vos premières cuvées sont publiées avec un
              QR code conforme au règlement (UE) 2021/2117. Sans carte
              bancaire, sans engagement.
            </p>
          </Reveal>

          <Reveal y={20} delay={0.15} className="lg:col-span-4">
            <div className="flex flex-col items-start gap-5">
              <Link
                href="/inscription"
                className="group inline-flex items-center gap-2 rounded-md bg-foreground px-7 py-4 text-sm font-medium text-background transition-colors duration-300 ease-editorial hover:bg-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Créer mon e-label
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="#tarifs"
                className="link-editorial text-sm font-medium text-foreground"
              >
                Voir les tarifs en détail
              </Link>
              <p className="mt-3 text-xs text-muted">
                Sans carte bancaire · 3 cuvées gratuites · Conformité garantie
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
