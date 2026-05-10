"use client";

import { Reveal } from "./anim/Reveal";

interface Item {
  name: string;
  body: string;
}

interface Group {
  title: string;
  caption: string;
  items: Item[];
}

const GROUPS: Group[] = [
  {
    title: "Côté production",
    caption: "Ce qui se passe pendant la mise en bouteille.",
    items: [
      {
        name: "QR code généré en 10 minutes",
        body: "Formulaire guidé, calculs nutritionnels automatiques, export GS1 prêt pour l'imprimeur.",
      },
      {
        name: "Mises à jour sans réimpression",
        body: "Vos données changent : le lien reste, la page se met à jour. L'étiquette ne bouge pas.",
      },
      {
        name: "Étiquettes physiques en option",
        body: "Stickers QR code et contre-étiquettes personnalisés, livrés en cinq jours ouvrés.",
      },
    ],
  },
  {
    title: "Côté consommateur",
    caption: "Ce que voit la personne qui scanne, en cave ou ailleurs.",
    items: [
      {
        name: "Conformité (UE) 2021/2117",
        body: "Ingrédients, allergènes, déclaration nutritionnelle, lot — toutes les exigences couvertes.",
      },
      {
        name: "Multilingue, 24 langues UE",
        body: "Détection automatique de la langue du visiteur. Aucune configuration côté vigneron.",
      },
      {
        name: "Sans publicité, sans tracking",
        body: "Pas de cookie, pas de pixel, pas d'analytics tiers. La page se charge en moins d'une seconde.",
      },
    ],
  },
  {
    title: "Côté domaine",
    caption: "Ce qui vous concerne entre deux millésimes.",
    items: [
      {
        name: "Hébergement pérenne dix ans",
        body: "Vos liens restent vivants. La réglementation exige 3 à 10 ans, nous tenons l'engagement.",
      },
      {
        name: "Audit DGCCRF prêt",
        body: "Page conforme garantie, mention réglementaire claire, traçabilité visible.",
      },
      {
        name: "Support en français sous 48 h",
        body: "Une équipe basée en France, qui comprend le métier viticole, joignable par email.",
      },
    ],
  },
];

export function FeaturesSection() {
  return (
    <section
      id="fonctionnalites"
      className="relative border-b border-border bg-background"
    >
      <div className="container-page py-24 sm:py-28 lg:py-32">
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm italic text-wine">Nº 04</span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Inclus
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Tout, sans option cachée
          </span>
        </Reveal>

        <Reveal y={16} delay={0.1}>
          <h2
            className="mt-10 max-w-3xl font-sans font-medium tracking-display text-foreground"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Ce qui est dans la boîte,{" "}
            <span className="font-serif italic text-wine">
              de la grappe au scan.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-y-14 lg:mt-20 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-0">
          {GROUPS.map((group, gi) => (
            <Reveal
              key={group.title}
              y={16}
              delay={0.1 + gi * 0.1}
              className="lg:border-l lg:border-border lg:first:border-l-0 lg:pl-10 lg:first:pl-0"
            >
              <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground">
                {group.title}
              </h3>
              <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-muted">
                {group.caption}
              </p>

              <ul className="mt-8 space-y-7">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="border-t border-border pt-6 first:border-t-0 first:pt-0"
                  >
                    <p className="font-sans text-base font-medium leading-snug text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
