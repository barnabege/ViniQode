// app/dashboard/cuvees/_components/CuveesPageClient.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArchiveRestore,
  Copy,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CuveeCard } from "@/components/dashboard/CuveeCard";
import {
  bulkArchiveCuveesAction,
  bulkDuplicateCuveesAction,
  softDeleteCuveesAction,
} from "@/app/dashboard/cuvees/_actions";
import { resolveCouleur } from "@/lib/cuvees-shared";
import { analyserCuvee } from "@/lib/conformite";
import type { Cuvee } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { CuveesFiltersPanel } from "./CuveesFiltersPanel";
import {
  countActiveFilters,
  isAnyFilterActive,
  useCuveesFilters,
  type SortKey,
} from "./useCuveesFilters";

export interface CuveesPageClientProps {
  cuvees: Cuvee[];
  emailConfirmedAt: string | null;
}

export function CuveesPageClient({
  cuvees,
  emailConfirmedAt,
}: CuveesPageClientProps) {
  const router = useRouter();
  const { filters, setFilters, resetFilters } = useCuveesFilters();

  // ── Recherche : input local + debounce 300ms vers URL ──────────────────
  const [searchInput, setSearchInput] = React.useState(filters.search);
  const lastPushedSearchRef = React.useRef(filters.search);

  React.useEffect(() => {
    if (filters.search === lastPushedSearchRef.current) return;
    lastPushedSearchRef.current = filters.search;
    setSearchInput(filters.search);
  }, [filters.search]);

  React.useEffect(() => {
    if (searchInput === filters.search) return;
    const t = window.setTimeout(() => {
      lastPushedSearchRef.current = searchInput;
      setFilters({ search: searchInput });
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput, filters.search, setFilters]);

  // ── UI state non-filtre ────────────────────────────────────────────────
  const [filtersPanelOpen, setFiltersPanelOpen] = React.useState(false);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [flashMsg, setFlashMsg] = React.useState<string | null>(null);
  const [pendingAction, setPendingAction] = React.useState<
    null | "delete" | "archive" | "duplicate"
  >(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // ── Options dynamiques (Stratégie A : extraction client) ────────────────
  const availableMillesimes = React.useMemo(() => {
    const set = new Set<number>();
    cuvees.forEach((c) => {
      if (c.millesime != null) set.add(c.millesime);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [cuvees]);

  const availableRegions = React.useMemo(() => {
    const set = new Set<string>();
    cuvees.forEach((c) => {
      if (c.region) set.add(c.region);
    });
    const arr = Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
    const i = arr.indexOf("Autre");
    if (i !== -1) {
      arr.splice(i, 1);
      arr.push("Autre");
    }
    return arr;
  }, [cuvees]);

  const availableAppellations = React.useMemo(() => {
    const set = new Set<string>();
    cuvees.forEach((c) => {
      if (c.appellation) set.add(c.appellation);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [cuvees]);

  // ── Filtrage + tri ─────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    const millesimeSet = new Set(filters.millesimes);
    const couleurSet = new Set(filters.couleurs);
    const regionSet = new Set(filters.regions);
    const appellationSet = new Set(filters.appellations);
    const statutSet = new Set(filters.statuts);

    const list = cuvees.filter((c) => {
      if (needle && !c.nom.toLowerCase().includes(needle)) return false;
      if (
        millesimeSet.size > 0 &&
        (c.millesime == null || !millesimeSet.has(c.millesime))
      )
        return false;
      if (couleurSet.size > 0) {
        const couleur = resolveCouleur(c);
        if (!couleur || !couleurSet.has(couleur)) return false;
      }
      if (
        regionSet.size > 0 &&
        (!c.region || !regionSet.has(c.region))
      )
        return false;
      if (
        appellationSet.size > 0 &&
        (!c.appellation || !appellationSet.has(c.appellation))
      )
        return false;
      if (statutSet.size > 0 && !statutSet.has(c.statut)) return false;
      if (filters.onlyNonConforme) {
        const r = analyserCuvee(c, { email_confirmed_at: emailConfirmedAt });
        if (r.conforme) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (filters.sort) {
      case "nom_asc":
        sorted.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
        break;
      case "millesime_desc":
        sorted.sort((a, b) => (b.millesime ?? 0) - (a.millesime ?? 0));
        break;
      case "nonconforme_first":
        sorted.sort((a, b) => {
          const ra = analyserCuvee(a, { email_confirmed_at: emailConfirmedAt });
          const rb = analyserCuvee(b, { email_confirmed_at: emailConfirmedAt });
          if (ra.conforme === rb.conforme) {
            return b.updated_at.localeCompare(a.updated_at);
          }
          return ra.conforme ? 1 : -1;
        });
        break;
      case "date_desc":
      default:
        sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    }
    return sorted;
  }, [cuvees, filters, emailConfirmedAt]);

  // ── Groupes (par millésime) ────────────────────────────────────────────
  const groups = React.useMemo(() => {
    if (!filters.groupByMillesime) return null;
    const map = new Map<string, Cuvee[]>();
    for (const c of filtered) {
      const key = c.millesime ? String(c.millesime) : "Sans millésime";
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === "Sans millésime") return 1;
      if (b === "Sans millésime") return -1;
      return Number(b) - Number(a);
    });
  }, [filtered, filters.groupByMillesime]);

  // ── Sélection ──────────────────────────────────────────────────────────
  function startSelection() {
    setSelectionMode(true);
  }
  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }
  function handleToggleSelect(id: string, on: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function flash(msg: string) {
    setFlashMsg(msg);
    window.setTimeout(() => setFlashMsg(null), 3000);
  }

  // ── Bulk actions ───────────────────────────────────────────────────────
  const selectedCuvees = filtered.filter((c) => selectedIds.has(c.id));
  const selectedActifs = selectedCuvees.filter((c) => c.statut === "actif");
  const n = selectedIds.size;

  async function confirmBulkDelete() {
    setSubmitting(true);
    setActionError(null);
    const r = await softDeleteCuveesAction(Array.from(selectedIds));
    setSubmitting(false);
    if (!r.ok) {
      setActionError(r.error);
      return;
    }
    setPendingAction(null);
    cancelSelection();
    flash(
      `${r.data.count} cuvée${r.data.count > 1 ? "s" : ""} supprimée${
        r.data.count > 1 ? "s" : ""
      }.`,
    );
    router.refresh();
  }

  async function confirmBulkArchive() {
    setSubmitting(true);
    setActionError(null);
    const r = await bulkArchiveCuveesAction(Array.from(selectedIds));
    setSubmitting(false);
    if (!r.ok) {
      setActionError(r.error);
      return;
    }
    setPendingAction(null);
    cancelSelection();
    flash(
      `${r.data.count} cuvée${r.data.count > 1 ? "s" : ""} archivée${
        r.data.count > 1 ? "s" : ""
      }.`,
    );
    router.refresh();
  }

  async function confirmBulkDuplicate() {
    setSubmitting(true);
    setActionError(null);
    const r = await bulkDuplicateCuveesAction(Array.from(selectedIds));
    setSubmitting(false);
    if (!r.ok) {
      setActionError(r.error);
      return;
    }
    setPendingAction(null);
    cancelSelection();
    flash(
      `${r.data.count} cuvée${r.data.count > 1 ? "s" : ""} dupliquée${
        r.data.count > 1 ? "s" : ""
      }.`,
    );
    router.refresh();
  }

  if (cuvees.length === 0) {
    return <EmptyStateNoData />;
  }

  const activeCount = countActiveFilters(filters);

  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8">
      {flashMsg && (
        <p
          role="status"
          className="mb-4 rounded-sm bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {flashMsg}
        </p>
      )}

      {/* Toolbar sticky minimaliste */}
      <div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-border bg-surface/95 px-6 py-3 backdrop-blur sm:-mx-10 sm:px-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom…"
              className="h-10 w-full rounded-sm border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          {/* Bouton Filtres + badge */}
          <button
            type="button"
            onClick={() => setFiltersPanelOpen(true)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-sm border px-3 text-sm transition-colors",
              activeCount > 0
                ? "border-foreground bg-surface text-foreground"
                : "border-border bg-background text-foreground hover:bg-surface",
            )}
            aria-label={
              activeCount > 0
                ? `Filtres (${activeCount} actifs)`
                : "Ouvrir les filtres"
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtres</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-wine px-1.5 text-[10px] font-medium leading-4 text-background">
                {activeCount}
              </span>
            )}
          </button>

          {/* Tri */}
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters({ sort: e.target.value as SortKey })
            }
            aria-label="Trier les cuvées"
            className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:border-foreground focus:outline-none"
          >
            <option value="date_desc">Plus récentes</option>
            <option value="nom_asc">Nom (A-Z)</option>
            <option value="millesime_desc">Millésime décroissant</option>
            <option value="nonconforme_first">Non conformes en premier</option>
          </select>

          {/* Sélectionner */}
          <div className="ml-auto">
            {selectionMode ? (
              <Button variant="ghost" size="sm" onClick={cancelSelection}>
                Annuler la sélection
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={startSelection}>
                Sélectionner
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Compteur résultats */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Badge variant="neutral">
          {filtered.length} cuvée{filtered.length > 1 ? "s" : ""}
        </Badge>
        {isAnyFilterActive(filters) && (
          <span>
            sur {cuvees.length} total{cuvees.length > 1 ? "es" : "e"}
          </span>
        )}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyStateNoMatch onReset={resetFilters} />
      ) : groups ? (
        <div className={cn("space-y-8", selectionMode && "pb-28")}>
          {groups.map(([key, items]) => (
            <section key={key}>
              <h3 className="mb-3 font-serif text-lg text-foreground">{key}</h3>
              <div className="space-y-3">
                {items.map((c) => (
                  <CuveeCard
                    key={c.id}
                    cuvee={c}
                    emailConfirmedAt={emailConfirmedAt}
                    selectionMode={selectionMode}
                    selected={selectedIds.has(c.id)}
                    onToggleSelect={handleToggleSelect}
                    onDeleted={flash}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={cn("space-y-3", selectionMode && "pb-28")}>
          {filtered.map((c) => (
            <CuveeCard
              key={c.id}
              cuvee={c}
              emailConfirmedAt={emailConfirmedAt}
              selectionMode={selectionMode}
              selected={selectedIds.has(c.id)}
              onToggleSelect={handleToggleSelect}
              onDeleted={flash}
            />
          ))}
        </div>
      )}

      {/* Panneau latéral de filtres */}
      <CuveesFiltersPanel
        open={filtersPanelOpen}
        onOpenChange={setFiltersPanelOpen}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
        availableMillesimes={availableMillesimes}
        availableRegions={availableRegions}
        availableAppellations={availableAppellations}
      />

      {/* Bulk action bar (fixed bottom) */}
      {selectionMode && (
        <div className="fixed inset-x-0 bottom-20 z-30 border-t border-border bg-background px-6 py-3 shadow-lg lg:bottom-0">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground">
              {n} cuvée{n > 1 ? "s" : ""} sélectionnée{n > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPendingAction("archive")}
                disabled={n === 0}
              >
                <ArchiveRestore className="h-4 w-4" />
                Archiver
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPendingAction("duplicate")}
                disabled={n === 0}
              >
                <Copy className="h-4 w-4" />
                Dupliquer
              </Button>
              <button
                type="button"
                onClick={() => setPendingAction("delete")}
                disabled={n === 0}
                className="inline-flex h-9 items-center gap-2 rounded-sm bg-red-600 px-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AlertDialog
        open={pendingAction === "delete"}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedActifs.length > 0 ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Supprimer {n} cuvée{n > 1 ? "s" : ""} dont des cuvées
                  publiées ?
                </span>
              ) : (
                <>
                  Supprimer {n} cuvée{n > 1 ? "s" : ""} ?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Vous êtes sur le point de supprimer :{" "}
                  <strong className="text-foreground">
                    {selectedCuvees.map((c) => c.nom).join(", ")}
                  </strong>
                  .
                </p>
                {selectedActifs.length > 0 ? (
                  <p>
                    {selectedActifs.length} de ces cuvées{" "}
                    {selectedActifs.length > 1 ? "sont publiées" : "est publiée"}
                    . Si des bouteilles avec leur QR code sont en circulation,
                    la page e-label affichera « Page introuvable » après
                    suppression. Cette action est définitive.
                  </p>
                ) : (
                  <p>Cette action est définitive.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p className="text-sm text-error" role="alert">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={submitting}>
              {submitting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingAction === "archive"}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archiver {n} cuvée{n > 1 ? "s" : ""} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Les cuvées archivées ne sont plus actives mais restent visibles
              dans votre dashboard (filtrer par « Archivé » pour les retrouver).
              Leur QR code n'est plus servi sur la page e-label publique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p className="text-sm text-error" role="alert">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkArchive}
              disabled={submitting}
            >
              {submitting ? "Archivage…" : "Archiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingAction === "duplicate"}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Dupliquer {n} cuvée{n > 1 ? "s" : ""} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Une copie est créée pour chaque cuvée sélectionnée, avec le
              statut « Brouillon » et le préfixe « Copie de ». Les QR codes
              et URL d'e-label ne sont pas dupliqués — ils seront générés à
              la publication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p className="text-sm text-error" role="alert">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDuplicate}
              disabled={submitting}
            >
              {submitting ? "Duplication…" : "Dupliquer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── États vides ──────────────────────────────────────────────────────────
function EmptyStateNoData() {
  return (
    <div className="px-6 py-12 sm:px-10">
      <div className="rounded-md border border-dashed border-border bg-background p-12 text-center">
        <p className="font-serif text-lg text-foreground">
          Vous n'avez pas encore de cuvée.
        </p>
        <p className="mt-2 text-sm text-muted">
          Créez votre première e-label en 10 minutes.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/cuvees/new">
            <Plus className="h-4 w-4" />
            Créer ma première cuvée
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyStateNoMatch({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-background p-12 text-center">
      <p className="font-serif text-lg text-foreground">
        Aucune cuvée ne correspond
      </p>
      <p className="mt-2 text-sm text-muted">
        Essayez d'élargir vos critères ou réinitialisez les filtres.
      </p>
      <Button variant="secondary" onClick={onReset} className="mt-6">
        Réinitialiser les filtres
      </Button>
    </div>
  );
}
