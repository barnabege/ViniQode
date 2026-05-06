// app/dashboard/cuvees/new/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CuveeWizard } from "./CuveeWizard";
import type { Cuvee } from "@/lib/database.types";

export const metadata = { title: "Nouvelle cuvée" };

interface PageProps {
  searchParams: { id?: string };
}

export default async function NewCuveePage({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom_domaine")
    .eq("id", user.id)
    .single<{ nom_domaine: string | null }>();

  let existing: Cuvee | null = null;
  if (searchParams.id) {
    const { data } = await supabase
      .from("cuvees")
      .select("*")
      .eq("id", searchParams.id)
      .eq("user_id", user.id)
      .single<Cuvee>();
    existing = data ?? null;
  }

  const isEdit = Boolean(existing);
  const titre = isEdit
    ? existing?.nom
      ? `Modifier la cuvée ${existing.nom}`
      : "Modifier la cuvée"
    : "Nouvelle cuvée";

  return (
    <main className="flex-1 px-6 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
            {titre}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEdit
              ? "Vos modifications peuvent être sauvegardées à tout moment. Le QR code reste valide."
              : "Renseignez votre cuvée en 4 étapes pour générer son e-label conforme."}
          </p>
        </header>
        <CuveeWizard
          userId={user.id}
          domaine={profile?.nom_domaine ?? "Votre domaine"}
          existingCuvee={existing}
        />
      </div>
    </main>
  );
}
