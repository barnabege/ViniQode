"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { facturationSchema } from "@/lib/validations/parametres";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";
import type { FormeJuridique } from "@/lib/database.types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateFacturation(
  input: unknown,
): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const parsed = facturationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides" };
  }

  const d = parsed.data;
  const payload = {
    raison_sociale: d.raison_sociale?.trim() || null,
    forme_juridique: (d.forme_juridique || null) as FormeJuridique | null,
    adresse_facturation: d.adresse_facturation?.trim() || null,
    tva_intracommunautaire: d.tva_intracommunautaire?.trim() || null,
    livraison_identique_facturation: d.livraison_identique_facturation,
    adresse_livraison: d.livraison_identique_facturation
      ? null
      : d.adresse_livraison?.trim() || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.PROFILE_UPDATED,
    metadata: { section: "facturation" },
  });

  revalidatePath("/dashboard/parametres");
  return { ok: true };
}
