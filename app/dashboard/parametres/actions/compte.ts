"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { compteSchema } from "@/lib/validations/parametres";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateCompte(input: unknown): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const parsed = compteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Données invalides" };

  const d = parsed.data;
  const payload = {
    prenom: d.prenom?.trim() || null,
    nom: d.nom?.trim() || null,
    fonction: d.fonction?.trim() || null,
    telephone: d.telephone?.trim() || null,
    email_contact_public: d.email_contact_public?.trim() || null,
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
    metadata: { section: "compte" },
  });

  revalidatePath("/dashboard/parametres");
  return { ok: true };
}
