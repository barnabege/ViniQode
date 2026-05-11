// lib/cuvees.ts
//
// Helpers de lecture pour la table public.cuvees. SERVER-ONLY (importe
// supabase-server → next/headers). Pour les helpers purs partagés avec le
// client, voir lib/cuvees-shared.ts.
//
// RÈGLE CRITIQUE : toutes les lectures applicatives DOIVENT passer par ces
// helpers (ou répliquer leur filtre `.is('deleted_at', null)`). Une cuvée
// soft-deletée ne doit JAMAIS apparaître dans l'UI utilisateur, même si la
// RLS l'autorise au propriétaire.
//
// Voir aussi : supabase/migrations/0004_cuvees_compliance.sql

import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Cuvee } from "@/lib/database.types";

/**
 * Récupère toutes les cuvées actives d'un utilisateur (non soft-deletées),
 * triées par mise à jour décroissante.
 */
export async function getActiveCuveesForUser(userId: string): Promise<Cuvee[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("cuvees")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  return (data ?? []) as Cuvee[];
}

/**
 * Récupère une cuvée par id, en s'assurant qu'elle appartient bien à
 * l'utilisateur et qu'elle n'est pas soft-deletée. Retourne null sinon.
 */
export async function getActiveCuveeById(
  userId: string,
  id: string,
): Promise<Cuvee | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("cuvees")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle<Cuvee>();
  return data ?? null;
}

