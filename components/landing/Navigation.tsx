// components/landing/Navigation.tsx
//
// Server Component : récupère la session côté serveur (sans flash) et
// délègue le rendu au Client Component qui gère le sticky background sur
// scroll, le menu mobile burger et le dropdown utilisateur.
//
// Coût perf : `getUser()` ajoute ~50ms à chaque pageview de la landing
// (pas de cache statique). Acceptable en P1 — voir MIGRATION_NOTES pour
// l'optimisation P2 (cookie HTTP-only signé contenant un état "logged-in").

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  NavigationClient,
  type NavigationProfile,
  type NavigationUser,
} from "./NavigationClient";

export async function Navigation() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: NavigationProfile | null = null;
  let navUser: NavigationUser | null = null;

  if (user) {
    navUser = { id: user.id, email: user.email ?? null };

    const { data } = await supabase
      .from("profiles")
      .select("id, nom_domaine, logo_url, prenom, nom")
      .eq("id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (data) {
      profile = {
        id: data.id,
        nom_domaine: data.nom_domaine,
        logo_url: data.logo_url,
        prenom: data.prenom,
        nom: data.nom,
      };
    }
    // Si profile null (compte sans profile, edge case), on affiche quand
    // même le menu connecté avec fallback sur l'email — décision brief.
  }

  return <NavigationClient user={navUser} profile={profile} />;
}
