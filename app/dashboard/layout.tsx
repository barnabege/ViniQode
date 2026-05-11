// app/dashboard/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { AlertBanner } from "@/components/AlertBanner";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { analyserConformiteGlobale } from "@/lib/conformite";
import type { Cuvee, Plan } from "@/lib/database.types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const [profileRes, cuveesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, deleted_at")
      .eq("id", user.id)
      .single(),
    supabase.from("cuvees").select("*").eq("user_id", user.id),
  ]);

  // Hard exit pour les comptes soft-deleted (RGPD article 17).
  if (profileRes.data?.deleted_at) {
    await supabase.auth.signOut();
    redirect("/connexion?reason=account_deleted");
  }

  const plan: Plan = (profileRes.data?.plan as Plan | undefined) ?? "starter";
  const cuvees: Cuvee[] = cuveesRes.data ?? [];

  const resultat = analyserConformiteGlobale(cuvees, {
    email_confirmed_at: user.email_confirmed_at ?? null,
  });

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar plan={plan} />
      <div className="flex flex-1 flex-col pb-20 lg:pb-0">
        <AlertBanner
          emailConfirmed={Boolean(user.email_confirmed_at)}
          email={user.email ?? ""}
          nbProblemes={resultat.cuvees_problematiques.length}
        />
        {children}
        <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border/60 px-6 pb-8 pt-6 text-xs text-muted">
          <span>ViniQode © {new Date().getFullYear()}</span>
          <span aria-hidden>·</span>
          <Link href="/cgv" className="hover:text-foreground">
            CGV
          </Link>
          <span aria-hidden>·</span>
          <Link href="/confidentialite" className="hover:text-foreground">
            Confidentialité
          </Link>
          <span aria-hidden>·</span>
          <Link href="/mentions-legales" className="hover:text-foreground">
            Mentions légales
          </Link>
          <span aria-hidden>·</span>
          <Link
            href="mailto:support@viniqode.fr"
            className="hover:text-foreground"
          >
            Contact
          </Link>
        </footer>
      </div>
      <MobileBottomNav />
    </div>
  );
}
