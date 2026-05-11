"use client";

import * as React from "react";
import type { Locale } from "@/lib/i18n";
import { HTML_LANG } from "@/lib/i18n";

// Le root layout rend `<html lang="fr">` (statique). Pour les pages
// /elabel/[lang]/* on ajuste l'attribut côté client afin que les outils
// d'accessibilité (lecteurs d'écran) et les crawlers JS-aware lisent la
// bonne langue. Les balises hreflang couvrent les crawlers non-JS.
export function HtmlLangSetter({ lang }: { lang: Locale }) {
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = HTML_LANG[lang];
    }
  }, [lang]);
  return null;
}
