// app/dashboard/page.tsx
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CuveeListContainer } from "@/components/dashboard/CuveeListContainer";
import { ConformiteCard } from "@/components/dashboard/ConformiteCard";
import { ListeProblemes } from "@/components/dashboard/ListeProblemes";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveCuveesForUser } from "@/lib/cuvees";
import { analyserConformiteGlobale } from "@/lib/conformite";
import { formatDateFR } from "@/lib/utils";
import type { Profile } from "@/lib/database.types";

export const metadata = { title: "Tableau de bord" };

const FREE_LIMIT = 3;
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
  const cuveesActives = cuvees.filter((c) => c.statut === "actif");
  const qrGeneres = cuvees.filter((c) => c.qr_code_url).length;
  const today = formatDateFR(new Date());

  const resultatGlobal = analyserConformiteGlobale(cuvees, {
    email_confirmed_at: user.email_confirmed_at ?? null,
  });

  const isStarterAtLimit =
    (profile?.plan ?? "starter") === "starter" && cuvees.length >= FREE_LIMIT;

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
          <Button asChild>
            <Link href="/dashboard/cuvees/new">
              <Plus className="h-4 w-4" />
              Nouvelle cuvée
            </Link>
          </Button>
        </div>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-12">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Cuvées actives" value={String(cuveesActives.length)} />
          <Kpi label="QR codes générés" value={String(qrGeneres)} />
          <Kpi
            label="Scans ce mois"
            value={profile?.plan === "pro" ? "—" : "Pro requis"}
            muted={profile?.plan !== "pro"}
          />
          <ConformiteCard resultat={resultatGlobal} />
        </section>

        {isStarterAtLimit && (
          <section className="mt-8 flex flex-col gap-4 rounded-md border border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              Vous avez atteint la limite de 3 cuvées gratuites. Passez à
              l'offre Essentielle pour des QR codes illimités.
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/parametres/abonnement">
                Passer à Essentiel — 99 €/an
              </Link>
            </Button>
          </section>
        )}

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
