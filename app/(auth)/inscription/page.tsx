import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Créez votre compte ViniQode et générez votre premier e-label QR code conforme.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Créez votre compte."
      subtitle={
        <>
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-accent hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
