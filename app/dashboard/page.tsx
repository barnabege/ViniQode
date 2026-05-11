// app/dashboard/page.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { CuveeListContainer } from "@/components/dashboard/CuveeListContainer";
import { ConformiteCard } from "@/components/dashboard/ConformiteCard";
import { ListeProblemes } from "@/components/dashboard/ListeProblemes";
import { NewCuveeButton } from "@/components/dashboard/NewCuveeButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveCuveesForUser } from "@/lib/cuvees";
import { analyserConformiteGlobale } from "@/lib/conformite";
import { getCuveeQuota, getUserPlanFromProfile } from "@/lib/plans";
import { cn, formatDateFR } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

export const metadata = { title: "Tableau de bord" };

const DASHBOARD_PREVIEW_LIMIT = 5;

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .is("deleted_at", null)
    .single<Profile>();

  // Le helper getActiveCuveesForUser filtre deleted_at IS NULL et trie par
  // updated_at desc. On récupère tout pour les KPIs, puis on tronque pour
  // l'aperçu.
  const cuvees = await getActiveCuveesForUser(user.id);
  const qrGeneres = cuvees.filter((c) => c.qr_code_url).length;
  const today = formatDateFR(new Date());

  const resultatGlobal = analyserConformiteGlobale(cuvees, {
    email_confirmed_at: user.email_confirmed_at ?? null,
  });

  const plan = getUserPlanFromProfile(profile);
  const quota = getCuveeQuota(plan, cuvees.length);

  const recentCuvees = cuvees.slice(0, DASHBOARD_PREVIEW_LIMIT);
  const hasMore = cuvees.length > DASHBOARD_PREVIEW_LIMIT;

  return (
    <main className="flex-1">
      <header className="border-b border-border bg-background px-6 py-7 sm:px-10 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              Bonjour, {profile?.prenom ?? ""}
            </h1>
            <p className="mt-2 text-sm text-muted">{today}</p>
          </div>
          <NewCuveeButton
            used={quota.used}
            limit={quota.limit}
            planLabel={quota.planLabel}
          />
        </div>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-12">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiQuota
            label="Cuvées"
            used={quota.used}
            limit={quota.limit}
            isUnlimited={quota.isUnlimited}
          />
          <Kpi label="QR codes générés" value={String(qrGeneres)} />
          <Kpi
            label="Scans ce mois"
            value={profile?.plan === "pro" ? "—" : "Pro requis"}
            muted={profile?.plan !== "pro"}
          />
          <ConformiteCard resultat={resultatGlobal} />
        </section>

        <CuveeListContainer
          cuvees={recentCuvees}
          totalCount={cuvees.length}
          emailConfirmedAt={user.email_confirmed_at ?? null}
          footer={
            hasMore ? (
              <Link
                href="/dashboard/cuvees"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Voir toutes mes cuvées
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null
          }
        />

        <ListeProblemes resultat={resultatGlobal} />
      </div>
    </main>
  );
}

interface KpiProps {
  label: string;
  value: string;
  success?: boolean;
  muted?: boolean;
}

function Kpi({ label, value, success, muted }: KpiProps) {
  return (
    <div className="rounded-md border border-border bg-background p-5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p
        className={
          "mt-2 font-serif text-2xl " +
          (success
            ? "text-success"
            : muted
            ? "text-muted"
            : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}

interface KpiQuotaProps {
  label: string;
  used: number;
  limit: number;
  isUnlimited: boolean;
}

function KpiQuota({ label, used, limit, isUnlimited }: KpiQuotaProps) {
  const ratio = isUnlimited ? 0 : Math.min(used / Math.max(limit, 1), 1);
  const barClass =
    ratio >= 1
      ? "bg-error"
      : ratio >= 0.66
      ? "bg-amber-500"
      : "bg-wine";
  return (
    <div className="rounded-md border border-border bg-background p-5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-serif text-2xl text-foreground">
        {used}
        {!isUnlimited && <span className="text-muted"> / {limit}</span>}
      </p>
      {!isUnlimited && (
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-label={`${used} sur ${limit} cuvées créées`}
        >
          <div
            className={cn("h-full transition-all", barClass)}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
