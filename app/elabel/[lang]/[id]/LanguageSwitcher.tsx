"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n";

const STORAGE_KEY = "viniqode:elabel-locale";

interface Props {
  /** Locale actuellement rendue (issue de l'URL) */
  current: Locale;
  /** UUID de la cuvée — segment {id} de l'URL */
  cuveeId: string;
  /** Libellé accessible localisé */
  ariaLabel: string;
}

export function LanguageSwitcher({ current, cuveeId, ariaLabel }: Props) {
  const router = useRouter();

  // Persiste le choix manuel en localStorage (pas de cookie de tracking).
  // Lu par d'autres scans depuis le même appareil pour pré-sélectionner.
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, current);
    } catch {
      // localStorage indisponible (mode privé strict, quota) — silencieux.
    }
  }, [current]);

  const onChange = (next: string) => {
    if (next === current) return;
    router.push(`/elabel/${next}/${cuveeId}`);
  };

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border-none bg-transparent pr-0 text-xs text-muted focus:outline-none"
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
