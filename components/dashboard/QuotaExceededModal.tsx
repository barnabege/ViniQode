"use client";

import * as React from "react";
import Link from "next/link";
import { Wine } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface QuotaExceededModalProps {
  open: boolean;
  onClose: () => void;
  planLabel: string;
  limit: number;
}

export function QuotaExceededModal({
  open,
  onClose,
  planLabel,
  limit,
}: QuotaExceededModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Limite de cuvées atteinte"
      description={`Votre plan ${planLabel} permet de créer jusqu'à ${limit} cuvée${
        limit > 1 ? "s" : ""
      }. Passez à l'offre Essentiel pour des cuvées illimitées.`}
    >
      <div className="flex justify-center pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-wine/10">
          <Wine className="h-6 w-6 text-wine" aria-hidden />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Plus tard
        </Button>
        <Button asChild>
          <Link href="/dashboard/parametres/abonnement" onClick={onClose}>
            Découvrir Essentiel
          </Link>
        </Button>
      </div>
    </Modal>
  );
}
