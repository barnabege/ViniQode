"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CuveeCard } from "./CuveeCard";
import type { Cuvee } from "@/lib/database.types";

export interface CuveeListContainerProps {
  cuvees: Cuvee[];
  /**
   * Compteur total à afficher dans le badge. Utile quand `cuvees` est une
   * vue tronquée (ex. les 5 dernières du dashboard). Par défaut : cuvees.length.
   */
  totalCount?: number;
  emailConfirmedAt: string | null;
  /**
   * Slot rendu sous la liste. Utilisé par le dashboard pour le lien
   * « Voir toutes mes cuvées → » quand le total dépasse l'aperçu.
   */
  footer?: React.ReactNode;
}

export function CuveeListContainer({
  cuvees,
  totalCount,
  emailConfirmedAt,
  footer,
}: CuveeListContainerProps) {
  const [flashMsg, setFlashMsg] = React.useState<string | null>(null);
  const count = totalCount ?? cuvees.length;

  function flash(msg: string) {
    setFlashMsg(msg);
    window.setTimeout(() => setFlashMsg(null), 3000);
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-serif text-xl text-foreground">Mes cuvées</h2>
        {count > 0 && (
          <Badge variant="neutral">
            {count} cuvée{count > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

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
        <div className="space-y-3">
          {cuvees.map((c) => (
            <CuveeCard
              key={c.id}
              cuvee={c}
              emailConfirmedAt={emailConfirmedAt}
              onDeleted={flash}
            />
          ))}
        </div>
      )}

      {footer && <div className="mt-4">{footer}</div>}
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
