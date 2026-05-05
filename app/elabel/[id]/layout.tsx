// app/elabel/[id]/layout.tsx
//
// Layout dédié e-label : épuré, sans nav globale, sans tracking.
// Métadonnées : noindex strict.

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function ELabelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-background">{children}</div>;
}
