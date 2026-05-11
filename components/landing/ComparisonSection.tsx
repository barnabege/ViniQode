"use client";

import { Reveal } from "./anim/Reveal";

interface Row {
  axis: string;
  without: string;
  with: string;
}

const ROWS: Row[] = [
  {
    axis: "Mise en conformité",
    without:
      "Plusieurs prestataires, plusieurs mois, plusieurs milliers d'euros.",
    with: "Un outil, dix minutes, gratuit jusqu'à trois cuvées.",
  },
  {
    axis: "Mise à jour des données",
    without:
      "Nouvelle impression d'étiquettes, retour chez l'imprimeur, attente.",
    with: "Trois clics depuis le tableau de bord, page actualisée instantanément.",
  },
  {
    axis: "Multilinguisme",
    without:
      "Traduction manuelle dans chaque langue, gestion fichier par fichier.",
    with: "Vingt-quatre langues UE supportées, détection automatique du visiteur.",
  },
  {
    axis: "Hébergement & pérennité",
    without:
      "À votre charge, sans garantie. Liens potentiellement morts en deux ans.",
    with: "Hébergé dix ans. Sans publicité, sans tracking, sans cookie.",
  },
  {
    axis: "Contrôle DGCCRF",
    without:
      "Dossier à reconstituer dans l'urgence, risque de retrait des produits.",
    with: "Page conforme garantie, prête pour audit, mention légale claire.",
  },
];

export function ComparisonSection() {
  return (
    <section className="relative border-b border-border bg-paper">
      <div className="container-page py-24 sm:py-28 lg:py-32">
        {/* Folio + titre */}
        <Reveal
          as="header"
          y={10}
          className="flex flex-wrap items-center justify-between gap-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm italic text-wine">Nº 02</span>
            <span aria-hidden="true" className="h-px w-10 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
              Comparaison
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
            Avant / Après
          </span>
        </Reveal>

        <Reveal y={16} delay={0.1}>
          <h2
            className="mt-10 max-w-3xl font-sans font-medium tracking-display text-foreground"
            style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Une obligation.{" "}
            <span className="font-serif italic text-wine">
              Deux trajectoires.
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            Ce qui change, concrètement, entre la mise en conformité
            traditionnelle et celle confiée à ViniQode.
          </p>
        </Reveal>

        {/* ── Table éditoriale ─────────────────────────────────────────── */}
        <Reveal y={20} delay={0.2}>
          <div className="mt-14 lg:mt-20">
            {/* En-têtes de colonne — fond neutre, alignement avec body via pl-10 */}
            <div
              className="hidden lg:grid lg:grid-cols-[1.1fr_2fr_2fr] lg:items-end lg:gap-x-10 lg:border-b lg:border-foreground lg:pb-5"
              role="presentation"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted">
                Axe
              </span>
              <span className="font-serif text-lg italic text-muted">
                Sans ViniQode
              </span>
              <span className="font-serif text-lg italic text-foreground lg:pl-10">
                Avec ViniQode
              </span>
            </div>

            {/* Body : wrapper relatif pour superposer le fond teinté au twin-grid */}
            <div className="relative">
              {/* Twin-grid : background teinté pour col 3 (desktop uniquement).
               * Aligné exactement sur les colonnes des <li> via le même
               * grid-template + gap. inset-0 lui donne la hauteur de tout
               * le body, donc la teinte s'étend sur toutes les lignes d'un
               * seul bloc. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden lg:grid lg:grid-cols-[1.1fr_2fr_2fr] lg:gap-x-10"
              >
                <div />
                <div />
                <div className="rounded-sm bg-wine/[0.05]" />
              </div>

              <ul className="relative divide-y divide-border lg:border-t-0">
                {ROWS.map((row) => (
                  <li
                    key={row.axis}
                    className="grid gap-y-3 py-7 lg:grid-cols-[1.1fr_2fr_2fr] lg:gap-x-10 lg:py-8"
                  >
                    <div className="lg:order-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground">
                        {row.axis}
                      </p>
                    </div>
                    <div className="lg:order-2 lg:pr-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted lg:hidden">
                        Sans ViniQode
                      </p>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted line-through decoration-wine/40 decoration-from-font lg:mt-0 lg:no-underline lg:max-w-none">
                        {row.without}
                      </p>
                    </div>
                    <div className="mt-4 rounded-sm bg-wine/[0.05] px-5 py-4 lg:order-3 lg:mt-0 lg:rounded-none lg:bg-transparent lg:px-10 lg:py-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground lg:hidden">
                        Avec ViniQode
                      </p>
                      <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-foreground lg:mt-0 lg:max-w-none">
                        {row.with}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
