// app/dashboard/parametres/abonnement/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import {
  Check,
  ChevronRight,
  Globe,
  Lock,
  ShieldCheck,
  Wine,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Plan, Profile } from "@/lib/database.types";
import { UpgradeButton } from "@/components/dashboard/abonnement/UpgradeButton";
import { AbonnementFAQ } from "@/components/dashboard/abonnement/AbonnementFAQ";

export const metadata = { title: "Abonnement" };

// TODO: ajouter toggle mensuel/annuel si demandé plus tard. V1 = annuel seul.

type PlanKey = Plan | "business";

interface PlanDef {
  key: PlanKey;
  nom: string;
  prix: string;
  prixUnite?: string;
  sousPrix: string;
  features: string[];
  cta: { label: string; variant: "primary" | "outline" };
  mailto?: string;
}

const PLANS: PlanDef[] = [
  {
    key: "starter",
    nom: "Starter",
    prix: "Gratuit",
    sousPrix: "Pour découvrir",
    features: [
      "3 cuvées maximum",
      "E-label hébergée 10 ans",
      "QR code SVG + PNG 300 DPI",
      "Mises à jour illimitées",
      "Conformité (UE) 2021/2117",
    ],
    cta: { label: "Plan gratuit", variant: "outline" },
  },
  {
    key: "essentiel",
    nom: "Essentiel",
    prix: "99 €",
    prixUnite: "/ an",
    sousPrix: "Soit 8,25 €/mois",
    features: [
      "Cuvées illimitées",
      "Tout le plan Starter",
      "Multilingue 24 langues UE",
      "Support sous 48h",
      "Export PDF basique",
    ],
    cta: { label: "Passer à Essentiel", variant: "primary" },
  },
  {
    key: "pro",
    nom: "Pro",
    prix: "149 €",
    prixUnite: "/ an",
    sousPrix: "Soit 12,42 €/mois",
    features: [
      "Tout le plan Essentiel",
      "Analytics scans détaillés",
      "Export PDF avancé",
      "Support prioritaire 24h",
      "Accès anticipé nouvelles features",
    ],
    cta: { label: "Passer à Pro", variant: "outline" },
  },
  {
    key: "business",
    nom: "Business",
    prix: "Sur devis",
    sousPrix: "Pour les coopératives et négociants",
    features: [
      "Tout le plan Pro",
      "Multi-utilisateurs",
      "API REST",
      "SLA garanti 99,9 %",
      "Account manager dédié",
    ],
    cta: { label: "Nous contacter", variant: "outline" },
    mailto: "business@viniqode.fr",
  },
];

export default async function AbonnementPage() {
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

  if (!profile) redirect("/connexion");

  const currentPlan: Plan = profile.plan;

  return (
    <main className="flex-1">
      <header className="bg-background px-6 py-7 sm:px-10 sm:py-8">
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1.5 text-xs text-muted"
        >
          <Link href="/dashboard/parametres" className="hover:text-foreground">
            Paramètres
          </Link>
          <ChevronRight className="h-3 w-3 text-subtle" aria-hidden />
          <span className="text-foreground">Abonnement</span>
        </nav>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Choisissez votre offre
        </h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Tous les plans incluent l'hébergement pérenne 10 ans et la
          conformité (UE) 2021/2117 garantie.
        </p>
      </header>

      <div className="px-6 pb-16 pt-2 sm:px-10 sm:pb-20">
        <section
          aria-label="Comparatif des offres"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PLANS.map((plan) => {
            const isCurrent =
              plan.key !== "business" && plan.key === currentPlan;
            const isEssentiel = plan.key === "essentiel";

            return (
              <article
                key={plan.key}
                className={
                  "relative flex flex-col rounded-lg border bg-background p-6 transition-colors " +
                  (isEssentiel
                    ? "order-first border-[1.5px] border-wine lg:order-none"
                    : "border-border hover:border-subtle")
                }
              >
                {(isEssentiel || isCurrent) && (
                  <div className="absolute -top-3 left-6 flex gap-2">
                    {isEssentiel && (
                      <span className="inline-flex items-center rounded-sm bg-wine px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-background">
                        Recommandé
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center rounded-sm border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-muted">
                        Plan actuel
                      </span>
                    )}
                  </div>
                )}

                <h2 className="font-serif text-2xl text-foreground">
                  {plan.nom}
                </h2>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl text-foreground">
                    {plan.prix}
                  </span>
                  {plan.prixUnite && (
                    <span className="text-sm text-muted">{plan.prixUnite}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">{plan.sousPrix}</p>

                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
                        aria-hidden
                      />
                      <span
                        className={
                          isEssentiel && i === 0
                            ? "font-medium text-foreground"
                            : "text-foreground"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {isCurrent ? (
                    <Button block variant="secondary" disabled>
                      Plan actuel
                    </Button>
                  ) : plan.mailto ? (
                    <Button
                      asChild
                      block
                      variant={plan.cta.variant}
                      aria-label={`${plan.cta.label} — équipe Business`}
                    >
                      <a href={`mailto:${plan.mailto}`}>{plan.cta.label}</a>
                    </Button>
                  ) : plan.key === "starter" ? (
                    <Button
                      block
                      variant="secondary"
                      disabled
                      aria-label="Plan Starter — gratuit, déjà disponible sans abonnement"
                    >
                      Plan gratuit
                    </Button>
                  ) : plan.key === "essentiel" || plan.key === "pro" ? (
                    <UpgradeButton
                      plan={plan.key}
                      label={plan.cta.label}
                      variant={plan.cta.variant}
                    />
                  ) : null}

                  {isEssentiel && !isCurrent && (
                    <p className="mt-3 text-center text-[11px] text-muted">
                      Sans engagement · Résiliable à tout moment
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            Pourquoi passer à Essentiel ?
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <PourquoiItem
              icon={<Wine className="h-5 w-5 text-wine" />}
              title="Cuvées illimitées"
              body="Créez autant d'e-labels que votre gamme l'exige, sans plafond ni surcoût."
            />
            <PourquoiItem
              icon={<Globe className="h-5 w-5 text-wine" />}
              title="24 langues UE"
              body="Traduction automatique de vos étiquettes pour toucher tous les marchés européens."
            />
            <PourquoiItem
              icon={<ShieldCheck className="h-5 w-5 text-wine" />}
              title="Conformité garantie 10 ans"
              body="Hébergement pérenne et mises à jour conformes au règlement (UE) 2021/2117."
            />
          </div>
        </section>

        <section className="mt-20 max-w-3xl">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            Questions fréquentes
          </h2>
          <div className="mt-6">
            <AbonnementFAQ />
          </div>
        </section>

        <footer className="mt-20 border-t border-border pt-8 text-center">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            <span>Paiement sécurisé par Stripe</span>
            <span aria-hidden>·</span>
            <span>Données hébergées en France</span>
            <span aria-hidden>·</span>
            <span>RGPD-natif, sans publicité, sans tracking</span>
          </p>
        </footer>
      </div>

      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{ duration: 4000 }}
      />
    </main>
  );
}

function PourquoiItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-surface">
        {icon}
      </div>
      <h3 className="mt-4 font-serif text-lg text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
