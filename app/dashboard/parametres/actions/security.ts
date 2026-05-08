"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";
import {
  changeEmailSchema,
  changePasswordSchema,
  disable2FASchema,
  totpCodeSchema,
} from "@/lib/validations/security";
import {
  generateRecoveryCodesPlain,
  hashRecoveryCode,
  RECOVERY_CODE_COUNT,
} from "@/lib/audit/recovery-codes";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// ─── helpers internes ───────────────────────────────────────────────────

/**
 * Vérifie le mot de passe d'un user sans casser la session courante :
 * client Supabase éphémère (anon, sans persistance) → signInWithPassword.
 * En cas de succès, le tempClient stocke un token en mémoire qu'on jette.
 */
async function verifyCurrentPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const temp = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const { error } = await temp.auth.signInWithPassword({ email, password });
  return !error;
}

// ─── Mot de passe ───────────────────────────────────────────────────────

export async function changePassword(input: unknown): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "Session expirée" };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides" };
  }
  const d = parsed.data;

  const valid = await verifyCurrentPassword(user.email, d.current_password);
  if (!valid) {
    await logAuditEvent({
      userId: user.id,
      eventType: AUDIT_EVENTS.AUTH_LOGIN_FAILED,
      severity: "warning",
      success: false,
      metadata: { context: "change_password_reauth" },
    });
    return { ok: false, error: "Mot de passe actuel incorrect" };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: d.new_password,
  });
  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  // Déconnecter les autres sessions (la courante reste active).
  await supabase.auth.signOut({ scope: "others" });

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.AUTH_PASSWORD_CHANGED,
    severity: "warning",
  });

  return { ok: true };
}

// ─── Email ──────────────────────────────────────────────────────────────

export async function changeEmail(input: unknown): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "Session expirée" };

  const parsed = changeEmailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Données invalides" };
  const d = parsed.data;

  if (d.new_email.toLowerCase() === user.email.toLowerCase()) {
    return { ok: false, error: "Le nouvel email est identique à l'actuel" };
  }

  const valid = await verifyCurrentPassword(user.email, d.current_password);
  if (!valid) {
    return { ok: false, error: "Mot de passe incorrect" };
  }

  const { error } = await supabase.auth.updateUser({ email: d.new_email });
  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.AUTH_EMAIL_CHANGE_REQUESTED,
    severity: "warning",
    metadata: { old_email: user.email, new_email: d.new_email },
  });

  return { ok: true };
}

// ─── Sessions ───────────────────────────────────────────────────────────

export async function revokeSession(
  sessionId: string,
): Promise<ActionResult> {
  if (!sessionId || typeof sessionId !== "string") {
    return { ok: false, error: "Identifiant de session invalide" };
  }
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  // DELETE direct sur auth.sessions (l'API admin.signOut() prend un JWT,
  // pas un session_id ; le DELETE est l'approche pragmatique).
  // Le schema "auth" n'est pas typé dans Database → cast manuel.
  const service = createSupabaseServiceClient() as unknown as {
    schema: (s: string) => {
      from: (t: string) => {
        delete: () => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => Promise<{
              error: { message: string } | null;
            }>;
          };
        };
      };
    };
  };
  const { error } = await service
    .schema("auth")
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.AUTH_SESSION_REVOKED,
    metadata: { session_id: sessionId },
  });

  return { ok: true };
}

export async function revokeAllOtherSessions(): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.AUTH_ALL_SESSIONS_REVOKED,
    severity: "warning",
  });

  return { ok: true };
}

// ─── 2FA ────────────────────────────────────────────────────────────────

export interface EnrollMfaResult {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export async function enable2FAEnroll(): Promise<
  ActionResult<EnrollMfaResult>
> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  // Si un enrollment TOTP existe déjà mais n'est pas verified, on le purge
  // d'abord pour éviter "factor already exists".
  const { data: factorsList } = await supabase.auth.mfa.listFactors();
  const existingTotp = factorsList?.totp ?? [];
  for (const f of existingTotp) {
    if (f.status !== "verified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "ViniQode",
  });
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Enrôlement impossible" };
  }

  return {
    ok: true,
    data: {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    },
  };
}

