// app/dashboard/cuvees/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveCuveesForUser } from "@/lib/cuvees";
import { CuveesPageClient } from "./_components/CuveesPageClient";

export const metadata = { title: "Mes cuvées" };

export default async function CuveesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const cuvees = await getActiveCuveesForUser(user.id);

  return (
    <main className="flex-1">
      <header className="border-b border-border bg-background px-6 py-7 sm:px-10 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Mes cuvées
            </h1>
            {cuvees.length > 0 && (
              <Badge variant="neutral">
                {cuvees.length} cuvée{cuvees.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Button asChild>
            <Link href="/dashboard/cuvees/new">
              <Plus className="h-4 w-4" />
              Nouvelle cuvée
            </Link>
          </Button>
        </div>
      </header>

      <CuveesPageClient
        cuvees={cuvees}
        emailConfirmedAt={user.email_confirmed_at ?? null}
      />
    </main>
  );
}
