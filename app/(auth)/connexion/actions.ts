"use server";

import { redirect } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { mapSupabaseAuthError } from "@/lib/auth/error-messages";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { logAuditEvent } from "@/lib/audit/log";
import { AUDIT_EVENTS } from "@/lib/audit/events";

export interface ActionResult {
  error?: string;
}

export async function loginAction(
  values: LoginInput,
  redirectTo?: string,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Les informations saisies sont invalides." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Lookup best-effort de l'user pour rattacher le log d'échec à son
    // user_id (audit_logs.user_id is NOT NULL).
    await logFailedLogin(parsed.data.email);
    return { error: mapSupabaseAuthError(error) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      userId: user.id,
      eventType: AUDIT_EVENTS.AUTH_LOGIN_SUCCESS,
    });

    // Challenge MFA si l'user a un facteur TOTP actif.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = (factors?.totp ?? []).some(
      (f) => f.status === "verified",
    );
    if (hasVerifiedFactor) {
      const next = encodeURIComponent(safeRedirect(redirectTo));
      redirect(`/connexion/mfa?redirectTo=${next}`);
    }
  }

  redirect(safeRedirect(redirectTo));
}

async function logFailedLogin(email: string): Promise<void> {
  try {
    const service = createSupabaseServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (!profile) return;
    await logAuditEvent({
      userId: profile.id,
      eventType: AUDIT_EVENTS.AUTH_LOGIN_FAILED,
      severity: "warning",
      success: false,
      metadata: { email_attempted: email },
    });
  } catch (err) {
    console.error("[audit] failed_login lookup error:", err);
  }
}

function safeRedirect(target: string | undefined): string {
  if (!target) return "/dashboard";
  if (!target.startsWith("/") || target.startsWith("//")) return "/dashboard";
  return target;
}
