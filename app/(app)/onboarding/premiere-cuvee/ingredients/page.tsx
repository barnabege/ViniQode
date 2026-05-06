import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IngredientsForm } from "./IngredientsForm";

export const metadata = { title: "Ingrédients · ViniQode" };

export default function IngredientsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/onboarding/premiere-cuvee/infos"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
        Ingrédients de la cuvée.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Listez les ingrédients utilisés dans l&apos;ordre décroissant
        d&apos;incorporation. Les allergènes sont automatiquement détectés.
      </p>

      <div className="mt-8">
        <IngredientsForm />
      </div>
    </div>
  );
}
