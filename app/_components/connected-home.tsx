// app/_components/connected-home.tsx
//
// Home connectée — rendue côté serveur quand un utilisateur authentifié
// visite `/`. Toutes les requêtes sont parallélisées avec Promise.all pour
// minimiser le TTFB.

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getContextualSuggestion,
  getDomainStats,
  getRecentActivity,
  getSuggestionContext,
} from "@/lib/home-data";
import type { Plan, Profile } from "@/lib/database.types";
import { ConformiteBadge, KpiBadgeCard, KpiCard } from "./connected-home/KpiCard";
import { QuickActions } from "./connected-home/QuickActions";
import { RecentActivity } from "./connected-home/RecentActivity";
import { ContextualSuggestion } from "./connected-home/ContextualSuggestion";

function formatLimit(limit: number | null): string {
  return limit === null ? "illimité" : String(limit);
}

function greetingName(profile: Profile | null, user: User): string {
  if (profile?.nom_domaine) return profile.nom_domaine;
  const email = user.email ?? "";
  const localPart = email.split("@")[0] ?? "";
  return localPart || "vigneron";
}

export async function ConnectedHome({ user }: { user: User }) {
  const supabase = createSupabaseServerClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle<Profile>();

  const profile = profileData ?? null;
  const plan: Plan = profile?.plan ?? "starter";

  const [stats, activity] = await Promise.all([
    getDomainStats(supabase, user.id, plan),
    getRecentActivity(supabase, user.id),
  ]);

  const suggestionCtx = await getSuggestionContext(
    supabase,
    user.id,
    plan,
    stats.cuvees_actives,
  );
  const suggestion = getContextualSuggestion(suggestionCtx);

  const greet = greetingName(profile, user);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <section>
        <h1 className="font-serif text-3xl text-foreground">Bonjour {greet}</h1>
        <p className="mt-2 text-muted">
          Voici l'état de votre conformité aujourd'hui.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            label="Cuvées actives"
            value={`${stats.cuvees_actives} / ${formatLimit(stats.cuvees_limit)}`}
          />
          <KpiCard
            label="Scans · 30 derniers jours"
            value={stats.scans_30j.toLocaleString("fr-FR")}
          />
          <KpiBadgeCard
            label="Statut conformité"
            href={
              stats.conformite === "incomplet"
                ? "/dashboard/cuvees?filter=incomplete"
                : undefined
            }
            badge={
              <ConformiteBadge
                statut={stats.conformite}
                count={stats.cuvees_a_completer}
              />
            }
          />
        </div>
      </section>

      <QuickActions />

      <RecentActivity events={activity} />

      {suggestion && <ContextualSuggestion suggestion={suggestion} />}
    </main>
  );
}
