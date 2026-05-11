// app/dashboard/analytics/_lib/flags.ts
//
// Code ISO 3166-1 alpha-2 → emoji drapeau + nom localisé.
// Pas de dépendance externe : on s'appuie sur le bloc Unicode "regional
// indicator symbols" (U+1F1E6..U+1F1FF) et sur Intl.DisplayNames pour les
// noms (disponible natif Node 18+, donc OK Next 14).

const WHITE_FLAG = "\u{1F3F3}\u{FE0F}";

export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return WHITE_FLAG;
  const upper = code.toUpperCase();
  const a = upper.charCodeAt(0);
  const b = upper.charCodeAt(1);
  // Validation : doit être 2 lettres ASCII A-Z.
  if (a < 65 || a > 90 || b < 65 || b > 90) return WHITE_FLAG;
  return String.fromCodePoint(0x1f1e6 + a - 65, 0x1f1e6 + b - 65);
}

let cachedDisplayNames: Intl.DisplayNames | null = null;

function getDisplayNames(): Intl.DisplayNames {
  if (!cachedDisplayNames) {
    cachedDisplayNames = new Intl.DisplayNames(["fr"], { type: "region" });
  }
  return cachedDisplayNames;
}

export function countryName(code: string | null | undefined): string {
  if (!code) return "Inconnu";
  try {
    const name = getDisplayNames().of(code.toUpperCase());
    return name ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
