import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez votre mot de passe ViniQode.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié ?"
      subtitle="Saisissez votre email — nous vous enverrons un lien pour le réinitialiser."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
