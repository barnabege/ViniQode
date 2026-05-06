import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Se connecter",
  description: "Connectez-vous à votre compte ViniQode.",
};

interface PageProps {
  searchParams: { redirectTo?: string };
}

export default function LoginPage({ searchParams }: PageProps) {
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
      <LoginForm redirectTo={searchParams.redirectTo} />
    </AuthCard>
  );
}
