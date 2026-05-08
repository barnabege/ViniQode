// app/(auth)/connexion/mfa/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { MfaForm } from "./MfaForm";

export const metadata: Metadata = {
  title: "Vérification 2FA",
  description: "Saisissez votre code d'authentification à deux facteurs.",
};

interface PageProps {
  searchParams: { redirectTo?: string };
}

export default async function MfaPage({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const hasVerifiedFactor = (factors?.totp ?? []).some(
    (f) => f.status === "verified",
  );
  if (!hasVerifiedFactor) {
    // Pas de 2FA activé : on n'a rien à challenger, on file vers le dashboard.
    redirect(searchParams.redirectTo ?? "/dashboard");
  }

  return (
    <AuthCard
      title="Vérification à deux facteurs"
      subtitle="Saisissez le code à 6 chiffres affiché dans votre application d'authentification."
    >
      <MfaForm redirectTo={searchParams.redirectTo} />
    </AuthCard>
  );
}
