"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { detecterAllergenes, INGREDIENTS } from "@/lib/ingredients";

export interface SaveIngredientsResult {
  error?: string;
}

const VALID_IDS = new Set(INGREDIENTS.map((i) => i.id));

export async function saveIngredientsAction(
  cuveeId: string,
  orderedIds: string[],
): Promise<SaveIngredientsResult> {
  if (typeof cuveeId !== "string" || cuveeId.length < 8) {
    return { error: "Cuvée introuvable. Reprenez l'étape précédente." };
  }

  const cleaned = orderedIds.filter((id) => VALID_IDS.has(id));
  if (cleaned.length === 0) {
    return { error: "Sélectionnez au moins un ingrédient." };
  }
  if (!cleaned.includes("raisins")) {
    return { error: "Les raisins doivent figurer dans la liste." };
  }

  const allergenes = detecterAllergenes(cleaned);

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous n'êtes plus connecté." };

  const { error } = await supabase
    .from("cuvees")
    .update({ ingredients: cleaned, allergenes })
    .eq("id", cuveeId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible d'enregistrer. Réessayez." };

  return {};
}
