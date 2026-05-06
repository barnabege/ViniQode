// lib/conformite.ts
//
// Source de vérité unique pour la conformité d'une cuvée et l'état global
// de l'utilisateur. Pure logique, sans I/O. Lue par le dashboard, le
// bandeau d'alerte et les badges de cuvée.
//
// Référentiel : Règlement (UE) 2021/2117.

import type { Cuvee } from "./database.types";

export type ChampProbleme = "ingredients" | "nutrition";

export interface ProblemeCuvee {
  champ: ChampProbleme;
  message: string;
}

export type EtatCuvee = "brouillon" | "a_completer" | "conforme";

export interface ResultatCuvee {
  id: string;
  nom: string;
  conforme: boolean;
  etat: EtatCuvee;
  problemes: ProblemeCuvee[];
}

export type NiveauConformite = "a_demarrer" | "action_requise" | "conforme";

export type CouleurConformite = "gray" | "orange" | "red" | "green";

export interface ResultatGlobal {
  niveau: NiveauConformite;
  label: string;
  sous_texte: string;
  couleur: CouleurConformite;
  cuvees_problematiques: ResultatCuvee[];
  nb_total_cuvees: number;
  nb_actifs: number;
  nb_conformes: number;
  nb_brouillons: number;
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
  _user: UserConformite,
): ResultatCuvee {
  if (cuvee.statut === "brouillon") {
    return {
      id: cuvee.id,
      nom: cuvee.nom,
      conforme: false,
      etat: "brouillon",
      problemes: [],
    };
  }

  const problemes: ProblemeCuvee[] = [];

  if (ingredientsManquants(cuvee)) {
    problemes.push({ champ: "ingredients", message: "Ingrédients manquants" });
  }

  if (nutritionManquante(cuvee)) {
    problemes.push({
      champ: "nutrition",
      message: "Valeurs nutritionnelles manquantes",
    });
  }

  if (problemes.length > 0) {
    return {
      id: cuvee.id,
      nom: cuvee.nom,
      conforme: false,
      etat: "a_completer",
      problemes,
    };
  }

  return {
    id: cuvee.id,
    nom: cuvee.nom,
    conforme: true,
    etat: "conforme",
    problemes: [],
  };
}

export function analyserConformiteGlobale(
  cuvees: Cuvee[],
  user: UserConformite,
): ResultatGlobal {
  const nb_total = cuvees.length;
  const actifs = cuvees.filter((c) => c.statut === "actif");
  const brouillons = cuvees.filter((c) => c.statut === "brouillon");
  const nb_actifs = actifs.length;
  const nb_brouillons = brouillons.length;

  const resultatsActifs = actifs.map((c) => analyserCuvee(c, user));
  const a_completer = resultatsActifs.filter((r) => r.etat === "a_completer");
  const nb_conformes = resultatsActifs.filter((r) => r.etat === "conforme").length;

  if (nb_actifs === 0) {
    const sous_texte =
      nb_brouillons > 0
        ? `${nb_brouillons} cuvée${nb_brouillons > 1 ? "s" : ""} en brouillon`
        : "Créez votre première cuvée";
    return {
      niveau: "a_demarrer",
      label: nb_brouillons > 0 ? "Aucune cuvée publiée" : "À démarrer",
      sous_texte,
      couleur: "gray",
      cuvees_problematiques: [],
      nb_total_cuvees: nb_total,
      nb_actifs,
      nb_conformes,
      nb_brouillons,
    };
  }

  if (a_completer.length > 0) {
    const x = a_completer.length;
    return {
      niveau: "action_requise",
      label: "Action requise",
      sous_texte: `${x} cuvée${x > 1 ? "s" : ""} sur ${nb_actifs} à compléter`,
      couleur: "red",
      cuvees_problematiques: a_completer,
      nb_total_cuvees: nb_total,
      nb_actifs,
      nb_conformes,
      nb_brouillons,
    };
  }

  return {
    niveau: "conforme",
    label: "Conforme",
    sous_texte: "Règlement (UE) 2021/2117",
    couleur: "green",
    cuvees_problematiques: [],
    nb_total_cuvees: nb_total,
    nb_actifs,
    nb_conformes,
    nb_brouillons,
  };
}
