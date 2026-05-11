// app/dashboard/analytics/_lib/queries.ts
//
// Récupération + agrégation des données analytics pour un user.
//
// Stratégie : 1 fetch des lignes scans de la période (cuvee_id, country,
// scanned_at) + 3 counts/fetches en parallèle. L'agrégation se fait en TS
// plutôt qu'en SQL pour éviter une migration RPC. Tient largement à
// l'échelle MVP (un wineyard a typiquement < 5000 scans/mois).
//
// Filtres :
//   - device_type != 'bot' (ou NULL) → KPIs propres, bots conservés en base
//   - cuvées soft-deletées exclues du top des cuvées les plus scannées

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { chartGranularity, periodRange, type Period } from "./period";

// Postgrest .or() ne sait pas combiner is/neq simplement → on passe une
// chaîne « column.op.value, column.op.value » qui devient un OR. NULL
// device_type est défensif : nos INSERTs le valorisent toujours, mais on
// veut être robuste à toute donnée historique.
const EXCLUDE_BOTS = "device_type.is.null,device_type.neq.bot";

// Limite supérieure du fetch en une seule page. Supabase Cloud par défaut
// cap à 1000 lignes ; on demande plus pour les comptes Pro futurs et le
// projet Supabase peut être configuré « max-rows = 10000 ».
const SCAN_FETCH_LIMIT = 10_000;

export interface BucketPoint {
  date: string;
  count: number;
}

export interface CuveeRank {
  id: string;
  nom: string;
  count: number;
}

export interface CountryRank {
  country: string;
  count: number;
}

export interface AnalyticsData {
  totalScans: number;
  totalScansPrevious: number;
  scansThisMonth: number;
  perBucket: BucketPoint[];
  granularity: "day" | "week";
  topCuvees: CuveeRank[];
  perCountry: CountryRank[];
}

export async function fetchAnalytics(
  userId: string,
  period: Period,
): Promise<AnalyticsData> {
  const supabase = createSupabaseServerClient();
  const range = periodRange(period);
  const granularity = chartGranularity(period);

  // Début du mois calendaire courant (UTC). Indépendant de la période
  // sélectionnée — la carte « Scans ce mois-ci » est figée sur le mois.
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const [scansRes, prevCountRes, monthCountRes, cuveesRes] = await Promise.all([
    supabase
      .from("scans")
      .select("cuvee_id, country, scanned_at")
      .eq("user_id", userId)
      .gte("scanned_at", range.start.toISOString())
      .lt("scanned_at", range.end.toISOString())
      .or(EXCLUDE_BOTS)
      .order("scanned_at", { ascending: true })
      .limit(SCAN_FETCH_LIMIT),
    supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("scanned_at", range.prevStart.toISOString())
      .lt("scanned_at", range.prevEnd.toISOString())
      .or(EXCLUDE_BOTS),
    supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("scanned_at", monthStart.toISOString())
      .or(EXCLUDE_BOTS),
    supabase
      .from("cuvees")
      .select("id, nom")
      .eq("user_id", userId)
      .is("deleted_at", null),
  ]);

  if (scansRes.error) {
    console.error("[analytics] scans fetch failed", scansRes.error);
  }

  const scans = scansRes.data ?? [];
  const cuveeNames = new Map(
    (cuveesRes.data ?? []).map((c) => [c.id, c.nom]),
  );

  return {
    totalScans: scans.length,
    totalScansPrevious: prevCountRes.count ?? 0,
    scansThisMonth: monthCountRes.count ?? 0,
    perBucket: aggregateByBucket(
      scans.map((s) => s.scanned_at),
      range.start,
      range.end,
      granularity,
    ),
    granularity,
    topCuvees: topCuvees(scans, cuveeNames),
    perCountry: perCountry(scans),
  };
}

// ─── Helpers d'agrégation ─────────────────────────────────────────────

function topCuvees(
  scans: { cuvee_id: string }[],
  names: Map<string, string>,
): CuveeRank[] {
  const counts = new Map<string, number>();
  for (const s of scans) counts.set(s.cuvee_id, (counts.get(s.cuvee_id) ?? 0) + 1);

  return [...counts.entries()]
    // Cuvées soft-deletées : on les exclut du top (le lien sur la ligne
    // pointerait vers une page 404). Les scans restent en base.
    .filter(([id]) => names.has(id))
    .map(([id, count]) => ({ id, nom: names.get(id) as string, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function perCountry(scans: { country: string | null }[]): CountryRank[] {
  const counts = new Map<string, number>();
  for (const s of scans) {
    if (!s.country) continue;
    counts.set(s.country, (counts.get(s.country) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregateByBucket(
  scannedAt: string[],
  start: Date,
  end: Date,
  granularity: "day" | "week",
): BucketPoint[] {
  // Pré-popule les buckets pour que l'axe X soit continu même si zéro scan
  // un jour donné. Clés au format YYYY-MM-DD, en UTC.
  const buckets = new Map<string, number>();
  const stepDays = granularity === "day" ? 1 : 7;

  let cursor = new Date(bucketStart(start, granularity));
  const limit = end;
  while (cursor <= limit) {
    buckets.set(toDateKey(cursor), 0);
    cursor = new Date(cursor.getTime() + stepDays * 86_400_000);
  }

  for (const ts of scannedAt) {
    const key = toDateKey(bucketStart(new Date(ts), granularity));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Aligne une date sur le début de son bucket :
//   - "day"  → minuit UTC du même jour
//   - "week" → lundi 00:00 UTC de la semaine ISO
function bucketStart(d: Date, granularity: "day" | "week"): Date {
  const utcMidnight = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  if (granularity === "day") return utcMidnight;
  // ISO week: lundi = 1, dimanche = 7
  const dayOfWeek = utcMidnight.getUTCDay() || 7;
  utcMidnight.setUTCDate(utcMidnight.getUTCDate() - (dayOfWeek - 1));
  return utcMidnight;
}
