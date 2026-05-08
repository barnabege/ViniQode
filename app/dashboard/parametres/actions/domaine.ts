"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { domaineSchema } from "@/lib/validations/parametres";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";
import type { Certification, TypeViticulture } from "@/lib/database.types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateDomaine(input: unknown): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const parsed = domaineSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides" };
  }

  const d = parsed.data;

  const payload = {
    nom_domaine: d.nom_domaine.trim(),
    adresse: d.adresse?.trim() || null,
    region: d.region || null,
    siret: d.siret || null,
    site_web: d.site_web?.trim() || null,
    annee_creation:
      typeof d.annee_creation === "number" ? d.annee_creation : null,
    surface_hectares:
      typeof d.surface_hectares === "number" ? d.surface_hectares : null,
    type_viticulture: d.type_viticulture as TypeViticulture[],
    certifications: d.certifications as Certification[],
    latitude: typeof d.latitude === "number" ? d.latitude : null,
    longitude: typeof d.longitude === "number" ? d.longitude : null,
    logo_url: d.logo_url || null,
    photo_domaine_url: d.photo_domaine_url || null,
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
    metadata: { section: "domaine" },
  });

  revalidatePath("/dashboard/parametres");
  return { ok: true };
}
