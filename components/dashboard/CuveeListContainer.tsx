"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CuveeCard } from "./CuveeCard";
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
import { deleteCuveesAction } from "@/app/dashboard/actions";
import type { Cuvee } from "@/lib/database.types";

export interface CuveeListContainerProps {
  cuvees: Cuvee[];
  emailConfirmedAt: string | null;
  title?: string | null;
}

export function CuveeListContainer({
  cuvees,
  emailConfirmedAt,
  title = "Mes cuvées",
}: CuveeListContainerProps) {
  const router = useRouter();
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [flashMsg, setFlashMsg] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function flash(msg: string) {
    setFlashMsg(msg);
    window.setTimeout(() => setFlashMsg(null), 3000);
  }

  function handleToggle(id: string, on: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function startSelection() {
    setSelectionMode(true);
  }

  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  const selectedCuvees = cuvees.filter((c) => selectedIds.has(c.id));
  const selectedActifs = selectedCuvees.filter((c) => c.statut === "actif");
  const hasActif = selectedActifs.length > 0;
  const n = selectedIds.size;

  async function onConfirmBatchDelete() {
    setSubmitting(true);
    setError(null);
    const result = await deleteCuveesAction(Array.from(selectedIds));
    if (!result.ok) {
      setError(result.error ?? "Suppression impossible. Réessayez.");
      setSubmitting(false);
      return;
    }
    const deleted = result.count ?? n;
    setConfirmOpen(false);
    setSubmitting(false);
    cancelSelection();
    flash(
      `${deleted} cuvée${deleted > 1 ? "s" : ""} supprimée${
        deleted > 1 ? "s" : ""
      }.`,
    );
    router.refresh();
  }

  const showHeaderRow = Boolean(title) || cuvees.length > 0;

  return (
    <section className="mt-10">
      {showHeaderRow && (
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {title && (
            <h2 className="font-serif text-xl text-foreground">{title}</h2>
          )}
          {cuvees.length > 0 && (
            <Badge variant="neutral">
              {cuvees.length} cuvée{cuvees.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        {cuvees.length > 0 &&
          (selectionMode ? (
            <Button variant="ghost" size="sm" onClick={cancelSelection}>
              Annuler
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={startSelection}>
              Sélectionner
            </Button>
          ))}
      </div>
      )}

      {flashMsg && (
        <p
          role="status"
          className="mb-3 rounded-sm bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {flashMsg}
        </p>
      )}

      {cuvees.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={"space-y-3 " + (selectionMode ? "pb-28" : "")}>
          {cuvees.map((c) => (
            <CuveeCard
              key={c.id}
              cuvee={c}
              emailConfirmedAt={emailConfirmedAt}
              selectionMode={selectionMode}
              selected={selectedIds.has(c.id)}
              onToggleSelect={handleToggle}
              onDeleted={flash}
            />
          ))}
        </div>
      )}

      {selectionMode && (
        <div className="fixed inset-x-0 bottom-20 z-30 border-t border-border bg-background px-6 py-3 lg:bottom-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              {n} cuvée{n > 1 ? "s" : ""} sélectionnée{n > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={n === 0}
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasActif ? (
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
                {hasActif ? (
                  <p>
                    {selectedActifs.length} de ces cuvées{" "}
                    {selectedActifs.length > 1 ? "sont publiées" : "est publiée"}{" "}
                    et leur QR code peut être scanné. Si des bouteilles sont en
                    circulation, leurs pages e-label afficheront « Page
                    introuvable » après suppression. Cette action est
                    définitive.
                  </p>
                ) : (
                  <p>Cette action est définitive.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmBatchDelete}
              disabled={submitting}
            >
              {submitting ? "Suppression…" : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function EmptyState() {
  return (
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
  );
}
