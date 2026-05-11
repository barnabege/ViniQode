// app/dashboard/cuvees/[id]/modifier/page.tsx
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveCuveeById } from "@/lib/cuvees";
import { CuveeWizard } from "../../new/CuveeWizard";

export const metadata = { title: "Modifier la cuvée" };

interface PageProps {
  params: { id: string };
}

export default async function EditCuveePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const existing = await getActiveCuveeById(user.id, params.id);
  if (!existing) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom_domaine")
    .eq("id", user.id)
    .is("deleted_at", null)
    .single<{ nom_domaine: string | null }>();

  return (
    <main className="flex-1 px-6 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
            Modifier la cuvée {existing.nom}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Vos modifications peuvent être sauvegardées à tout moment. Le QR
            code reste valide.
          </p>
        </header>
        <CuveeWizard
          domaine={profile?.nom_domaine ?? "Votre domaine"}
          existingCuvee={existing}
        />
      </div>
    </main>
  );
}
