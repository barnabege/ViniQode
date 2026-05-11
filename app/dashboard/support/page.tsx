// app/dashboard/support/page.tsx
//
// Page Support. Contenu statique : pas de fetch Supabase, donc Server Component
// pur. L'Accordion est un Client Component mais peut être imbriqué tel quel.

import Link from "next/link";
import { Activity, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

export const metadata = { title: "Support" };

const SUPPORT_EMAIL = "support@viniqode.fr";

interface FaqSection {
  id: string;
  title: string;
  questions: string[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "conformite",
    title: "Conformité & réglementation",
    questions: [
      "Mon e-label ViniQode est-il conforme au règlement (UE) 2021/2117 ?",
      "Que se passe-t-il si la DGCCRF me contrôle ?",
      "Combien de temps mes pages e-label restent-elles accessibles ?",
      "Mes vins exportés hors UE doivent-ils aussi avoir un QR code ?",
      "Mon millésime d'avant décembre 2023 doit-il être mis à jour ?",
    ],
  },
  {
    id: "cuvees",
    title: "Création & gestion des cuvées",
    questions: [
      "Comment sont calculées mes valeurs nutritionnelles ?",
      "Puis-je modifier une cuvée après avoir imprimé le QR code ?",
      "Comment ajouter une traduction dans une autre langue UE ?",
      "Combien de cuvées puis-je créer avec mon plan ?",
    ],
  },
  {
    id: "qrcode",
    title: "QR code & impression",
    questions: [
      "Quelle taille minimum pour le QR code sur l'étiquette ?",
      "Quel format de fichier dois-je transmettre à mon imprimeur ?",
      "Le QR code doit-il obligatoirement être noir ?",
      "Mon imprimeur me demande un fichier vectoriel",
    ],
  },
  {
    id: "facturation",
    title: "Facturation & abonnement",
    questions: [
      "Comment passer de Starter à Essentiel ?",
      "Que se passe-t-il si j'arrête mon abonnement ?",
      "Comment télécharger mes factures ?",
      "Puis-je changer de plan en cours d'année ?",
    ],
  },
  {
    id: "commandes",
    title: "Commandes physiques (stickers, contre-étiquettes)",
    questions: [
      "Quel est le délai de livraison ?",
      "Quels sont les frais de port ?",
      "Puis-je retourner des stickers défectueux ?",
    ],
  },
];

export default function SupportPage() {
  return (
    <main className="flex-1">
      <header className="border-b border-border bg-background px-6 py-7 sm:px-10 sm:py-8">
        <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Support
        </h1>
        <p className="mt-2 text-sm text-muted">
          Une question ? Une réponse. La conformité ne devrait jamais être un
          casse-tête.
        </p>
      </header>

      <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-12">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ContactCard
            icon={<Mail className="h-5 w-5 text-accent" />}
            title="Écrivez-nous"
            description={`${SUPPORT_EMAIL} · Réponse sous 48h ouvrées`}
            action={
              <Button asChild size="sm" block>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Envoyer un email</a>
              </Button>
            }
          />
          <ContactCard
            icon={<MessageCircle className="h-5 w-5 text-accent" />}
            title="Chat en direct"
            description="Lundi–Vendredi · 9h–18h"
            action={
              // TODO: brancher Crisp
              <Button size="sm" variant="secondary" block disabled>
                Ouvrir le chat
              </Button>
            }
          />
          <ContactCard
            icon={<Activity className="h-5 w-5 text-accent" />}
            title="Statut des services"
            description={
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-success"
                />
                Tous les services opérationnels
              </span>
            }
            action={
              <Link
                href="/support/status"
                className="text-sm font-medium text-accent hover:underline"
              >
                Voir l'historique
              </Link>
            }
          />
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              Questions fréquentes
            </h2>
            <p className="mt-1 text-sm text-muted">
              Les réponses aux interrogations qui reviennent le plus souvent.
            </p>
          </div>

          <div className="space-y-8">
            {FAQ_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="rounded-md border border-border bg-background p-6 sm:p-8"
              >
                <h3 className="font-serif text-xl text-foreground">
                  {section.title}
                </h3>
                <Accordion type="single" collapsible className="mt-2">
                  {section.questions.map((question, idx) => (
                    <AccordionItem
                      key={`${section.id}-${idx}`}
                      value={`${section.id}-${idx}`}
                    >
                      <AccordionTrigger>{question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">
                          Contenu à rédiger
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border bg-surface p-6 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-prose">
              <h2 className="font-serif text-2xl text-foreground">
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Notre équipe répond personnellement à chaque demande.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Nous écrire</a>
              </Button>
              {/* TODO: brancher Crisp */}
              <Button variant="secondary" disabled>
                Ouvrir le chat
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action: React.ReactNode;
}

function ContactCard({ icon, title, description, action }: ContactCardProps) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="font-serif text-lg text-foreground">{title}</h2>
      </div>
      <div className="mt-3 flex-1 text-sm text-muted">{description}</div>
      <div className="mt-5">{action}</div>
    </div>
  );
}
