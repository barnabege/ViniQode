import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NutritionForm } from "./NutritionForm";

export const metadata = { title: "Valeurs nutritionnelles · ViniQode" };

export default function NutritionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/onboarding/premiere-cuvee/ingredients"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
        Déclaration nutritionnelle.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Pour 100 ml. Vous pouvez ajuster ces valeurs si vous disposez
        d&apos;une analyse de laboratoire.
      </p>

      <div className="mt-8">
        <NutritionForm />
      </div>
    </div>
  );
}
