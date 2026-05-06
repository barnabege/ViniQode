// app/dashboard/layout.tsx
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
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase.from("cuvees").select("*").eq("user_id", user.id),
  ]);

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
      </div>
      <MobileBottomNav />
    </div>
  );
}
