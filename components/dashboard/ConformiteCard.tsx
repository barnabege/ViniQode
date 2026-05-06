// components/dashboard/ConformiteCard.tsx
import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResultatGlobal, CouleurConformite } from "@/lib/conformite";

const STYLES: Record<
  CouleurConformite,
  { card: string; label: string; sub: string; link: string }
> = {
  gray: {
    card: "bg-gray-50 ring-1 ring-gray-200",
    label: "text-gray-700",
    sub: "text-gray-500",
    link: "text-gray-700 hover:text-gray-900",
  },
  orange: {
    card: "bg-orange-50 ring-1 ring-orange-200",
    label: "text-orange-700",
    sub: "text-orange-600",
    link: "text-orange-700 hover:text-orange-900",
  },
  red: {
    card: "bg-red-50 ring-1 ring-red-200",
    label: "text-red-700",
    sub: "text-red-600",
    link: "text-red-700 hover:text-red-900",
  },
  green: {
    card: "bg-green-50 ring-1 ring-green-200",
    label: "text-green-700",
    sub: "text-green-600",
    link: "text-green-700 hover:text-green-900",
  },
};

export function ConformiteCard({ resultat }: { resultat: ResultatGlobal }) {
  const s = STYLES[resultat.couleur];
  const showLink = resultat.cuvees_problematiques.length > 0;

  return (
    <div className={`rounded-md p-5 ${s.card}`}>
      <p className="text-xs uppercase tracking-widest text-muted">Conformité</p>
      <p className={`mt-2 font-serif text-2xl ${s.label}`}>{resultat.label}</p>
      <p className={`mt-1 text-xs ${s.sub}`}>{resultat.sous_texte}</p>
      {showLink && (
        <Link
          href="/dashboard#liste-problemes"
          className={`mt-3 inline-flex items-center gap-1 text-xs font-medium underline ${s.link}`}
        >
          Voir les détails
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
