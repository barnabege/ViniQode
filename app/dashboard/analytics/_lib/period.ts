// app/dashboard/analytics/_lib/period.ts
//
// Validation et calcul des plages de dates pour le sélecteur de période.
// Période stockée en URL param (?period=30d) pour permettre le partage et
// la persistance au reload — même convention que /dashboard/cuvees.

export type Period = "7d" | "30d" | "90d" | "12m";

export const DEFAULT_PERIOD: Period = "30d";

const VALID_PERIODS: ReadonlySet<Period> = new Set([
  "7d",
  "30d",
  "90d",
  "12m",
]);

const DAYS_BY_PERIOD: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  // 12 mois = 365 jours pour éviter les edge-cases de bord de mois et garder
  // une comparaison "période précédente" symétrique. Suffisant pour un MVP.
  "12m": 365,
};

export const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  "12m": "12 derniers mois",
};

export function parsePeriod(raw: string | undefined | null): Period {
  if (raw && VALID_PERIODS.has(raw as Period)) return raw as Period;
  return DEFAULT_PERIOD;
}

export interface PeriodRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  days: number;
}

export function periodRange(period: Period, now: Date = new Date()): PeriodRange {
  const days = DAYS_BY_PERIOD[period];
  const ms = days * 86_400_000;
  const end = now;
  const start = new Date(now.getTime() - ms);
  const prevEnd = start;
  const prevStart = new Date(start.getTime() - ms);
  return { start, end, prevStart, prevEnd, days };
}

// Au-delà de 90 jours, l'agrégation quotidienne devient illisible.
// Passage en hebdomadaire pour 12 mois → 52 points max.
export function chartGranularity(period: Period): "day" | "week" {
  return period === "12m" ? "week" : "day";
}
