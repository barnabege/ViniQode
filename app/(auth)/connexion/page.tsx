import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Se connecter",
  description: "Connectez-vous à votre compte ViniQode.",
};

interface PageProps {
  searchParams: { redirectTo?: string; reason?: string };
}

export default function LoginPage({ searchParams }: PageProps) {
  const accountDeleted = searchParams.reason === "account_deleted";

  return (
    <AuthCard
      title="Heureux de vous revoir."
      subtitle={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-accent hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      {accountDeleted && (
        <div
          role="status"
          className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900"
        >
          Votre compte a été supprimé. Vos données seront définitivement
          purgées sous 30 jours. En cas d&apos;erreur, contactez-nous à{" "}
          <a
            href="mailto:contact@viniqode.fr"
            className="font-medium underline"
          >
            contact@viniqode.fr
          </a>
          .
        </div>
      )}
      <LoginForm redirectTo={searchParams.redirectTo} />
    </AuthCard>
  );
}
