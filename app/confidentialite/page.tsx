import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de ViniQode — traitement des données personnelles, droits RGPD, sous-traitants.",
};

const SECTIONS: { titre: string }[] = [
  { titre: "Responsable du traitement" },
  { titre: "Données collectées" },
  { titre: "Finalités du traitement" },
  { titre: "Base légale" },
  { titre: "Durée de conservation" },
  { titre: "Destinataires des données" },
  { titre: "Sous-traitants (Stripe, Vercel, Supabase, Brevo)" },
  { titre: "Droits des personnes (RGPD)" },
  { titre: "Cookies" },
  { titre: "Contact DPO" },
];

export default function ConfidentialitePage() {
  return (
    <>
      <Navigation />
      <main className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Politique de confidentialité
          </h1>
          <p className="mt-3 text-sm text-muted">
            Dernière mise à jour : [à compléter]
          </p>

          <div
            role="note"
            className="mt-10 rounded-md bg-cream-deep px-5 py-4 text-sm leading-relaxed text-foreground"
          >
            <p>
              📋 Document en cours de finalisation. La politique de
              confidentialité définitive sera publiée prochainement. En cas
              de question, contactez-nous à{" "}
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
            {SECTIONS.map((s) => (
              <section key={s.titre}>
                <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                  {s.titre}
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
