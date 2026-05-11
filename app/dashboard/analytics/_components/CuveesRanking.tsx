// app/dashboard/analytics/_components/CuveesRanking.tsx
//
// Top 10 des cuvées les plus scannées. Chaque ligne clique vers la page
// d'édition de la cuvée. Server Component.

import Link from "next/link";
import type { AnalyticsData } from "../_lib/queries";

const numberFR = (n: number) => n.toLocaleString("fr-FR");

export function CuveesRanking({ data }: { data: AnalyticsData }) {
  const total = data.topCuvees.reduce((sum, c) => sum + c.count, 0);
  const isEmpty = data.topCuvees.length === 0;

  return (
    <div className="rounded-md border border-border bg-background p-6">
      <h2 className="font-serif text-xl text-foreground">
        Cuvées les plus scannées
      </h2>
      {isEmpty ? (
        <p className="mt-4 text-sm text-muted">
          Aucune cuvée scannée sur cette période.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {data.topCuvees.map((c, i) => {
            const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/cuvees/${c.id}/modifier`}
                  className="group relative block overflow-hidden rounded-sm px-3 py-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-wine/10"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                  <div className="relative flex items-center justify-between gap-3 text-sm">
                    <span className="flex-1 truncate text-foreground">
                      <span className="mr-1 text-muted tabular-nums">
                        {i + 1}.
                      </span>
                      {c.nom}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {numberFR(c.count)} scans · {pct}%
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
