import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DomaineForm } from "./DomaineForm";

export const metadata = { title: "Votre domaine · ViniQode" };

export default async function DomainePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom_domaine, region")
    .eq("id", user!.id)
    .single<{ nom_domaine: string | null; region: string | null }>();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/onboarding/bienvenue"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
        Votre domaine.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Ces informations apparaîtront sur la page e-label scannée par vos
        clients.
      </p>

      <div className="mt-8">
        <DomaineForm
          defaults={{
            raison_sociale: profile?.nom_domaine ?? "",
            region: profile?.region ?? "Autre",
          }}
        />
      </div>
    </div>
  );
}
