import { z } from "zod";

const REGIONS = [
  "Alsace",
  "Bordeaux",
  "Bourgogne",
  "Champagne",
  "Loire",
  "Provence",
  "Rhône",
  "Sud-Ouest",
  "Autre",
] as const;

export const domaineSchema = z.object({
  raison_sociale: z
    .string()
    .min(2, "Raison sociale requise.")
    .max(200, "Maximum 200 caractères."),
  region: z.enum(REGIONS, { message: "Sélectionnez une région." }),
});
export type DomaineInput = z.infer<typeof domaineSchema>;

const TYPES_VIN = [
  "rouge",
  "blanc",
  "rose",
  "effervescent",
  "liquoreux",
  "autre",
] as const;
export type TypeVinValue = (typeof TYPES_VIN)[number];

const VOLUMES_ML = [375, 500, 750, 1500] as const;

const currentYear = new Date().getFullYear();

export const cuveeInfosSchema = z.object({
  nom: z
    .string()
    .min(2, "Nom de cuvée requis.")
    .max(120, "Maximum 120 caractères."),
  millesime: z
    .number()
    .int()
    .min(2020, "Millésime à partir de 2020.")
    .max(currentYear, `Millésime au plus tard ${currentYear}.`),
  type_vin: z.enum(TYPES_VIN, { message: "Sélectionnez un type." }),
  degre_alcool: z
    .number()
    .min(8, "Minimum 8 % vol.")
    .max(15, "Maximum 15 % vol."),
  volume_ml: z
    .number()
    .int()
    .refine((v) => (VOLUMES_ML as readonly number[]).includes(v), {
      message: "Volume invalide.",
    }),
  sucres_residuels_g_l: z
    .number()
    .min(0, "Doit être positif.")
    .max(400, "Maximum 400 g/L."),
});
export type CuveeInfosInput = z.infer<typeof cuveeInfosSchema>;

export const ingredientsSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, "Au moins un ingrédient requis."),
});
export type IngredientsInput = z.infer<typeof ingredientsSchema>;

export const nutritionSchema = z.object({
  energie_kj: z.number().int().min(0).max(5000),
  energie_kcal: z.number().int().min(0).max(1500),
  glucides_g: z.number().min(0).max(100),
  sucres_g: z.number().min(0).max(100),
  calcul_automatique: z.boolean(),
});
export type NutritionInput = z.infer<typeof nutritionSchema>;

export const REGIONS_LIST = REGIONS;
export const TYPES_VIN_LIST = TYPES_VIN;
export const VOLUMES_ML_LIST = VOLUMES_ML;

export const TYPE_VIN_LABELS: Record<TypeVinValue, string> = {
  rouge: "Rouge",
  blanc: "Blanc",
  rose: "Rosé",
  effervescent: "Effervescent",
  liquoreux: "Liquoreux",
  autre: "Autre",
};
