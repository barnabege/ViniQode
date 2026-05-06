// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { Sidebar, MobileBottomNav } from "@/components/dashboard/Sidebar";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Plan } from "@/lib/database.types";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan: Plan = (profile?.plan as Plan | undefined) ?? "starter";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar plan={plan} />
      <div className="flex flex-1 flex-col pb-20 lg:pb-0">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
