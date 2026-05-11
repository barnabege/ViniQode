// app/dashboard/parametres/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AuditLog, Profile } from "@/lib/database.types";
import { ParametresShell } from "@/components/dashboard/settings/ParametresShell";
import {
  decodeSessionIdFromJwt,
  listUserSessions,
} from "@/lib/audit/sessions";

export const metadata = { title: "Paramètres" };

const AUDIT_PAGE_SIZE = 50;

export default async function ParametresPage() {
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

  // ── Données pour l'onglet Sécurité ──────────────────────────────────
  const [sessionsRes, mfaRes, sessionRes, auditRes] = await Promise.all([
    listUserSessions(user.id),
    supabase.auth.mfa.listFactors(),
    supabase.auth.getSession(),
    supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(AUDIT_PAGE_SIZE + 1),
  ]);

  const currentJwt = sessionRes.data.session?.access_token ?? null;
  const currentSessionId = currentJwt
    ? decodeSessionIdFromJwt(currentJwt)
    : null;

  const mfaFactors = mfaRes.data?.totp ?? [];
  const mfaEnrolled = mfaFactors.some((f) => f.status === "verified");

  const auditRows = (auditRes.data ?? []) as AuditLog[];
  const initialAuditLogs = auditRows.slice(0, AUDIT_PAGE_SIZE);
  const initialAuditHasMore = auditRows.length > AUDIT_PAGE_SIZE;

  // Le User Supabase peut exposer un `new_email` quand un changement est en
  // attente de confirmation (champ optionnel selon la version SDK).
  const pendingNewEmail =
    (user as unknown as { new_email?: string | null }).new_email ?? null;

  return (
    <main className="flex-1">
      <header className="bg-background px-6 py-7 sm:px-10 sm:py-8">
        <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Paramètres
        </h1>
        <p className="mt-2 text-sm text-muted">
          Gérez votre compte, vos informations professionnelles et vos
          préférences.
        </p>
      </header>

      <ParametresShell
        profile={profile}
        email={user.email ?? ""}
        userId={user.id}
        pendingNewEmail={pendingNewEmail}
        sessions={sessionsRes}
        currentSessionId={currentSessionId}
        mfaEnrolled={mfaEnrolled}
        initialAuditLogs={initialAuditLogs}
        initialAuditHasMore={initialAuditHasMore}
      />
    </main>
  );
}
