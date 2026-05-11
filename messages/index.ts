// messages/index.ts
import type { Locale } from "@/lib/i18n";
import type { Messages } from "./types";
import { fr } from "./fr";
import { en } from "./en";
import { de } from "./de";
import { it } from "./it";
import { es } from "./es";
import { nl } from "./nl";

export type { Messages };

const dict: Record<Locale, Messages> = { fr, en, de, it, es, nl };

export function getMessages(locale: Locale): Messages {
  return dict[locale];
}
