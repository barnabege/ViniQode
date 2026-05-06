"use server";

import { redirect } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { mapSupabaseAuthError } from "@/lib/auth/error-messages";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
    return { error: mapSupabaseAuthError(error) };
  }

  redirect(safeRedirect(redirectTo));
}

function safeRedirect(target: string | undefined): string {
  if (!target) return "/dashboard";
  if (!target.startsWith("/") || target.startsWith("//")) return "/dashboard";
  return target;
}
