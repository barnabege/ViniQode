// app/api/cuvees/draft/route.ts
//
// Endpoint dédié à la sauvegarde silencieuse de brouillon depuis
// `navigator.sendBeacon` au moment où l'utilisateur quitte la page.
// La sauvegarde manuelle (bouton "Sauvegarder en brouillon") passe
// directement par le client Supabase pour obtenir un retour synchrone.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  canCreateCuvee,
  getCuveeQuota,
  getUserPlanFromProfile,
} from "@/lib/plans";
import type { Plan } from "@/lib/database.types";

const ALLOWED_FIELDS = new Set([
  "nom",
  "region",
  "appellation",
  "millesime",
  "couleur",
  "degre_alcool",
  "volume_cl",
  "sucres_residuels",
  "ingredients",
  "allergenes",
  "valeur_energetique_kj",
  "valeur_energetique_kcal",
  "glucides_g",
  "sucres_g",
  "lipides_g",
  "acides_gras_satures_g",
  "proteines_g",
  "sel_g",
]);

interface DraftPayload {
  id?: string;
  fields?: Record<string, unknown>;
}

export async function POST(request: Request) {
  let payload: DraftPayload;
  try {
    payload = (await request.json()) as DraftPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.fields || typeof payload.fields !== "object") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload.fields)) {
    if (ALLOWED_FIELDS.has(k)) fields[k] = v;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (payload.id) {
    // UPDATE silencieux — ne touche pas le statut existant.
    // Filtre `deleted_at IS NULL` : on ne ressuscite jamais une cuvée
    // soft-deletée par un autosave de page restée ouverte.
    const { error } = await supabase
      .from("cuvees")
      .update(fields as never)
      .eq("id", payload.id)
      .eq("user_id", user.id)
      .is("deleted_at", null);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: payload.id });
  }

  if (typeof fields.nom !== "string" || !fields.nom.trim()) {
    return NextResponse.json({ error: "nom required" }, { status: 400 });
  }

  // Garde-fou quota — défense en profondeur (même check que les Server Actions).
  const [profileRes, countRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single<{ plan: Plan | null }>(),
    supabase
      .from("cuvees")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("deleted_at", null),
  ]);
  const plan = getUserPlanFromProfile(profileRes.data);
  const used = countRes.count ?? 0;
  if (!canCreateCuvee(plan, used)) {
    const q = getCuveeQuota(plan, used);
    return NextResponse.json(
      {
        error: "QUOTA_EXCEEDED",
        message: `Limite de ${q.limit} cuvée(s) atteinte pour le plan ${q.planLabel}.`,
        plan,
        limit: q.limit,
        current: used,
      },
      { status: 403 },
    );
  }

  const insertRow = { ...fields, user_id: user.id, statut: "brouillon" };
  const { data, error } = await supabase
    .from("cuvees")
    .insert(insertRow as never)
    .select("id")
    .single<{ id: string }>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
