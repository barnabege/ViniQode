import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { OnboardingShell } from "./OnboardingShell";

export const metadata = { title: "Onboarding · ViniQode" };

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?redirectTo=/onboarding/bienvenue");
  }

  const emailConfirmed = Boolean(user.email_confirmed_at);

  return (
    <OnboardingShell emailConfirmed={emailConfirmed}>{children}</OnboardingShell>
  );
}