export async function verify2FAEnrollment(input: {
  factorId: string;
  code: string;
}): Promise<ActionResult<{ recoveryCodes: string[] }>> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée" };

  const codeParsed = totpCodeSchema.safeParse({ code: input.code });
  if (!codeParsed.success) {
    return { ok: false, error: "Code à 6 chiffres requis" };
  }
  if (!input.factorId) {
    return { ok: false, error: "factorId manquant" };
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: input.factorId,
    code: codeParsed.data.code,
  });
  if (error) {
    await logAuditEvent({
      userId: user.id,
      eventType: AUDIT_EVENTS.SECURITY_2FA_CHALLENGE_FAILED,
      severity: "warning",
      success: false,
      metadata: { context: "enrollment" },
    });
    return { ok: false, error: "Code invalide. Réessayez." };
  }

  // Génération + hash + insertion des recovery codes.
  const plainCodes = generateRecoveryCodesPlain(RECOVERY_CODE_COUNT);
  const service = createSupabaseServiceClient();

  // Purge éventuelle d'anciens codes (cas où on re-enrôle).
  await service.from("recovery_codes").delete().eq("user_id", user.id);

  const rows = await Promise.all(
    plainCodes.map(async (code) => ({
      user_id: user.id,
      code_hash: await hashRecoveryCode(code),
      used_at: null,
    })),
  );
  const { error: insertError } = await service
    .from("recovery_codes")
    .insert(rows);
  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.SECURITY_2FA_ENABLED,
    severity: "warning",
  });

  return { ok: true, data: { recoveryCodes: plainCodes } };
}

export async function disable2FA(input: unknown): Promise<ActionResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "Session expirée" };

  const parsed = disable2FASchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Mot de passe requis" };

  const valid = await verifyCurrentPassword(
    user.email,
    parsed.data.current_password,
  );
  if (!valid) return { ok: false, error: "Mot de passe incorrect" };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = (factors?.totp ?? []).filter((f) => f.status === "verified");

  for (const f of verified) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
    if (error) return { ok: false, error: error.message };
  }

  const service = createSupabaseServiceClient();
  await service.from("recovery_codes").delete().eq("user_id", user.id);

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.SECURITY_2FA_DISABLED,
    severity: "critical",
  });

  return { ok: true };
}

export async function regenerateRecoveryCodes(
  input: unknown,
): Promise<ActionResult<{ recoveryCodes: string[] }>> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "Session expirée" };

  const parsed = disable2FASchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Mot de passe requis" };

  const valid = await verifyCurrentPassword(
    user.email,
    parsed.data.current_password,
  );
  if (!valid) return { ok: false, error: "Mot de passe incorrect" };

  const service = createSupabaseServiceClient();
  await service.from("recovery_codes").delete().eq("user_id", user.id);

  const plainCodes = generateRecoveryCodesPlain(RECOVERY_CODE_COUNT);
  const rows = await Promise.all(
    plainCodes.map(async (code) => ({
      user_id: user.id,
      code_hash: await hashRecoveryCode(code),
      used_at: null,
    })),
  );
  const { error } = await service.from("recovery_codes").insert(rows);
  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    userId: user.id,
    eventType: AUDIT_EVENTS.SECURITY_2FA_ENABLED,
    metadata: { regenerated: true },
  });

  return { ok: true, data: { recoveryCodes: plainCodes } };
}

// ─── Logout ─────────────────────────────────────────────────────────────

/**
 * Déconnecte l'utilisateur courant. Par défaut, redirige vers la landing.
 * `redirectTo` peut être surchargé pour des cas spécifiques (ex:
 * `/connexion?reason=account_deleted` après suppression de compte).
 */
export async function logoutAction(redirectTo: string = "/"): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      userId: user.id,
      eventType: AUDIT_EVENTS.AUTH_LOGOUT,
    });
  }
  await supabase.auth.signOut();
  redirect(redirectTo);
}
