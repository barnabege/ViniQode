// components/dashboard/ListeProblemes.tsx
import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResultatGlobal } from "@/lib/conformite";

export interface ListeProblemesProps {
  resultat: ResultatGlobal;
}

export function ListeProblemes({ resultat }: ListeProblemesProps) {
  if (resultat.cuvees_problematiques.length === 0) return null;

  return (
    <section id="liste-problemes" className="mt-10 scroll-mt-24">
      <h2 className="font-serif text-xl text-foreground">Cuvées à compléter</h2>
      <p className="mt-1 text-sm text-muted">
        Règlement (UE) 2021/2117. Liste des informations manquantes par cuvée.
      </p>

      <div className="mt-5 space-y-4">
        {resultat.cuvees_problematiques.map((c) => (
          <article
            key={c.id}
            className="rounded-md border border-gray-200 bg-background p-5 transition-colors hover:bg-gray-50"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base text-foreground">{c.nom}</h3>
                <ul className="mt-2 space-y-1">
                  {c.problemes.map((p) => (
                    <li
                      key={p.champ}
                      className="flex items-baseline gap-2 text-sm text-muted"
                    >
                      <span className="text-orange-600">•</span>
                      <span>{p.message}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 items-center sm:pt-1">
                <Link
                  href={`/dashboard/cuvees/new?id=${c.id}`}
                  className="inline-flex items-center gap-1 rounded-sm border border-green-700 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
                >
                  Compléter
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
