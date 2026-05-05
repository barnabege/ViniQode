"use server";

import { headers } from "next/headers";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/auth/schemas";
import { mapSupabaseAuthError } from "@/lib/auth/error-messages";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface ForgotPasswordResult {
  error?: string;
  success?: boolean;
}

export async function forgotPasswordAction(
  values: ForgotPasswordInput,
): Promise<ForgotPasswordResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Email invalide." };
  }

  const supabase = createSupabaseServerClient();
  const origin = getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  );

  if (error) {
    return { error: mapSupabaseAuthError(error) };
  }

  return { success: true };
}

function getOrigin(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;
}
