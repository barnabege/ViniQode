"use server";

import { headers } from "next/headers";
import { signupSchema, type SignupInput } from "@/lib/auth/schemas";
import { mapSupabaseAuthError } from "@/lib/auth/error-messages";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface SignupResult {
  error?: string;
  needsEmailConfirmation?: boolean;
}

export async function signupAction(values: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Les informations saisies sont invalides." };
  }

  const supabase = createSupabaseServerClient();
  const origin = getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
      },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: mapSupabaseAuthError(error) };
  }

  // Si la confirmation email est activée, identities est vide ou session null
  const needsEmailConfirmation = !data.session;
  return { needsEmailConfirmation };
}

function getOrigin(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;
}
