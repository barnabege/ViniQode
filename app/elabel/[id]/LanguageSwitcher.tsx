// app/elabel/[id]/LanguageSwitcher.tsx
"use client";

import * as React from "react";
import { Languages } from "lucide-react";

const LANGS_UE = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "nl", label: "Nederlands" },
  { code: "pt", label: "Português" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "el", label: "Ελληνικά" },
  { code: "cs", label: "Čeština" },
  { code: "hu", label: "Magyar" },
  { code: "ro", label: "Română" },
  { code: "bg", label: "Български" },
  { code: "hr", label: "Hrvatski" },
  { code: "et", label: "Eesti" },
  { code: "lt", label: "Lietuvių" },
  { code: "lv", label: "Latviešu" },
  { code: "mt", label: "Malti" },
  { code: "sk", label: "Slovenčina" },
  { code: "sl", label: "Slovenščina" },
  { code: "ga", label: "Gaeilge" },
];

export function LanguageSwitcher() {
  const [current, setCurrent] = React.useState("fr");

  React.useEffect(() => {
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    if (browser && LANGS_UE.some((l) => l.code === browser)) {
      setCurrent(browser);
    }
  }, []);

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Changer de langue</span>
      <select
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className="appearance-none border-none bg-transparent pr-0 text-xs text-muted focus:outline-none"
      >
        {LANGS_UE.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
