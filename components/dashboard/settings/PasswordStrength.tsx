"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  className?: string;
}

export function passwordStrengthScore(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

const LABELS = ["Trop faible", "Faible", "Moyen", "Bon", "Excellent"];
const COLORS = [
  "bg-border",
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-accent",
];

export function PasswordStrength({ value, className }: Props) {
  const score = passwordStrengthScore(value);
  const label = LABELS[score] ?? LABELS[0];
  const color = COLORS[score] ?? COLORS[0];

  return (
    <div className={cn("space-y-1.5", className)} aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? color : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">
        Force du mot de passe :{" "}
        <span className="font-medium text-foreground">{label}</span>
      </p>
      {!value && (
        <p className="text-xs text-muted">
          Au moins 8 caractères, une majuscule, un chiffre, un caractère
          spécial.
        </p>
      )}
    </div>
  );
}
