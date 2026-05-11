// app/elabel/[lang]/layout.tsx
//
// Layout du sous-arbre e-label : valide la locale en URL, ajuste
// dynamiquement <html lang>, applique noindex strict.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { HtmlLangSetter } from "./HtmlLangSetter";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ELabelLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isLocale(params.lang)) notFound();

  return (
    <div className="bg-background">
      <HtmlLangSetter lang={params.lang} />
      {children}
    </div>
  );
}
