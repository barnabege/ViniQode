// lib/cuvees-shared.ts
//
// Helpers purs autour des cuvées, sûrs à importer côté client.
// AUCUN import I/O (Supabase, next/headers, etc.) ne doit jamais apparaître
// ici, sans quoi tout client component qui consomme un de ces helpers fera
// péter le build.
//
// Les helpers de lecture DB sont dans lib/cuvees.ts (server-only).

import type { Couleur, Cuvee, TypeVin } from "@/lib/database.types";

/**
 * Compatibilité ascendante : retourne la couleur d'une cuvée existante en
 * tombant sur le mapping depuis `type_vin` (DEPRECATED) si `couleur` est NULL.
 *
 * Voir TECH_DEBT.md — sera supprimé une fois `type_vin` retirée du schéma.
 */
export function resolveCouleur(
  cuvee: Pick<Cuvee, "couleur" | "type_vin">,
): Couleur | null {
  if (cuvee.couleur) return cuvee.couleur;
  return mapTypeVinToCouleur(cuvee.type_vin);
}

/** @deprecated cf. TECH_DEBT.md */
export function mapTypeVinToCouleur(type_vin: TypeVin | null): Couleur | null {
  switch (type_vin) {
    case "rouge":
      return "rouge";
    case "blanc":
      return "blanc";
    case "rose":
      return "rose";
    case "effervescent":
      return "effervescent";
    // 'liquoreux' et 'autre' n'ont pas de correspondance stricte → NULL.
    default:
      return null;
  }
}
