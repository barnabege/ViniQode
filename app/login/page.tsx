// app/login/page.tsx
import type { Metadata } from "next";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Se connecter",
  description: "Connectez-vous à votre compte ViniQode.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthSidebar
        title="Heureux de vous revoir."
        reassurances={[
          "Vos cuvées sont synchronisées en temps réel",
          "Vos pages e-label restent accessibles 24/7",
          "Conforme (UE) 2021/2117 garanti",
        ]}
      />
      <main className="flex flex-1 items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
