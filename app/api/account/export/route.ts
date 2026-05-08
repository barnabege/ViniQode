// app/api/account/export/route.ts
// RGPD article 20 : droit à la portabilité des données.
// Retourne un JSON contenant toutes les données associées au compte.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [profileRes, cuveesRes, commandesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("cuvees").select("*").eq("user_id", user.id),
    supabase.from("commandes").select("*").eq("user_id", user.id),
  ]);

  if (profileRes.data?.deleted_at) {
    return NextResponse.json(
      { error: "Compte supprimé" },
      { status: 403 },
    );
  }

  const payload = {
    metadata: {
      article: "Article 20 du RGPD — Droit à la portabilité des données",
      exported_at: new Date().toISOString(),
      app: "ViniQode",
    },
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
    },
    profile: profileRes.data ?? null,
    cuvees: cuveesRes.data ?? [],
    commandes: commandesRes.data ?? [],
  };

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.DATA_EXPORTED,
    metadata: {
      cuvees_count: payload.cuvees.length,
      commandes_count: payload.commandes.length,
    },
  });

  const date = new Date().toISOString().split("T")[0];
  const filename = `viniqode-export-${date}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
