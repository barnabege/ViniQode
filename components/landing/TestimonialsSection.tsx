"use client";

import { Reveal } from "./anim/Reveal";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  region: string;
}

const TESTIMONIALS: [Testimonial, Testimonial] = [
  {
    quote:
      "J'ai créé mes douze e-labels en moins d'une matinée. La DGCCRF est passée le mois suivant : zéro remarque.",
    name: "Hélène Riedel",
    role: "Domaine Riedel — 8 ha",
    region: "Alsace",
  },
  {
    quote:
      "On me parle vigneron, pas législateur. Le formulaire est limpide, les calculs nutritionnels sont automatiques.",
    name: "Antoine Leclerc",
    role: "Clos des Trois Pierres — 14 ha",
    region: "Bourgogne",
  },
];

export function TestimonialsSection() {
  const [first, second] = TESTIMONIALS;

  return (
    <section className="relative border-b border-border bg-background">
      <div className="container-page py-24 sm:py-28 lg:py-32">
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
              Nº 05
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Voix de la filière
            </h2>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Deux retours
          </span>
        </Reveal>

        {/* ── Grille asymétrique : 7 / 5 avec offset vertical sur la droite ── */}
        <div className="mt-14 grid gap-y-16 lg:mt-20 lg:grid-cols-12 lg:gap-x-12">
          <Reveal y={16} delay={0.05} className="lg:col-span-7">
            <Quote testimonial={first} size="large" />
          </Reveal>
          <Reveal y={16} delay={0.2} className="lg:col-span-5 lg:pt-24">
            <Quote testimonial={second} size="small" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Quote({
  testimonial,
  size,
}: {
  testimonial: Testimonial;
  size: "large" | "small";
}) {
  const quoteStyle =
    size === "large"
      ? { fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.25 }
      : { fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)", lineHeight: 1.3 };

  return (
    <article>
      {/* Hairline header avec nom du vigneron en eyebrow */}
      <header className="flex items-center gap-4 border-t border-foreground pt-5">
        <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground">
          {testimonial.name}
        </span>
      </header>

      <blockquote className="mt-8">
        <p
          className="font-serif italic tracking-[-0.01em] text-foreground"
          style={quoteStyle}
        >
          <span aria-hidden="true" className="text-wine">«&nbsp;</span>
          {testimonial.quote}
          <span aria-hidden="true" className="text-wine">&nbsp;»</span>
        </p>
      </blockquote>

      <footer className="mt-7 flex items-center gap-3 text-xs text-muted">
        <span aria-hidden="true" className="h-px w-6 bg-border" />
        <span>{testimonial.role}</span>
        <span aria-hidden="true">·</span>
        <span>{testimonial.region}</span>
      </footer>
    </article>
  );
}
