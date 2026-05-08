"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";
import { totpCodeSchema, recoveryCodeSchema } from "@/lib/validations/security";
import { verifyRecoveryCode } from "@/lib/audit/recovery-codes";
import type { RecoveryCode } from "@/lib/database.types";

export type MfaResult = { ok: true } | { ok: false; error: string };

function safeRedirect(target: string | undefined): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return "/dashboard";
  }
  return target;
}

export async function verifyMfaTotp(
  code: string,
  redirectTo?: string,
): Promise<MfaResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const parsed = totpCodeSchema.safeParse({ code });
  if (!parsed.success) {
    return { ok: false, error: "Code à 6 chiffres requis" };
  }

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = (factors?.totp ?? []).find((f) => f.status === "verified");
  if (!verified) return { ok: false, error: "Aucun facteur 2FA actif" };

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: verified.id,
    code: parsed.data.code,
  });
  if (error) {
    await logAuditEvent({
      userId: user.id,
      eventType: AUDIT_EVENTS.SECURITY_2FA_CHALLENGE_FAILED,
      severity: "warning",
      success: false,
      metadata: { context: "login" },
    });
    return { ok: false, error: "Code invalide" };
  }

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.SECURITY_2FA_CHALLENGE_SUCCESS,
  });

  redirect(safeRedirect(redirectTo));
}

export async function verifyRecoveryCodeAction(
  rawCode: string,
  redirectTo?: string,
): Promise<MfaResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const parsed = recoveryCodeSchema.safeParse({ code: rawCode });
  if (!parsed.success) return { ok: false, error: "Code requis" };

  const service = createSupabaseServiceClient();
  const { data: codes } = await service
    .from("recovery_codes")
    .select("*")
    .eq("user_id", user.id)
    .is("used_at", null);

  const rows = (codes ?? []) as RecoveryCode[];
  if (rows.length === 0) {
    return { ok: false, error: "Aucun code de récupération disponible" };
  }

  // Vérification linéaire (≤ 8 codes → ms-level).
  let match: RecoveryCode | null = null;
  for (const row of rows) {
    if (await verifyRecoveryCode(parsed.data.code, row.code_hash)) {
      match = row;
      break;
    }
  }

  if (!match) {
    await logAuditEvent({
      userId: user.id,
      eventType: AUDIT_EVENTS.SECURITY_2FA_CHALLENGE_FAILED,
      severity: "warning",
      success: false,
      metadata: { context: "recovery_code" },
    });
    return { ok: false, error: "Code de récupération invalide" };
  }

  await service
    .from("recovery_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", match.id);

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.SECURITY_RECOVERY_CODE_USED,
    severity: "warning",
    metadata: { remaining: rows.length - 1 },
  });

  redirect(safeRedirect(redirectTo));
}
