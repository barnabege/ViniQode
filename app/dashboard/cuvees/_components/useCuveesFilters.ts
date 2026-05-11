"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Couleur, StatutCuvee } from "@/lib/database.types";

export type SortKey =
  | "date_desc"
  | "nom_asc"
  | "millesime_desc"
  | "nonconforme_first";

export interface CuveesFilters {
  search: string;
  millesimes: number[];
  couleurs: Couleur[];
  regions: string[];
  appellations: string[];
  statuts: StatutCuvee[];
  onlyNonConforme: boolean;
  groupByMillesime: boolean;
  sort: SortKey;
}

const DEFAULT_SORT: SortKey = "date_desc";

const VALID_SORTS: ReadonlySet<SortKey> = new Set([
  "date_desc",
  "nom_asc",
  "millesime_desc",
  "nonconforme_first",
]);

function parseCsv(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumericCsv(raw: string | null): number[] {
  return parseCsv(raw)
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n));
}

function parseSort(raw: string | null): SortKey {
  if (raw && VALID_SORTS.has(raw as SortKey)) return raw as SortKey;
  return DEFAULT_SORT;
}

export function readFiltersFromParams(
  params: URLSearchParams,
): CuveesFilters {
  return {
    search: params.get("q") ?? "",
    millesimes: parseNumericCsv(params.get("m")),
    couleurs: parseCsv(params.get("c")) as Couleur[],
    regions: parseCsv(params.get("r")),
    appellations: parseCsv(params.get("a")),
    statuts: parseCsv(params.get("s")) as StatutCuvee[],
    onlyNonConforme: params.get("nc") === "1",
    groupByMillesime: params.get("g") === "1",
    sort: parseSort(params.get("sort")),
  };
}

function writeFiltersToParams(
  filters: CuveesFilters,
  base: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(base);
  const setOrDelete = (key: string, value: string) => {
    if (value) next.set(key, value);
    else next.delete(key);
  };
  setOrDelete("q", filters.search.trim());
  setOrDelete("m", filters.millesimes.join(","));
  setOrDelete("c", filters.couleurs.join(","));
  setOrDelete("r", filters.regions.join(","));
  setOrDelete("a", filters.appellations.join(","));
  setOrDelete("s", filters.statuts.join(","));
  setOrDelete("nc", filters.onlyNonConforme ? "1" : "");
  setOrDelete("g", filters.groupByMillesime ? "1" : "");
  setOrDelete("sort", filters.sort !== DEFAULT_SORT ? filters.sort : "");
  return next;
}

export const EMPTY_FILTERS: CuveesFilters = {
  search: "",
  millesimes: [],
  couleurs: [],
  regions: [],
  appellations: [],
  statuts: [],
  onlyNonConforme: false,
  groupByMillesime: false,
  sort: DEFAULT_SORT,
};

/** Compte le nombre de catégories de filtres actives (hors search/sort/groupBy). */
export function countActiveFilters(f: CuveesFilters): number {
  let n = 0;
  if (f.millesimes.length > 0) n++;
  if (f.couleurs.length > 0) n++;
  if (f.regions.length > 0) n++;
  if (f.appellations.length > 0) n++;
  if (f.statuts.length > 0) n++;
  if (f.onlyNonConforme) n++;
  return n;
}

export function isAnyFilterActive(f: CuveesFilters): boolean {
  return (
    f.search.trim() !== "" ||
    countActiveFilters(f) > 0 ||
    f.groupByMillesime ||
    f.sort !== DEFAULT_SORT
  );
}

export function isResetEnabled(f: CuveesFilters): boolean {
  return countActiveFilters(f) > 0 || f.groupByMillesime;
}

export function useCuveesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = React.useMemo(
    () => readFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const replaceParams = React.useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const setFilters = React.useCallback(
    (
      updater:
        | Partial<CuveesFilters>
        | ((prev: CuveesFilters) => Partial<CuveesFilters>),
    ) => {
      const base = new URLSearchParams(searchParams.toString());
      const prev = readFiltersFromParams(base);
      const patch = typeof updater === "function" ? updater(prev) : updater;
      const merged: CuveesFilters = { ...prev, ...patch };
      replaceParams(writeFiltersToParams(merged, base));
    },
    [searchParams, replaceParams],
  );

  const resetFilters = React.useCallback(() => {
    const base = new URLSearchParams(searchParams.toString());
    replaceParams(writeFiltersToParams(EMPTY_FILTERS, base));
  }, [searchParams, replaceParams]);

  return { filters, setFilters, resetFilters };
}
