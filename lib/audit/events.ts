// lib/audit/events.ts
// Constantes des event_type loguées dans audit_logs.
// Convention : "<category>.<verb>", catégorie = préfixe avant le point.

import type { EventCategory } from "@/lib/database.types";

export const AUDIT_EVENTS = {
  // ── auth ────────────────────────────────────────────────────────────
  AUTH_LOGIN_SUCCESS: "auth.login_success",
  AUTH_LOGIN_FAILED: "auth.login_failed",
  AUTH_LOGOUT: "auth.logout",
  AUTH_PASSWORD_CHANGED: "auth.password_changed",
  AUTH_EMAIL_CHANGE_REQUESTED: "auth.email_change_requested",
  AUTH_EMAIL_CHANGED: "auth.email_changed",
  AUTH_SESSION_REVOKED: "auth.session_revoked",
  AUTH_ALL_SESSIONS_REVOKED: "auth.all_sessions_revoked",

  // ── security ────────────────────────────────────────────────────────
  SECURITY_2FA_ENABLED: "security.2fa_enabled",
  SECURITY_2FA_DISABLED: "security.2fa_disabled",
  SECURITY_2FA_CHALLENGE_SUCCESS: "security.2fa_challenge_success",
  SECURITY_2FA_CHALLENGE_FAILED: "security.2fa_challenge_failed",
  SECURITY_RECOVERY_CODE_USED: "security.recovery_code_used",

  // ── profile ─────────────────────────────────────────────────────────
  PROFILE_UPDATED: "profile.updated",
  PROFILE_DELETED_REQUESTED: "profile.deleted_requested",
  PROFILE_DELETED_RESTORED: "profile.deleted_restored",

  // ── billing ─────────────────────────────────────────────────────────
  BILLING_PAYMENT_METHOD_UPDATED: "billing.payment_method_updated",
  BILLING_SUBSCRIPTION_CHANGED: "billing.subscription_changed",

  // ── data ────────────────────────────────────────────────────────────
  DATA_EXPORTED: "data.exported",
} as const;

export type AuditEventType =
  (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];

/**
 * Déduit la catégorie depuis le préfixe de l'event_type
 * (la convention "<category>.<verb>" rend cette dérivation univoque).
 */
export function eventCategoryOf(eventType: AuditEventType): EventCategory {
  const prefix = eventType.split(".")[0];
  switch (prefix) {
    case "auth":
      return "auth";
    case "security":
      return "security";
    case "profile":
      return "profile";
    case "billing":
      return "billing";
    case "data":
      return "data";
    default:
      // exhaustivité : tous les préfixes existants sont couverts ci-dessus,
      // ce fallback n'est atteint que si quelqu'un ajoute un préfixe sans
      // mettre à jour ce switch.
      return "data";
  }
}
