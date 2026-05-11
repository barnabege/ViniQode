// app/dashboard/cuvees/page.tsx
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { NewCuveeButton } from "@/components/dashboard/NewCuveeButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveCuveesForUser } from "@/lib/cuvees";
import { getCuveeQuota, getUserPlanFromProfile } from "@/lib/plans";
import type { Plan } from "@/lib/database.types";
import { CuveesPageClient } from "./_components/CuveesPageClient";

export const metadata = { title: "Mes cuvées" };

export default async function CuveesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [cuvees, profileRes] = await Promise.all([
    getActiveCuveesForUser(user.id),
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single<{ plan: Plan | null }>(),
  ]);

  const plan = getUserPlanFromProfile(profileRes.data);
  const quota = getCuveeQuota(plan, cuvees.length);

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
                {!quota.isUnlimited && (
                  <span className="ml-1 opacity-70">
                    · {quota.used}/{quota.limit} {quota.planLabel}
                  </span>
                )}
              </Badge>
            )}
          </div>
          <NewCuveeButton
            used={quota.used}
            limit={quota.limit}
            planLabel={quota.planLabel}
          />
        </div>
      </header>

      <CuveesPageClient
        cuvees={cuvees}
        emailConfirmedAt={user.email_confirmed_at ?? null}
      />
    </main>
  );
}
