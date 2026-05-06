// lib/conformite.ts
//
// Source de vérité unique pour la conformité d'une cuvée et l'état global
// de l'utilisateur. Pure logique, sans I/O. Lue par le dashboard, le
// bandeau d'alerte et les badges de cuvée.
//
// Référentiel : Règlement (UE) 2021/2117.

import type { Cuvee } from "./database.types";

export type ChampProbleme =
  | "ingredients"
  | "nutrition"
  | "allergenes"
  | "email_non_confirme"
  | "brouillon";

export interface ProblemeCuvee {
  champ: ChampProbleme;
  message: string;
}

export interface ResultatCuvee {
  id: string;
  nom: string;
  conforme: boolean;
  problemes: ProblemeCuvee[];
}

export type NiveauConformite =
  | "a_demarrer"
  | "en_cours"
  | "action_requise"
  | "email_a_confirmer"
  | "conforme";

export type CouleurConformite = "gray" | "orange" | "red" | "green";

export interface ResultatGlobal {
  niveau: NiveauConformite;
  label: string;
  sous_texte: string;
  couleur: CouleurConformite;
  cuvees_problematiques: ResultatCuvee[];
  nb_total_cuvees: number;
  nb_conformes: number;
}

interface UserConformite {
  email_confirmed_at: string | null;
}

function nutritionManquante(cuvee: Cuvee): boolean {
  return (
    cuvee.valeur_energetique_kj === null ||
    cuvee.valeur_energetique_kcal === null ||
    cuvee.glucides === null ||
    cuvee.sucres_nutritionnels === null
  );
}

function ingredientsManquants(cuvee: Cuvee): boolean {
  return !Array.isArray(cuvee.ingredients) || cuvee.ingredients.length === 0;
}

export function analyserCuvee(
  cuvee: Cuvee,
  user: UserConformite,
): ResultatCuvee {
  const problemes: ProblemeCuvee[] = [];

  if (cuvee.statut === "brouillon") {
    problemes.push({ champ: "brouillon", message: "Cuvée non publiée" });
  }

  if (ingredientsManquants(cuvee)) {
    problemes.push({ champ: "ingredients", message: "Ingrédients manquants" });
  }

  if (nutritionManquante(cuvee)) {
    problemes.push({
      champ: "nutrition",
      message: "Valeurs nutritionnelles manquantes",
    });
  }

  if (cuvee.statut === "actif" && !user.email_confirmed_at) {
    problemes.push({
      champ: "email_non_confirme",
      message: "Email à confirmer",
    });
  }

  return {
    id: cuvee.id,
    nom: cuvee.nom,
    conforme: problemes.length === 0,
    problemes,
  };
}

export function analyserConformiteGlobale(
  cuvees: Cuvee[],
  user: UserConformite,
): ResultatGlobal {
  const nb_total = cuvees.length;

  if (nb_total === 0) {
    return {
      niveau: "a_demarrer",
      label: "À démarrer",
      sous_texte: "Créez votre première cuvée",
      couleur: "gray",
      cuvees_problematiques: [],
      nb_total_cuvees: 0,
      nb_conformes: 0,
    };
  }

  const resultats = cuvees.map((c) => analyserCuvee(c, user));
  const nb_conformes = resultats.filter((r) => r.conforme).length;
  const non_conformes = resultats.filter((r) => !r.conforme);
  const cuvees_publiees = cuvees.filter((c) => c.statut === "actif");
  const toutes_brouillon = cuvees_publiees.length === 0;

  if (toutes_brouillon) {
    const n = nb_total;
    return {
      niveau: "en_cours",
      label: "En cours",
      sous_texte: `${n} cuvée${n > 1 ? "s" : ""} à finaliser`,
      couleur: "orange",
      cuvees_problematiques: non_conformes,
      nb_total_cuvees: nb_total,
      nb_conformes,
    };
  }

  if (!user.email_confirmed_at) {
    return {
      niveau: "email_a_confirmer",
      label: "Email à confirmer",
      sous_texte: "Confirmez votre email pour activer vos QR codes",
      couleur: "orange",
      cuvees_problematiques: non_conformes,
      nb_total_cuvees: nb_total,
      nb_conformes,
    };
  }

  if (non_conformes.length > 0) {
    return {
      niveau: "action_requise",
      label: "Action requise",
      sous_texte: `${non_conformes.length} cuvée${
        non_conformes.length > 1 ? "s" : ""
      } sur ${nb_total} à compléter`,
      couleur: "red",
      cuvees_problematiques: non_conformes,
      nb_total_cuvees: nb_total,
      nb_conformes,
    };
  }

  return {
    niveau: "conforme",
    label: "Conforme",
    sous_texte: "Règlement (UE) 2021/2117",
    couleur: "green",
    cuvees_problematiques: [],
    nb_total_cuvees: nb_total,
    nb_conformes,
  };
}
