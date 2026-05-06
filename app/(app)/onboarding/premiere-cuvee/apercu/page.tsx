import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApercuView } from "./ApercuView";

export const metadata = { title: "Aperçu · ViniQode" };

export default function ApercuPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/onboarding/premiere-cuvee/nutrition"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
        Vérifiez votre page e-label.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Voici ce que vos clients verront en scannant le QR code.
      </p>

      <div className="mt-10">
        <ApercuView />
      </div>
    </div>
  );
}
