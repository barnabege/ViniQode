// app/dashboard/cuvees/_actions.ts
//
// Server Actions pour le CRUD complet d'une cuvée.
//
// - Toutes les actions sont authentifiées via createSupabaseServerClient().
// - La RLS Supabase ajoute une seconde couche de protection (auth.uid()).
// - Le filtre `.is('deleted_at', null)` est systématique sur les lectures
//   (cf. lib/cuvees.ts) ; les soft-deletes utilisent un UPDATE timestamp.
// - Toutes les mutations revalident /dashboard ET /dashboard/cuvees.

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { detecterAllergenes } from "@/lib/ingredients";
import {
  canCreateCuvee,
  getCuveeQuota,
  getUserPlanFromProfile,
} from "@/lib/plans";
import type { Plan } from "@/lib/database.types";
import {
  cuveeDraftSchema,
  cuveePublishSchema,
  type CuveeDraftInput,
} from "@/lib/validations/cuvees";

// ──────────────────────────────────────────────────────────────────────────
// Types de retour
// ──────────────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

interface SaveResult {
  id: string;
  elabelUrl?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function revalidateRoutes() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuvees");
}

function formatZodError(error: { issues: { message: string }[] }): string {
  return error.issues.map((i) => i.message).join(" • ");
}

async function getAuthenticatedUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Vérifie côté serveur que l'utilisateur peut créer une nouvelle cuvée.
 * Compte toutes les cuvées non soft-deletées (tous statuts confondus).
 * Renvoie un message d'erreur préfixé QUOTA_EXCEEDED: si la limite est
 * atteinte — le préfixe permet au client (Wizard) de réagir spécifiquement.
 */
async function checkCuveeQuotaServerSide(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [profileRes, countRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single<{ plan: Plan | null }>(),
    supabase
      .from("cuvees")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
  ]);

  const plan = getUserPlanFromProfile(profileRes.data);
  const used = countRes.count ?? 0;
  if (!canCreateCuvee(plan, used)) {
    const q = getCuveeQuota(plan, used);
    return {
      ok: false,
      error: `QUOTA_EXCEEDED:Limite de ${q.limit} cuvée${
        q.limit > 1 ? "s" : ""
      } atteinte pour le plan ${q.planLabel}. Passez à Essentiel pour des cuvées illimitées.`,
    };
  }
  return { ok: true };
}

// ──────────────────────────────────────────────────────────────────────────
// saveCuveeDraftAction — sauvegarde silencieuse (préserve statut existant)
// ──────────────────────────────────────────────────────────────────────────

export async function saveCuveeDraftAction(
  input: CuveeDraftInput,
  existingId?: string,
): Promise<ActionResult<SaveResult>> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const parsed = cuveeDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const allergenes = detecterAllergenes(parsed.data.ingredients);
  const fields = { ...parsed.data, allergenes };

  if (existingId) {
    // UPDATE en préservant le statut. Filtre deleted_at IS NULL en garde-fou.
    const { error } = await supabase
      .from("cuvees")
      .update(fields as never)
      .eq("id", existingId)
      .eq("user_id", user.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    revalidateRoutes();
    return { ok: true, data: { id: existingId } };
  }

  // INSERT initial — toujours en brouillon.
  const quotaCheck = await checkCuveeQuotaServerSide(supabase, user.id);
  if (!quotaCheck.ok) return { ok: false, error: quotaCheck.error };

  const { data, error } = await supabase
    .from("cuvees")
    .insert({
      ...(fields as Record<string, unknown>),
      user_id: user.id,
      statut: "brouillon",
    } as never)
    .select("id")
    .single<{ id: string }>();
  if (error) return { ok: false, error: error.message };

  revalidateRoutes();
  return { ok: true, data: { id: data.id } };
}

// ──────────────────────────────────────────────────────────────────────────
// submitCuveeAction — soumission depuis l'étape finale du Wizard
//   - publish=true → exige les champs réglementaires, génère elabel_url si
//     première publication, passe statut='actif'.
//   - publish=false → sauvegarde simple en brouillon ('brouillon').
// ──────────────────────────────────────────────────────────────────────────

export interface SubmitCuveeOptions {
  existingId?: string;
  publish: boolean;
  /** Origine de la page (pour construire elabel_url côté client → serveur). */
  origin: string;
}

