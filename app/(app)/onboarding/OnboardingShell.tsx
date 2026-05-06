"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { StepIndicator, type Step } from "@/components/ui/StepIndicator";

const STEPS: Step[] = [
  { label: "Bienvenue" },
  { label: "Domaine" },
  { label: "Cuvée" },
  { label: "QR code" },
];

function computeStepIndex(pathname: string): number {
  if (pathname.startsWith("/onboarding/bienvenue")) return 0;
  if (pathname.startsWith("/onboarding/domaine")) return 1;
  if (pathname.startsWith("/onboarding/premiere-cuvee")) return 2;
  if (
    pathname.startsWith("/onboarding/felicitations") ||
    pathname.startsWith("/onboarding/apercu")
  )
    return 3;
  return 0;
}

export interface OnboardingShellProps {
  children: React.ReactNode;
  emailConfirmed: boolean;
}

export function OnboardingShell({
  children,
  emailConfirmed,
}: OnboardingShellProps) {
  const pathname = usePathname() ?? "";
  const current = computeStepIndex(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-background">
        <div className="container-page flex h-16 items-center lg:h-20">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-foreground lg:text-3xl"
          >
            ViniQode
          </Link>
        </div>
        <div className="container-page pb-4 pt-1 sm:pb-6 sm:pt-2">
          <StepIndicator steps={STEPS} current={current} />
        </div>
      </header>

      {!emailConfirmed && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 text-amber-900"
        >
          <div className="container-page flex items-start gap-3 py-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>
              <strong className="font-semibold">Confirmez votre email</strong>{" "}
              — Vérifiez votre boîte de réception. Vous pourrez publier votre
              QR code dès que votre adresse sera confirmée.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className="container-page py-10 sm:py-14">{children}</div>
      </main>
    </div>
  );
}
