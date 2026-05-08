"use client";

import * as React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Profile } from "@/lib/database.types";

interface Props {
  profile: Profile;
  userId: string;
}

export function SectionPersonnalisation(_props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Personnalisation e-label
          <Badge variant="neutral">P2</Badge>
        </CardTitle>
        <CardDescription>
          Couleur principale, police, bannière, mentions légales, lien
          boutique. Réservé aux plans Essentiel et Pro.
        </CardDescription>
      </CardHeader>
      <p className="mt-6 text-sm text-muted">
        Section prévue en P2 (color picker, aperçu live, gating plan).
      </p>
    </Card>
  );
}
