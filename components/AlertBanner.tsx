"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { RenvoyerEmailButton } from "@/components/dashboard/RenvoyerEmailButton";

export interface AlertBannerProps {
  emailConfirmed: boolean;
  email: string;
  nbProblemes: number;
}

export function AlertBanner({
  emailConfirmed,
  email,
  nbProblemes,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  let content: React.ReactNode = null;

  if (!emailConfirmed) {
    content = (
      <>
        <p className="text-sm text-orange-800">
          Confirmez votre email pour activer vos QR codes en production.
        </p>
        <RenvoyerEmailButton email={email} variant="link" />
      </>
    );
  } else if (nbProblemes > 0) {
    content = (
      <>
        <p className="text-sm text-orange-800">
          {nbProblemes} cuvée{nbProblemes > 1 ? "s" : ""} à compléter pour être
          conforme.
        </p>
        <Link
          href="/dashboard#liste-problemes"
          className="inline-flex items-center gap-1 text-sm font-bold text-orange-800 underline hover:text-orange-900"
        >
          Voir les détails
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </>
    );
  } else {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 border-b border-orange-200 bg-orange-50">
      <div className="flex items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          {content}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fermer le bandeau"
          className="shrink-0 text-orange-700 transition-colors hover:text-orange-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
