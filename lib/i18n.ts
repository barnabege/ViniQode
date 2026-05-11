// lib/i18n.ts
//
// Locale primitives shared by the e-label public pages.
// 6 supported markets (UE 2021/2117 compliance). FR is the editorial
// default (vignerons write in FR); EN is the fallback when a consumer's
// Accept-Language has no supported match.

export const SUPPORTED_LOCALES = ["fr", "en", "de", "it", "es", "nl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const FALLBACK_LOCALE: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  if (!value) return false;
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale from an Accept-Language header value.
 * Spec-aware: respects q-values and matches the primary subtag (fr-FR → fr).
 * Returns FALLBACK_LOCALE ("en") when no candidate matches.
 */
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return FALLBACK_LOCALE;

  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = rawTag?.trim().toLowerCase() ?? "";
      const qStr = params
        .find((p) => p.trim().startsWith("q="))
        ?.split("=")[1];
      const q = qStr ? parseFloat(qStr) : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const primary = tag.split("-")[0] ?? "";
    if (isLocale(primary)) return primary;
  }
  return FALLBACK_LOCALE;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
  it: "Italiano",
  es: "Español",
  nl: "Nederlands",
};

export const HTML_LANG: Record<Locale, string> = {
  fr: "fr",
  en: "en",
  de: "de",
  it: "it",
  es: "es",
  nl: "nl",
};
