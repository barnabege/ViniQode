// app/api/account/delete/route.ts
// Soft delete du compte (RGPD article 17 - droit à l'effacement).
// Pose `deleted_at` sur profiles. La purge effective sera assurée par
// un cron à configurer (cf. MIGRATION_NOTES.md).

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Non authentifié" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  const emailConfirmation = (body as { email_confirmation?: unknown })
    ?.email_confirmation;

  if (
    typeof emailConfirmation !== "string" ||
    emailConfirmation.toLowerCase().trim() !== (user.email ?? "").toLowerCase()
  ) {
    return NextResponse.json(
      { ok: false, error: "Email de confirmation incorrect" },
      { status: 400 },
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message },
      { status: 500 },
    );
  }

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.PROFILE_DELETED_REQUESTED,
    severity: "critical",
  });

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
