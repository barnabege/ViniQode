import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site ViniQode.",
};

const SECTIONS: { titre: string }[] = [
  { titre: "Éditeur du site" },
  { titre: "Hébergeur" },
  { titre: "Directeur de la publication" },
  { titre: "Contact" },
  { titre: "Propriété intellectuelle" },
  { titre: "Crédits" },
];

export default function MentionsLegalesPage() {
  return (
    <>
      <Navigation />
      <main className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Mentions légales
          </h1>
          <p className="mt-3 text-sm text-muted">
            Dernière mise à jour : [à compléter]
          </p>

          <div
            role="note"
            className="mt-10 rounded-md bg-cream-deep px-5 py-4 text-sm leading-relaxed text-foreground"
          >
            <p>
              📋 Document en cours de finalisation. Les mentions légales
              définitives seront publiées prochainement. En cas de question,
              contactez-nous à{" "}
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
