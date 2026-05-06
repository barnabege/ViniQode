"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface DraftCuvee {
  degre_alcool: number;
  sucres_residuels: number;
}

export interface DraftCuveeResult {
  error?: string;
  cuvee?: DraftCuvee;
}

export async function getDraftCuveeAction(
  cuveeId: string,
): Promise<DraftCuveeResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous n'êtes plus connecté." };

  const { data, error } = await supabase
    .from("cuvees")
    .select("degre_alcool, sucres_residuels")
    .eq("id", cuveeId)
    .eq("user_id", user.id)
    .single<{ degre_alcool: number | null; sucres_residuels: number | null }>();

  if (error || !data) return { error: "Cuvée introuvable." };

  return {
    cuvee: {
      degre_alcool: data.degre_alcool ?? 12.5,
      sucres_residuels: data.sucres_residuels ?? 0,
    },
  };
}

export interface SaveNutritionInput {
  energie_kj: number;
  energie_kcal: number;
  glucides_g: number;
  sucres_g: number;
}

export interface SaveNutritionResult {
  error?: string;
}

export async function saveNutritionAction(
  cuveeId: string,
  values: SaveNutritionInput,
): Promise<SaveNutritionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous n'êtes plus connecté." };

  const { error } = await supabase
    .from("cuvees")
    .update({
      valeur_energetique_kj: Math.round(values.energie_kj),
      valeur_energetique_kcal: Math.round(values.energie_kcal),
      glucides: Number(values.glucides_g.toFixed(1)),
      sucres_nutritionnels: Number(values.sucres_g.toFixed(1)),
    })
    .eq("id", cuveeId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible d'enregistrer. Réessayez." };

  return {};
}
