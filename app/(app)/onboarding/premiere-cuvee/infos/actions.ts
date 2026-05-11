"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  cuveeInfosSchema,
  type CuveeInfosInput,
} from "@/lib/onboarding/schemas";
import { detecterAllergenes } from "@/lib/ingredients";

export interface CreateCuveeResult {
  error?: string;
  cuveeId?: string;
}

export async function createCuveeAction(
  values: CuveeInfosInput,
): Promise<CreateCuveeResult> {
  const parsed = cuveeInfosSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Les informations saisies sont invalides." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous n'êtes plus connecté." };

  // Convert ml → cl (integer column). 375 ml → 38 cl is a slight
  // approximation accepted by the legacy schema.
  const volume_cl = Math.round(parsed.data.volume_ml / 10);

  // Default ingredients : raisins (always) + sulfites (sensible default).
  const defaultIngredientIds = ["raisins", "e220"];
  const allergenes = detecterAllergenes(defaultIngredientIds);

  const { data, error } = await supabase
    .from("cuvees")
    .insert({
      user_id: user.id,
      nom: parsed.data.nom,
      appellation: null,
      millesime: parsed.data.millesime,
      type_vin: parsed.data.type_vin,
      degre_alcool: parsed.data.degre_alcool,
      volume_cl,
      sucres_residuels: parsed.data.sucres_residuels_g_l,
      ingredients: defaultIngredientIds,
      allergenes,
      valeur_energetique_kj: null,
      valeur_energetique_kcal: null,
      glucides_g: null,
      sucres_g: null,
      statut: "brouillon",
      qr_code_url: null,
      elabel_url: null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return { error: "Impossible de créer la cuvée. Réessayez." };
  }

  return { cuveeId: data.id };
}
