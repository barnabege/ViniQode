"use client";

import { Reveal } from "./anim/Reveal";

export function PullQuoteSection() {
  return (
    <section className="relative border-b border-border bg-paper">
      <div className="container-page py-28 sm:py-36 lg:py-44">
        <Reveal y={10}>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Note de conception
          </span>
        </Reveal>

        <Reveal y={20} delay={0.1}>
          <blockquote className="mt-8 max-w-5xl">
            <p
              className="font-serif italic leading-[1.02] tracking-[-0.02em] text-foreground"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
            >
              <span
                aria-hidden="true"
                className="text-wine"
                style={{ marginRight: "0.05em" }}
              >
                «
              </span>
              Le règlement existe. Le vigneron travaille.{" "}
              <span className="text-wine">L&apos;outil s&apos;efface.</span>
              <span
                aria-hidden="true"
                className="text-wine"
                style={{ marginLeft: "0.05em" }}
              >
                »
              </span>
            </p>
          </blockquote>
        </Reveal>

        <Reveal y={10} delay={0.3}>
          <footer className="mt-12 flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-foreground" />
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground">
              Le credo ViniQode
            </p>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}
