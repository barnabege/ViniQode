"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { domaineSchema, type DomaineInput } from "@/lib/onboarding/schemas";

export interface DomaineActionResult {
  error?: string;
}

export async function saveDomaineAction(
  values: DomaineInput,
): Promise<DomaineActionResult> {
  const parsed = domaineSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Les informations saisies sont invalides." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Vous n'êtes plus connecté." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nom_domaine: parsed.data.raison_sociale,
      region: parsed.data.region,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer le domaine. Réessayez." };
  }

  redirect("/onboarding/premiere-cuvee/infos");
}
