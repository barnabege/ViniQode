// lib/audit/labels.ts
// Mapping FR des event_type pour l'affichage du journal d'activité.

import { AUDIT_EVENTS, type AuditEventType } from "./events";

export const EVENT_LABELS: Record<AuditEventType, string> = {
  [AUDIT_EVENTS.AUTH_LOGIN_SUCCESS]: "Connexion réussie",
  [AUDIT_EVENTS.AUTH_LOGIN_FAILED]: "Tentative de connexion échouée",
  [AUDIT_EVENTS.AUTH_LOGOUT]: "Déconnexion",
  [AUDIT_EVENTS.AUTH_PASSWORD_CHANGED]: "Mot de passe modifié",
  [AUDIT_EVENTS.AUTH_EMAIL_CHANGE_REQUESTED]:
    "Demande de changement d'email",
  [AUDIT_EVENTS.AUTH_EMAIL_CHANGED]: "Email modifié",
  [AUDIT_EVENTS.AUTH_SESSION_REVOKED]: "Session déconnectée",
  [AUDIT_EVENTS.AUTH_ALL_SESSIONS_REVOKED]:
    "Toutes les autres sessions déconnectées",
  [AUDIT_EVENTS.SECURITY_2FA_ENABLED]:
    "Authentification à deux facteurs activée",
  [AUDIT_EVENTS.SECURITY_2FA_DISABLED]:
    "Authentification à deux facteurs désactivée",
  [AUDIT_EVENTS.SECURITY_2FA_CHALLENGE_SUCCESS]: "Vérification 2FA réussie",
  [AUDIT_EVENTS.SECURITY_2FA_CHALLENGE_FAILED]: "Vérification 2FA échouée",
  [AUDIT_EVENTS.SECURITY_RECOVERY_CODE_USED]:
    "Code de récupération utilisé",
  [AUDIT_EVENTS.PROFILE_UPDATED]: "Profil modifié",
  [AUDIT_EVENTS.PROFILE_DELETED_REQUESTED]:
    "Demande de suppression du compte",
  [AUDIT_EVENTS.PROFILE_DELETED_RESTORED]: "Compte restauré",
  [AUDIT_EVENTS.BILLING_PAYMENT_METHOD_UPDATED]:
    "Moyen de paiement modifié",
  [AUDIT_EVENTS.BILLING_SUBSCRIPTION_CHANGED]: "Abonnement modifié",
  [AUDIT_EVENTS.DATA_EXPORTED]: "Export de données",
};

/**
 * Retourne un libellé humain. Si l'event_type n'est pas dans la map (ex:
 * event ajouté en DB hors AUDIT_EVENTS), retourne le code brut.
 */
export function eventLabel(eventType: string): string {
  return (
    EVENT_LABELS[eventType as AuditEventType] ?? eventType
  );
}
