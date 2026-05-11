import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description:
    "Conditions Générales de Vente de ViniQode — service e-label conforme au règlement (UE) 2021/2117.",
};

const ARTICLES: { titre: string }[] = [
  { titre: "Article 1 — Objet" },
  { titre: "Article 2 — Définitions" },
  { titre: "Article 3 — Acceptation des CGV" },
  { titre: "Article 4 — Description des services" },
  { titre: "Article 5 — Prix et modalités de paiement" },
  { titre: "Article 6 — Durée et résiliation" },
  {
    titre:
      "Article 7 — Engagement de pérennité (hébergement 10 ans même après résiliation)",
  },
  { titre: "Article 8 — Obligations de ViniQode" },
  { titre: "Article 9 — Obligations du client" },
  { titre: "Article 10 — Propriété intellectuelle" },
  { titre: "Article 11 — Données personnelles" },
  { titre: "Article 12 — Responsabilité" },
  { titre: "Article 13 — Force majeure" },
  { titre: "Article 14 — Médiation et litiges" },
  { titre: "Article 15 — Loi applicable" },
];

export default function CgvPage() {
  return (
    <>
      <Navigation />
      <main className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Conditions Générales de Vente
          </h1>
          <p className="mt-3 text-sm text-muted">
            Dernière mise à jour : [à compléter]
          </p>

          <div
            role="note"
            className="mt-10 rounded-md bg-cream-deep px-5 py-4 text-sm leading-relaxed text-foreground"
          >
            <p>
              📋 Document en cours de finalisation. Les Conditions Générales
              de Vente définitives seront publiées prochainement. En cas de
              question, contactez-nous à{" "}
              <Link
                href="mailto:support@viniqode.fr"
                className="text-accent hover:underline"
              >
                support@viniqode.fr
              </Link>
              .
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {ARTICLES.map((a) => (
              <section key={a.titre}>
                <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                  {a.titre}
                </h2>
                <p className="mt-3 text-sm italic leading-relaxed text-muted">
                  Contenu à compléter.
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
