// app/dashboard/analytics/_components/KpiCards.tsx
//
// Les 4 KPI cards en haut de page. Server Component pur — pas d'état.
// Conventions de style alignées sur app/dashboard/page.tsx (Kpi local).

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { countryCodeToFlag, countryName } from "../_lib/flags";
import type { AnalyticsData } from "../_lib/queries";

interface Props {
  data: AnalyticsData;
}

const numberFR = (n: number) => n.toLocaleString("fr-FR");

export function KpiCards({ data }: Props) {
  const isEmpty = data.totalScans === 0;

  // Comparaison vs période précédente. Si l'historique précédent est vide
  // (compte tout récent), on n'affiche pas de delta (pas de baseline).
  const delta = computeDelta(data.totalScans, data.totalScansPrevious);

  const top = data.topCuvees[0];
  const topShare =
    data.totalScans > 0 && top
      ? Math.round((top.count / data.totalScans) * 100)
      : 0;

  const topCountry = data.perCountry[0];
  const countryTotal = data.perCountry.reduce((s, c) => s + c.count, 0);
  const countryShare =
    countryTotal > 0 && topCountry
      ? Math.round((topCountry.count / countryTotal) * 100)
      : 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card label="Scans sur la période">
        <Value>{isEmpty ? "—" : numberFR(data.totalScans)}</Value>
        {!isEmpty && delta && <DeltaBadge delta={delta} />}
      </Card>

      <Card label="Scans ce mois-ci">
        <Value>{isEmpty ? "—" : numberFR(data.scansThisMonth)}</Value>
      </Card>

      <Card label="Cuvée la plus scannée">
        {isEmpty || !top ? (
          <Value>—</Value>
        ) : (
          <>
            <p className="mt-2 truncate font-serif text-lg text-foreground">
              {top.nom}
            </p>
            <p className="mt-1 text-xs text-muted">
              {numberFR(top.count)} scans · {topShare}%
            </p>
            <Bar percent={topShare} />
          </>
        )}
      </Card>

      <Card label="Pays principal">
        {isEmpty || !topCountry ? (
          <Value>—</Value>
        ) : (
          <>
            <p className="mt-2 flex items-center gap-2">
              <span className="text-2xl leading-none" aria-hidden>
                {countryCodeToFlag(topCountry.country)}
              </span>
              <span className="truncate font-serif text-lg text-foreground">
                {countryName(topCountry.country)}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {countryShare}% des scans géolocalisés
            </p>
          </>
        )}
      </Card>
    </section>
  );
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 font-serif text-2xl text-foreground">{children}</p>
  );
}

function Bar({ percent }: { percent: number }) {
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface">
      <div
        className="h-full bg-wine"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        aria-hidden
      />
    </div>
  );
}

interface Delta {
  percent: number;
  direction: "up" | "down" | "flat";
}

// computeDelta retourne null si la baseline est zéro (pas de % significatif).
function computeDelta(current: number, previous: number): Delta | null {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { percent: 0, direction: "flat" };
  return { percent: Math.abs(pct), direction: pct > 0 ? "up" : "down" };
}

function DeltaBadge({ delta }: { delta: Delta }) {
  const Icon =
    delta.direction === "up"
      ? TrendingUp
      : delta.direction === "down"
        ? TrendingDown
        : Minus;
  const cls =
    delta.direction === "up"
      ? "text-success"
      : delta.direction === "down"
        ? "text-error"
        : "text-muted";
  const sign =
    delta.direction === "up" ? "+" : delta.direction === "down" ? "−" : "";
  return (
    <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {sign}
      {delta.percent}% vs période précédente
    </p>
  );
}
