// app/register/page.tsx
import type { Metadata } from "next";
import { AuthSidebar } from "@/components/auth/AuthSidebar";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Créer mon compte",
  description:
    "Créez votre compte ViniQode et générez votre premier e-label QR code conforme en 10 minutes.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      <AuthSidebar
        title="Créez votre premier e-label en 10 minutes."
        reassurances={[
          "3 cuvées gratuites sans limite de temps",
          "Aucune carte bancaire requise",
          "Conforme (UE) 2021/2117 garanti",
        ]}
        quote={{
          text:
            "En une matinée, j'ai mis tous mes vins en conformité. Je suis tranquille pour les contrôles.",
          author: "Hélène M., vigneronne en Saumur (8 ha)",
        }}
      />
      <main className="flex flex-1 items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
