import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InfosForm } from "./InfosForm";

export const metadata = { title: "Votre première cuvée · ViniQode" };

export default function CuveeInfosPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/onboarding/domaine"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
        Votre première cuvée.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Renseignez les informations principales. Vous pourrez modifier ces
        valeurs plus tard depuis votre tableau de bord.
      </p>

      <div className="mt-8">
        <InfosForm />
      </div>
    </div>
  );
}
