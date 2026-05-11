// lib/validations/cuvees.ts
//
// Schémas Zod partagés (client + Server Actions) pour la création et la mise
// à jour d'une cuvée. Toutes les Server Actions valident leur input via ces
// schémas ; la défense en profondeur côté DB reste assurée par les contraintes
// CHECK et la RLS.

import { z } from "zod";
import { REGIONS_VITICOLES, APPELLATIONS_FR } from "@/lib/ingredients";

// ──────────────────────────────────────────────────────────────────────────
// Constantes UI partagées
// ──────────────────────────────────────────────────────────────────────────

export const COULEURS = [
  { value: "rouge", label: "Rouge" },
  { value: "blanc", label: "Blanc" },
  { value: "rose", label: "Rosé" },
  { value: "effervescent", label: "Effervescent" },
] as const;

export const COULEUR_VALUES = COULEURS.map((c) => c.value) as readonly string[];

export const STATUTS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "actif", label: "Publié" },
  { value: "archive", label: "Archivé" },
] as const;

export const STATUT_VALUES = STATUTS.map((s) => s.value) as readonly string[];

export const VOLUMES = [
  { value: 37, label: "37,5 cl" },
  { value: 75, label: "75 cl" },
  { value: 100, label: "1 L" },
  { value: 150, label: "1,5 L" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

/** Coerce un input form ("", null, undefined, "12.5") en number | null. */
const numericNullable = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isNaN(n) ? null : n;
  });

const intNullable = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseInt(String(v), 10);
    return Number.isNaN(n) ? null : n;
  });

const stringNullable = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const t = v.trim();
    return t === "" ? null : t;
  });

// ──────────────────────────────────────────────────────────────────────────
// Schéma principal — utilisé pour brouillons et publication
// ──────────────────────────────────────────────────────────────────────────

export const cuveeDraftSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est obligatoire").max(120, "Maximum 120 caractères"),
  region: stringNullable.refine(
    (v) => v === null || (REGIONS_VITICOLES as readonly string[]).includes(v),
    "Région inconnue",
  ),
  appellation: stringNullable.refine(
    (v) => v === null || (APPELLATIONS_FR as readonly string[]).includes(v),
    "Appellation inconnue",
  ),
  millesime: intNullable.refine(
    (v) => v === null || (v >= 1900 && v <= CURRENT_YEAR),
    `Le millésime doit être entre 1900 et ${CURRENT_YEAR}`,
  ),
  couleur: z
    .union([z.enum(COULEUR_VALUES as [string, ...string[]]), z.null(), z.literal("")])
    .transform((v) => (v === "" || v == null ? null : v)),
  degre_alcool: numericNullable.refine(
    (v) => v === null || (v >= 0 && v <= 25),
    "Le degré doit être entre 0 et 25",
  ),
  volume_cl: intNullable.refine(
    (v) => v === null || (v > 0 && v <= 1000),
    "Volume invalide",
  ),
  sucres_residuels: numericNullable.refine(
    (v) => v === null || v >= 0,
    "Les sucres résiduels doivent être positifs",
  ),
  ingredients: z.array(z.string()).default([]),
  allergenes: z.array(z.string()).default([]),
  valeur_energetique_kj: intNullable,
  valeur_energetique_kcal: intNullable,
  glucides_g: numericNullable,
  sucres_g: numericNullable,
  lipides_g: numericNullable,
  acides_gras_satures_g: numericNullable,
  proteines_g: numericNullable,
  sel_g: numericNullable,
});

export type CuveeDraftInput = z.input<typeof cuveeDraftSchema>;
export type CuveeDraftOutput = z.output<typeof cuveeDraftSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Schéma de publication — exige les champs réglementaires
// ──────────────────────────────────────────────────────────────────────────

export const cuveePublishSchema = cuveeDraftSchema.superRefine((data, ctx) => {
  const requireNonNull = (key: keyof CuveeDraftOutput, message: string) => {
    if (data[key] === null || data[key] === undefined) {
      ctx.addIssue({ code: "custom", message, path: [key] });
    }
  };
  requireNonNull("couleur", "La couleur est obligatoire pour publier");
  requireNonNull("millesime", "Le millésime est obligatoire pour publier");
  requireNonNull("degre_alcool", "Le degré d'alcool est obligatoire pour publier");
  requireNonNull("volume_cl", "Le volume est obligatoire pour publier");
  requireNonNull(
    "valeur_energetique_kj",
    "La valeur énergétique kJ est obligatoire pour publier",
  );
  requireNonNull(
    "valeur_energetique_kcal",
    "La valeur énergétique kcal est obligatoire pour publier",
  );
  if (data.ingredients.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Au moins un ingrédient est requis pour publier",
      path: ["ingredients"],
    });
  }
});

export type CuveePublishOutput = z.output<typeof cuveePublishSchema>;
