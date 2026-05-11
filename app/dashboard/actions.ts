// app/dashboard/actions.ts
//
// Server Action de suppression d'une cuvée — utilisée par le kebab menu de
// la carte (composant CuveeActions). Soft-delete uniquement : on pose
// deleted_at = now(), on ne touche pas la ligne. Critique pour les QR codes
// imprimés (cf. supabase/migrations/0004_cuvees_compliance.sql).
//
// Pour les actions de la page /dashboard/cuvees (bulk, duplicate, archive,
// create, update), voir app/dashboard/cuvees/_actions.ts.

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
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuvees");
  return { ok: true, count: 1 };
}
