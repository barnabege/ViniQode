import Link from "next/link";
import { ArrowRight, Building2, Wine, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Bienvenue · ViniQode" };

const CARDS = [
  {
    icon: Building2,
    title: "Votre domaine",
    body: "Quelques informations sur votre exploitation.",
  },
  {
    icon: Wine,
    title: "Votre première cuvée",
    body: "Nom, millésime, ingrédients, valeurs nutritionnelles.",
  },
  {
    icon: QrCode,
    title: "Votre QR code",
    body: "Conforme et prêt à être imprimé sur vos étiquettes.",
  },
] as const;

export default function BienvenuePage() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="font-serif text-4xl leading-[1.1] text-foreground sm:text-5xl">
        Bienvenue sur ViniQode.
      </h1>
      <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
        Vous allez créer votre premier QR code conforme en 10 minutes.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <article
              key={c.title}
              className="rounded-md border border-border bg-background p-6 text-left"
            >
              <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-lg text-foreground">
                {c.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link href="/onboarding/domaine">
            C&apos;est parti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
