"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface DeleteResult {
  ok: boolean;
  error?: string;
  count?: number;
}

export async function deleteCuveeAction(id: string): Promise<DeleteResult> {
  if (typeof id !== "string" || id.length < 8) {
    return { ok: false, error: "Identifiant invalide." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const { error } = await supabase
    .from("cuvees")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true, count: 1 };
}

export async function deleteCuveesAction(
  ids: string[],
): Promise<DeleteResult> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Aucune cuvée sélectionnée." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  // Le filtre user_id est appliqué côté DB ET via la policy RLS, donc
  // une cuvée d'un autre utilisateur ne sera jamais supprimée même si
  // un client malveillant injecte son id.
  const { error, count } = await supabase
    .from("cuvees")
    .delete({ count: "exact" })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true, count: count ?? ids.length };
}
