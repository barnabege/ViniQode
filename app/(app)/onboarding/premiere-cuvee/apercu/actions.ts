"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Cuvee, Profile } from "@/lib/database.types";

export interface ApercuData {
  cuvee: Pick<
    Cuvee,
    | "id"
    | "nom"
    | "millesime"
    | "type_vin"
    | "degre_alcool"
    | "volume_cl"
    | "ingredients"
    | "allergenes"
    | "valeur_energetique_kj"
    | "valeur_energetique_kcal"
    | "glucides_g"
    | "sucres_g"
  >;
  profile: Pick<Profile, "nom_domaine" | "region">;
  emailConfirmed: boolean;
}

export interface ApercuResult {
  error?: string;
  data?: ApercuData;
}

export async function loadApercuAction(cuveeId: string): Promise<ApercuResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous n'êtes plus connecté." };

  const [cuveeRes, profileRes] = await Promise.all([
    supabase
      .from("cuvees")
      .select(
        "id, nom, millesime, type_vin, degre_alcool, volume_cl, ingredients, allergenes, valeur_energetique_kj, valeur_energetique_kcal, glucides_g, sucres_g",
      )
      .eq("id", cuveeId)
      .eq("user_id", user.id)
      .single<ApercuData["cuvee"]>(),
    supabase
      .from("profiles")
      .select("nom_domaine, region")
      .eq("id", user.id)
      .single<ApercuData["profile"]>(),
  ]);

  if (cuveeRes.error || !cuveeRes.data) return { error: "Cuvée introuvable." };
  if (profileRes.error || !profileRes.data)
    return { error: "Profil introuvable." };

  return {
    data: {
      cuvee: cuveeRes.data,
      profile: profileRes.data,
      emailConfirmed: Boolean(user.email_confirmed_at),
    },
  };
}

export interface PublishResult {
  error?: string;
  needsEmailConfirmation?: boolean;
}

export async function publishCuveeAction(
  cuveeId: string,
): Promise<PublishResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous n'êtes plus connecté." };

  if (!user.email_confirmed_at) {
    return {
      needsEmailConfirmation: true,
      error: "Confirmez votre email pour publier votre QR code.",
    };
  }

  const { error } = await supabase
    .from("cuvees")
    .update({ statut: "actif" })
    .eq("id", cuveeId)
    .eq("user_id", user.id);

  if (error) return { error: "Impossible de publier. Réessayez." };

  return {};
}