export async function submitCuveeAction(
  input: CuveeDraftInput,
  opts: SubmitCuveeOptions,
): Promise<ActionResult<SaveResult>> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const schema = opts.publish ? cuveePublishSchema : cuveeDraftSchema;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const allergenes = detecterAllergenes(parsed.data.ingredients);
  const targetStatut = opts.publish ? "actif" : "brouillon";

  // Récupère l'éventuelle elabel_url existante pour ne pas la régénérer.
  let existingElabel: string | null = null;
  if (opts.existingId) {
    const { data: existing } = await supabase
      .from("cuvees")
      .select("elabel_url")
      .eq("id", opts.existingId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle<{ elabel_url: string | null }>();
    existingElabel = existing?.elabel_url ?? null;
  }

  const baseFields = {
    ...parsed.data,
    allergenes,
    statut: targetStatut,
  };

  let cuveeId: string;

  if (opts.existingId) {
    const { error } = await supabase
      .from("cuvees")
      .update(baseFields as never)
      .eq("id", opts.existingId)
      .eq("user_id", user.id)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    cuveeId = opts.existingId;
  } else {
    const quotaCheck = await checkCuveeQuotaServerSide(supabase, user.id);
    if (!quotaCheck.ok) return { ok: false, error: quotaCheck.error };

    const { data, error } = await supabase
      .from("cuvees")
      .insert({
        ...(baseFields as Record<string, unknown>),
        user_id: user.id,
      } as never)
      .select("id")
      .single<{ id: string }>();
    if (error) return { ok: false, error: error.message };
    cuveeId = data.id;
  }

  // Génère elabel_url uniquement à la première publication.
  let elabelUrl: string | undefined;
  if (opts.publish && !existingElabel) {
    elabelUrl = `${opts.origin}/elabel/${cuveeId}`;
    const { error } = await supabase
      .from("cuvees")
      .update({ elabel_url: elabelUrl })
      .eq("id", cuveeId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
  }

  revalidateRoutes();
  return {
    ok: true,
    data: { id: cuveeId, elabelUrl: elabelUrl ?? existingElabel ?? undefined },
  };
}

// ──────────────────────────────────────────────────────────────────────────
// softDeleteCuveeAction(s) — pose deleted_at = now()
// ──────────────────────────────────────────────────────────────────────────

export async function softDeleteCuveeAction(
  id: string,
): Promise<ActionResult<{ count: number }>> {
  if (typeof id !== "string" || id.length < 8) {
    return { ok: false, error: "Identifiant invalide." };
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const { error } = await supabase
    .from("cuvees")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  revalidateRoutes();
  return { ok: true, data: { count: 1 } };
}

export async function softDeleteCuveesAction(
  ids: string[],
): Promise<ActionResult<{ count: number }>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Aucune cuvée sélectionnée." };
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const { error, count } = await supabase
    .from("cuvees")
    .update(
      { deleted_at: new Date().toISOString() } as never,
      { count: "exact" },
    )
    .in("id", ids)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  revalidateRoutes();
  return { ok: true, data: { count: count ?? ids.length } };
}

// ──────────────────────────────────────────────────────────────────────────
// duplicateCuveeAction — clone (« Copie de X », statut brouillon)
// ──────────────────────────────────────────────────────────────────────────

export async function duplicateCuveeAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const { data: source, error: readError } = await supabase
    .from("cuvees")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (readError || !source) {
    return { ok: false, error: "Cuvée introuvable." };
  }

  // On laisse Postgres regénérer id, created_at, updated_at, et on remet
  // qr_code_url / elabel_url à null (le duplicata n'hérite pas du QR).
  const copy = source as Record<string, unknown>;
  const { id: _id, created_at, updated_at, qr_code_url, elabel_url, ...rest } = copy;
  void _id;
  void created_at;
  void updated_at;
  void qr_code_url;
  void elabel_url;

  const newRow = {
    ...rest,
    nom: `Copie de ${source.nom}`,
    statut: "brouillon",
    qr_code_url: null,
    elabel_url: null,
    deleted_at: null,
  };

  const quotaCheck = await checkCuveeQuotaServerSide(supabase, user.id);
  if (!quotaCheck.ok) return { ok: false, error: quotaCheck.error };

  const { data: inserted, error: insertError } = await supabase
    .from("cuvees")
    .insert(newRow as never)
    .select("id")
    .single<{ id: string }>();
  if (insertError) return { ok: false, error: insertError.message };

  revalidateRoutes();
  return { ok: true, data: { id: inserted.id } };
}

export async function bulkDuplicateCuveesAction(
  ids: string[],
): Promise<ActionResult<{ count: number }>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Aucune cuvée sélectionnée." };
  }
  let count = 0;
  for (const id of ids) {
    const r = await duplicateCuveeAction(id);
    if (r.ok) count += 1;
  }
  return { ok: true, data: { count } };
}

// ──────────────────────────────────────────────────────────────────────────
// bulkArchiveCuveesAction — passage en statut='archive'
// ──────────────────────────────────────────────────────────────────────────

export async function bulkArchiveCuveesAction(
  ids: string[],
): Promise<ActionResult<{ count: number }>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "Aucune cuvée sélectionnée." };
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const { error, count } = await supabase
    .from("cuvees")
    .update({ statut: "archive" } as never, { count: "exact" })
    .in("id", ids)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  revalidateRoutes();
  return { ok: true, data: { count: count ?? ids.length } };
}
