// app/elabel/[id]/labels.ts
import type { TypeVin } from "@/lib/database.types";

export const TYPES_VIN_LABELS: Record<TypeVin, string> = {
  blanc: "Blanc",
  rouge: "Rouge",
  rose: "Rosé",
  effervescent: "Effervescent",
  liquoreux: "Liquoreux",
  autre: "Autre",
};
