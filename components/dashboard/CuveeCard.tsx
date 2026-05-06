// components/dashboard/CuveeCard.tsx
import * as React from "react";
import Link from "next/link";
import { Download, ExternalLink, Pencil, Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { analyserCuvee, type ResultatCuvee } from "@/lib/conformite";
import type { Cuvee } from "@/lib/database.types";

export interface CuveeCardProps {
  cuvee: Cuvee;
  emailConfirmedAt: string | null;
}

function libelleProblemes(resultat: ResultatCuvee): string {
  return resultat.problemes.map((p) => p.message).join(" • ");
}

export function CuveeCard({ cuvee, emailConfirmedAt }: CuveeCardProps) {
  const resultat = analyserCuvee(cuvee, { email_confirmed_at: emailConfirmedAt });

  let badge: React.ReactNode;
  if (resultat.conforme) {
    badge = <Badge variant="success">Conforme</Badge>;
  } else if (cuvee.statut === "brouillon") {
    badge = (
      <Badge variant="neutral" title={libelleProblemes(resultat)}>
        Brouillon
      </Badge>
    );
  } else {
    badge = (
      <Badge variant="warning" title={libelleProblemes(resultat)}>
        À compléter
      </Badge>
    );
  }

  return (
    <article className="grid grid-cols-12 items-center gap-4 rounded-md border border-border bg-background p-5 transition-colors hover:border-foreground/20">
      <div className="col-span-12 sm:col-span-4">
        <h3 className="font-serif text-base text-foreground">{cuvee.nom}</h3>
        <p className="text-sm text-muted">
          {cuvee.appellation ?? "Appellation à compléter"}
        </p>
      </div>
      <div className="col-span-6 sm:col-span-2">
        <p className="text-xs uppercase tracking-widest text-muted">Millésime</p>
        <p className="text-sm text-foreground">{cuvee.millesime ?? "—"}</p>
      </div>
      <div className="col-span-6 sm:col-span-2">{badge}</div>
      <div className="col-span-12 flex flex-wrap items-center justify-end gap-2 sm:col-span-4">
        {cuvee.elabel_url && (
          <Link
            href={cuvee.elabel_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            E-label
          </Link>
        )}
        {cuvee.qr_code_url && (
          <a
            href={cuvee.qr_code_url}
            download
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface"
          >
            <Download className="h-3.5 w-3.5" />
            QR
          </a>
        )}
        <Link
          href={`/dashboard/cuvees/new?id=${cuvee.id}`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface"
        >
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Link>
        <Link
          href={`/dashboard/commandes/new?cuvee=${cuvee.id}`}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-surface"
        >
          <Package className="h-3.5 w-3.5" />
          Stickers
        </Link>
      </div>
    </article>
  );
}
