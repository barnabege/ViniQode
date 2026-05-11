// app/dashboard/cuvees/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CuveeListContainer } from "@/components/dashboard/CuveeListContainer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Cuvee } from "@/lib/database.types";

export const metadata = { title: "Mes cuvées" };

export default async function CuveesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: cuveesData } = await supabase
    .from("cuvees")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cuvees: Cuvee[] = cuveesData ?? [];

  return (
    <main className="flex-1">
      <header className="border-b border-border bg-background px-6 py-7 sm:px-10 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Mes cuvées
            </h1>
            <p className="mt-2 text-sm text-muted">
              Gérez l'ensemble de vos cuvées et de leurs e-labels.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/cuvees/new">
              <Plus className="h-4 w-4" />
              Nouvelle cuvée
            </Link>
          </Button>
        </div>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-12">
        <CuveeListContainer
          cuvees={cuvees}
          emailConfirmedAt={user.email_confirmed_at ?? null}
          title={null}
        />
      </div>
    </main>
  );
}
