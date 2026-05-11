// lib/home-data.ts
//
// Couche d'accès aux données pour la home connectée. Les tables `scans` et
// `commandes` ne sont pas (encore) toutes branchées : on retourne des données
// plausibles en attendant. Chaque fonction est typée pour rendre le
// branchement Supabase futur sans refactor côté UI.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cuvee, Database, Plan } from "./database.types";

const PLAN_LIMITS: Record<Plan, number | null> = {
  starter: 3,
  essentiel: null,
  pro: null,
};

export type ConformiteStatut = "conforme" | "incomplet" | "vide";

export interface DomainStats {
  cuvees_actives: number;
  cuvees_limit: number | null;
  scans_30j: number;
  conformite: ConformiteStatut;
  cuvees_a_completer: number;
}

export type ActivityKind = "scan" | "geo" | "alerte";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  message: string;
}

export type SuggestionKind =
  | "upgrade_plan"
  | "enable_translations"
  | "order_stickers";

export interface ContextualSuggestion {
  kind: SuggestionKind;
  title: string;
  description: string;
  cta_label: string;
  cta_href: string;
}

function ingredientsManquants(c: Cuvee): boolean {
  return !Array.isArray(c.ingredients) || c.ingredients.length === 0;
}

function nutritionManquante(c: Cuvee): boolean {
  return (
    c.valeur_energetique_kj === null ||
    c.valeur_energetique_kcal === null ||
    c.glucides === null ||
    c.sucres_nutritionnels === null
  );
}

function estIncomplete(c: Cuvee): boolean {
  if (c.statut !== "actif") return false;
  return ingredientsManquants(c) || nutritionManquante(c);
}

export async function getDomainStats(
  supabase: SupabaseClient<Database, "public">,
  userId: string,
  plan: Plan,
): Promise<DomainStats> {
  const { data: cuveesData } = await supabase
    .from("cuvees")
    .select("*")
    .eq("user_id", userId);

  const cuvees: Cuvee[] = cuveesData ?? [];
  const actives = cuvees.filter((c) => c.statut === "actif");
  const incompletes = actives.filter(estIncomplete);

  // TODO: brancher sur Supabase (table `scans`) — pour l'instant valeur mock
  // proportionnelle au nombre de cuvées actives, capée à 0 si rien d'actif.
  const scans30j = actives.length === 0 ? 0 : 47 * actives.length + 12;

  let conformite: ConformiteStatut;
  if (actives.length === 0) {
    conformite = "vide";
  } else if (incompletes.length > 0) {
    conformite = "incomplet";
  } else {
    conformite = "conforme";
  }

  return {
    cuvees_actives: actives.length,
    cuvees_limit: PLAN_LIMITS[plan],
    scans_30j: scans30j,
    conformite,
    cuvees_a_completer: incompletes.length,
  };
}

export async function getRecentActivity(
  supabase: SupabaseClient<Database, "public">,
  userId: string,
): Promise<ActivityEvent[]> {
  // TODO: brancher sur Supabase (jointure `scans` ↔ `cuvees`).
  const { data } = await supabase
    .from("cuvees")
    .select("id, nom, statut")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  const cuvees = data ?? [];
  if (cuvees.length === 0) return [];

  const events: ActivityEvent[] = [];
  if (cuvees[0]) {
    events.push({
      id: `scan-${cuvees[0].id}`,
      kind: "scan",
      message: `Votre cuvée ${cuvees[0].nom} a été scannée 12 fois aujourd'hui`,
    });
  }
  if (cuvees[1]) {
    events.push({
      id: `geo-${cuvees[1].id}`,
      kind: "geo",
      message: `Cuvée ${cuvees[1].nom} — premier scan depuis l'Allemagne`,
    });
  }
  if (cuvees[2]) {
    events.push({
      id: `alerte-${cuvees[2].id}`,
      kind: "alerte",
      message: `Cuvée ${cuvees[2].nom} — traduction allemande manquante`,
    });
  }
  return events.slice(0, 5);
}

export interface SuggestionContext {
  cuvees_actives: number;
  cuvees_limit: number | null;
  plan: Plan;
  has_foreign_scans: boolean;
  has_missing_translation: boolean;
  has_any_order: boolean;
}

// Priorité descendante — premier match l'emporte.
export function getContextualSuggestion(
  ctx: SuggestionContext,
): ContextualSuggestion | null {
  // 1) Approche de la limite du plan gratuit.
  if (
    ctx.plan === "starter" &&
    ctx.cuvees_limit !== null &&
    ctx.cuvees_actives >= Math.ceil(ctx.cuvees_limit * 0.8)
  ) {
    return {
      kind: "upgrade_plan",
      title: "Vous approchez de la limite de votre plan gratuit",
      description: `Vous utilisez ${ctx.cuvees_actives} cuvée${ctx.cuvees_actives > 1 ? "s" : ""} sur ${ctx.cuvees_limit}. Passez à l'Essentiel pour des QR codes illimités.`,
      cta_label: "Passer à l'Essentiel — 99 €/an",
      cta_href: "/dashboard/parametres/abonnement",
    };
  }

  // 2) Trafic étranger sans traductions.
  if (ctx.has_foreign_scans && ctx.has_missing_translation) {
    return {
      kind: "enable_translations",
      title: "Vos pages e-label sont scannées à l'étranger",
      description:
        "Une part de vos scans vient de l'étranger. Activez les traductions automatiques pour rester conforme dans les 24 langues de l'UE.",
      cta_label: "Activer les traductions",
      cta_href: "/dashboard/parametres",
    };
  }

  // 3) Étiquettes physiques jamais commandées avec ≥ 3 cuvées actives.
  if (!ctx.has_any_order && ctx.cuvees_actives >= 3) {
    return {
      kind: "order_stickers",
      title: "Vos QR codes sont prêts",
      description:
        "Commandez vos stickers QR code et contre-étiquettes, livrés en 5 jours ouvrés.",
      cta_label: "Commander des stickers",
      cta_href: "/dashboard/store/stickers",
    };
  }

  return null;
}

export async function getSuggestionContext(
  supabase: SupabaseClient<Database, "public">,
  userId: string,
  plan: Plan,
  cuveesActives: number,
): Promise<SuggestionContext> {
  // TODO: brancher sur Supabase (`scans` pour le pays, `profiles.langues_elabel`
  // pour les traductions, `commandes` pour l'historique).
  const { data: commandesData } = await supabase
    .from("commandes")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  return {
    cuvees_actives: cuveesActives,
    cuvees_limit: PLAN_LIMITS[plan],
    plan,
    has_foreign_scans: cuveesActives > 0,
    has_missing_translation: true,
    has_any_order: (commandesData ?? []).length > 0,
  };
}
