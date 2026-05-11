"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

const QUESTIONS = [
  {
    q: "Puis-je changer de plan plus tard ?",
    id: "changer-plan",
  },
  {
    q: "Que se passe-t-il si j'arrête mon abonnement ?",
    id: "arret-abonnement",
  },
  {
    q: "Comment se passe la facturation ?",
    id: "facturation",
  },
  {
    q: "Puis-je obtenir une facture pour ma comptabilité ?",
    id: "facture-compta",
  },
];

export function AbonnementFAQ() {
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {QUESTIONS.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>
            <p>Contenu à rédiger</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
