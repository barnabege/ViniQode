import type { AuthError } from "@supabase/supabase-js";

export function mapSupabaseAuthError(error: AuthError | null): string {
  if (!error) return "Une erreur est survenue. Veuillez réessayer.";

  const code = error.code;
  const status = error.status;

  if (code === "invalid_credentials") {
    return "Email ou mot de passe incorrect.";
  }
  if (code === "email_not_confirmed") {
    return "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.";
  }
  if (code === "user_already_exists" || code === "email_exists") {
    return "Un compte existe déjà avec cet email. Connectez-vous ou utilisez « Mot de passe oublié ».";
  }
  if (code === "weak_password") {
    return "Mot de passe trop faible. Utilisez au moins 8 caractères, une majuscule et un chiffre.";
  }
  if (code === "over_email_send_rate_limit" || status === 429) {
    return "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.";
  }
  if (code === "user_not_found") {
    return "Aucun compte n'est associé à cet email.";
  }
  if (code === "validation_failed") {
    return "Les informations saisies sont invalides.";
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}
