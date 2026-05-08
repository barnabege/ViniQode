// app/dashboard/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CuveeCard } from "@/components/dashboard/CuveeCard";
import { ConformiteCard } from "@/components/dashboard/ConformiteCard";
import { ListeProblemes } from "@/components/dashboard/ListeProblemes";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { analyserConformiteGlobale } from "@/lib/conformite";
import { formatDateFR } from "@/lib/utils";
import type { Cuvee, Profile } from "@/lib/database.types";

export const metadata = { title: "Tableau de bord" };

const FREE_LIMIT = 3;

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

  const { data: cuveesData } = await supabase
    .from("cuvees")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cuvees: Cuvee[] = cuveesData ?? [];
  const cuveesActives = cuvees.filter((c) => c.statut === "actif");
  const qrGeneres = cuvees.filter((c) => c.qr_code_url).length;
  const today = formatDateFR(new Date());

  const resultatGlobal = analyserConformiteGlobale(cuvees, {
    email_confirmed_at: user.email_confirmed_at ?? null,
  });

  const isStarterAtLimit =
    (profile?.plan ?? "starter") === "starter" && cuvees.length >= FREE_LIMIT;

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

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">Mes cuvées</h2>
            {cuvees.length > 0 && (
              <Badge variant="neutral">
                {cuvees.length} cuvée{cuvees.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {cuvees.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {cuvees.map((c) => (
                <CuveeCard
                  key={c.id}
                  cuvee={c}
                  emailConfirmedAt={user.email_confirmed_at ?? null}
                />
              ))}
            </div>
          )}
        </section>

        <ListeProblemes resultat={resultatGlobal} email={user.email ?? ""} />
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
            ? "text-accent"
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

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-background p-12 text-center">
      <p className="font-serif text-lg text-foreground">
        Vous n'avez pas encore de cuvée.
      </p>
      <p className="mt-2 text-sm text-muted">
        Créez votre première e-label en 10 minutes.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/cuvees/new">
          <Plus className="h-4 w-4" />
          Créer ma première cuvée
        </Link>
      </Button>
    </div>
  );
}
