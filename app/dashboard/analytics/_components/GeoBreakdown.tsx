// app/dashboard/analytics/_components/GeoBreakdown.tsx
"use client";

import { useState } from "react";
import { countryCodeToFlag, countryName } from "../_lib/flags";
import type { AnalyticsData } from "../_lib/queries";

const TOP_VISIBLE = 5;

const numberFR = (n: number) => n.toLocaleString("fr-FR");

export function GeoBreakdown({ data }: { data: AnalyticsData }) {
  const [expanded, setExpanded] = useState(false);

  const total = data.perCountry.reduce((s, c) => s + c.count, 0);
  const visible = expanded
    ? data.perCountry
    : data.perCountry.slice(0, TOP_VISIBLE);
  const hidden = Math.max(0, data.perCountry.length - TOP_VISIBLE);

  return (
    <div className="rounded-md border border-border bg-background p-6">
      <h2 className="font-serif text-xl text-foreground">
        D&apos;où viennent vos scans&nbsp;?
      </h2>

      {data.perCountry.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Aucune donnée géographique pour cette période. En développement
          local, c&apos;est normal&nbsp;: la géolocalisation n&apos;est résolue
          qu&apos;en production sur Vercel.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {visible.map((c) => {
              const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
              return (
                <li
                  key={c.country}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-xl leading-none" aria-hidden>
                    {countryCodeToFlag(c.country)}
                  </span>
                  <span className="flex-1 truncate text-foreground">
                    {countryName(c.country)}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {numberFR(c.count)} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>

          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-3 text-sm text-wine hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
            >
              {expanded
                ? "Voir moins"
                : `… et ${hidden} autre${hidden > 1 ? "s" : ""} pays`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
