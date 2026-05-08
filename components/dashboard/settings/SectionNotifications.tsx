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

export function SectionNotifications(_props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Notifications
          <Badge variant="neutral">P2</Badge>
        </CardTitle>
        <CardDescription>
          Newsletter, alertes réglementaires, seuil de scans, fréquence des
          rapports.
        </CardDescription>
      </CardHeader>
      <p className="mt-6 text-sm text-muted">
        Section prévue en P2.
      </p>
    </Card>
  );
}
