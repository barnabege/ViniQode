"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Reveal } from "./anim/Reveal";

interface QA {
  q: string;
  a: string;
}

const ITEMS: QA[] = [
  {
    q: "Mon QR code sera-t-il vraiment conforme ?",
    a: "Oui. Les pages e-label ViniQode respectent toutes les exigences du règlement (UE) 2021/2117 — sans publicité, sans cookies, sans tracking, accessibles dans les 24 langues officielles de l'Union.",
  },
  {
    q: "Que se passe-t-il si je change d'ingrédients entre deux millésimes ?",
    a: "Vous mettez à jour les données dans votre tableau de bord. La page e-label suit instantanément, sans réimprimer vos étiquettes — le QR code pointe toujours vers la version à jour.",
  },
  {
    q: "L'obligation s'applique-t-elle à mes vins exportés hors UE ?",
    a: "Non. Une dérogation accordée par la DGCCRF en juillet 2024 dispense les vins destinés exclusivement à l'export hors UE. En pratique, la plupart des vignerons font une seule étiquette pour tous les marchés.",
  },
  {
    q: "Combien de temps mes pages restent-elles en ligne ?",
    a: "Tant que vous êtes abonné, vos pages sont accessibles. La réglementation exige une disponibilité de 3 à 10 ans — ViniQode garantit la pérennité des liens sur dix ans.",
  },
];

export function FaqSection() {
  return (
    <section
      id="a-propos"
      className="relative border-b border-border bg-background"
    >
      <div className="container-page py-24 sm:py-28 lg:py-32">
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm italic text-wine">Nº 07</span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Questions
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Quatre réponses
          </span>
        </Reveal>

        <div className="mt-14 grid gap-y-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-12">
          {/* Colonne sticky à gauche */}
          <Reveal y={16} className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <h2
              className="font-sans font-medium tracking-display text-foreground"
              style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 1.05 }}
            >
              Ce qu&apos;on{" "}
              <span className="font-serif italic text-wine">
                nous demande,
              </span>{" "}
              le plus souvent.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              Vous avez une autre question ?{" "}
              <Link
                href="mailto:contact@viniqode.fr"
                className="link-editorial text-foreground"
              >
                Contactez-nous
              </Link>{" "}
              — réponse sous 24 h, en français.
            </p>
          </Reveal>

          {/* Accordéon à droite */}
          <Reveal y={16} delay={0.1} className="lg:col-span-7">
            <Accordion type="single" collapsible>
              {ITEMS.map((item, idx) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${idx}`}
                  className="border-border first:border-t first:border-foreground"
                >
                  <AccordionTrigger className="text-base font-medium hover:text-wine sm:text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
