"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteCuveeAction } from "@/app/dashboard/actions";

export interface CuveeActionsProps {
  cuveeId: string;
  cuveeNom: string;
  cuveeStatut: "actif" | "brouillon";
  onDeleted?: (message: string) => void;
}

export function CuveeActions({
  cuveeId,
  cuveeNom,
  cuveeStatut,
  onDeleted,
}: CuveeActionsProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isActif = cuveeStatut === "actif";

  async function onConfirm() {
    setSubmitting(true);
    setError(null);
    const result = await deleteCuveeAction(cuveeId);
    if (!result.ok) {
      setError(result.error ?? "Suppression impossible. Réessayez.");
      setSubmitting(false);
      return;
    }
    setOpen(false);
    setSubmitting(false);
    onDeleted?.("Cuvée supprimée.");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Plus d'actions"
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-surface"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            className="text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActif ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Supprimer cette cuvée publiée ?
                </span>
              ) : (
                "Supprimer cette cuvée ?"
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActif ? (
                <>
                  <strong className="text-foreground">{cuveeNom}</strong> est
                  actuellement publiée et son QR code peut être scanné. Si des
                  bouteilles avec ce QR code sont en circulation, la page
                  e-label affichera « Page introuvable » après suppression.
                  Cette action est définitive.
                </>
              ) : (
                <>
                  Vous êtes sur le point de supprimer{" "}
                  <strong className="text-foreground">{cuveeNom}</strong>.
                  Cette action est définitive.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={submitting}>
              {submitting
                ? "Suppression…"
                : isActif
                ? "Supprimer définitivement"
                : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
