// app/dashboard/analytics/page.tsx
//
// Page Analytics MVP. Server Component qui orchestre les queries Supabase
// agrégées puis répartit les données dans les sous-composants. Dépend des
// cookies auth + de searchParams.period → forcément dynamique.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CuveesRanking } from "./_components/CuveesRanking";
import { GeoBreakdown } from "./_components/GeoBreakdown";
import { KpiCards } from "./_components/KpiCards";
import { PeriodSelector } from "./_components/PeriodSelector";
import { ScansChart } from "./_components/ScansChart";
import { parsePeriod } from "./_lib/period";
import { fetchAnalytics } from "./_lib/queries";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { period?: string };
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const period = parsePeriod(searchParams.period);
  const data = await fetchAnalytics(user.id, period);
  const isEmpty = data.totalScans === 0;

  return (
    <main className="flex-1">
      <header className="border-b border-border bg-background px-6 py-7 sm:px-10 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Analytics
            </h1>
            <p className="mt-2 text-sm text-muted">
              Comprenez comment vos consommateurs interagissent avec vos QR
              codes.
            </p>
          </div>
          <PeriodSelector current={period} />
        </div>
      </header>

      <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-12">
        <KpiCards data={data} />

        {isEmpty && (
          <p className="rounded-md border border-border bg-surface px-5 py-4 text-sm text-muted">
            Aucun scan sur cette période. Vos cuvées sont-elles bien en
            circulation&nbsp;?
          </p>
        )}

        <section className="rounded-md border border-border bg-background p-6">
          <h2 className="font-serif text-xl text-foreground">
            Scans dans le temps
          </h2>
          <div className="mt-4">
            <ScansChart
              data={data.perBucket}
              granularity={data.granularity}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <CuveesRanking data={data} />
          <GeoBreakdown data={data} />
        </section>
      </div>
    </main>
  );
}
