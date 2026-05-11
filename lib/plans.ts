// lib/plans.ts
//
// Source unique de vérité pour les limites par plan tarifaire.
// Toute logique de quota doit transiter par ce module — pas de
// constante hardcodée ailleurs dans le code.

import type { Plan, Profile } from "@/lib/database.types";

export const PLAN_LIMITS: Record<Plan, { cuvees: number; label: string }> = {
  starter: { cuvees: 3, label: "Starter" },
  essentiel: { cuvees: Infinity, label: "Essentiel" },
  pro: { cuvees: Infinity, label: "Pro" },
};

export interface CuveeQuota {
  plan: Plan;
  planLabel: string;
  limit: number;
  isUnlimited: boolean;
  used: number;
  remaining: number;
  reached: boolean;
}

export function getCuveeQuota(plan: Plan, used: number): CuveeQuota {
  const { cuvees: limit, label } = PLAN_LIMITS[plan];
  const isUnlimited = !Number.isFinite(limit);
  return {
    plan,
    planLabel: label,
    limit,
    isUnlimited,
    used,
    remaining: isUnlimited ? Infinity : Math.max(0, limit - used),
    reached: !isUnlimited && used >= limit,
  };
}

export function canCreateCuvee(plan: Plan, currentCount: number): boolean {
  return !getCuveeQuota(plan, currentCount).reached;
}

/** Lecture sûre du plan depuis un profil — défaut starter si absent/null. */
export function getUserPlanFromProfile(
  profile: Pick<Profile, "plan"> | { plan: Plan | null | undefined } | null,
): Plan {
  return (profile?.plan as Plan | undefined) ?? "starter";
}
