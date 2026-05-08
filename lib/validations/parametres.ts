// lib/validations/parametres.ts
// Schémas Zod partagés client + serveur pour la page Paramètres.
// Convention forms RHF : valeurs vides = "" (string), pas null.
// Les Server Actions transforment "" → null avant l'écriture DB.

import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────────
// Listes d'options (réutilisables côté UI : selects, checkboxes)
// ──────────────────────────────────────────────────────────────────────────

export const REGIONS = [
  "Alsace",
  "Bordeaux",
  "Bourgogne",
  "Champagne",
  "Languedoc",
  "Loire",
  "Provence",
  "Rhône",
  "Sud-Ouest",
  "Autre",
] as const;

export const TYPES_VITICULTURE = [
  { value: "conventionnelle", label: "Conventionnelle" },
  { value: "hve", label: "Haute Valeur Environnementale (HVE)" },
  { value: "bio", label: "Agriculture biologique" },
  { value: "biodynamie", label: "Biodynamie" },
  { value: "nature", label: "Vin nature" },
] as const;

export const CERTIFICATIONS = [
  { value: "ab", label: "AB (Agriculture biologique)" },
  { value: "demeter", label: "Demeter" },
  { value: "ecocert", label: "Ecocert" },
  { value: "terra_vitis", label: "Terra Vitis" },
  { value: "nature_progres", label: "Nature & Progrès" },
] as const;

export const FORMES_JURIDIQUES = [
  "EARL",
  "SCEA",
  "SAS",
  "SARL",
  "EI",
  "autre",
] as const;

export const RAPPORT_FREQUENCES = [
  { value: "jamais", label: "Jamais" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
] as const;

export const POLICES_ELABEL = [
  { value: "inter", label: "Inter (sans-serif moderne)" },
  { value: "playfair", label: "Playfair (serif élégant)" },
  { value: "lora", label: "Lora (serif lisible)" },
  { value: "montserrat", label: "Montserrat (sans-serif géo.)" },
] as const;

export const DEVISES = ["EUR", "USD", "GBP", "CHF"] as const;

export const FORMATS_DATE = [
  { value: "dd/MM/yyyy", label: "31/12/2025" },
  { value: "MM/dd/yyyy", label: "12/31/2025" },
  { value: "yyyy-MM-dd", label: "2025-12-31" },
] as const;

export const LANGUES_UE = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "nl", label: "Nederlands", flag: "🇳🇱" },
  { value: "pl", label: "Polski", flag: "🇵🇱" },
  { value: "ro", label: "Română", flag: "🇷🇴" },
  { value: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { value: "sv", label: "Svenska", flag: "🇸🇪" },
  { value: "da", label: "Dansk", flag: "🇩🇰" },
  { value: "fi", label: "Suomi", flag: "🇫🇮" },
  { value: "cs", label: "Čeština", flag: "🇨🇿" },
  { value: "hu", label: "Magyar", flag: "🇭🇺" },
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "sl", label: "Slovenščina", flag: "🇸🇮" },
  { value: "bg", label: "Български", flag: "🇧🇬" },
  { value: "hr", label: "Hrvatski", flag: "🇭🇷" },
  { value: "et", label: "Eesti", flag: "🇪🇪" },
  { value: "lt", label: "Lietuvių", flag: "🇱🇹" },
  { value: "lv", label: "Latviešu", flag: "🇱🇻" },
  { value: "mt", label: "Malti", flag: "🇲🇹" },
  { value: "ga", label: "Gaeilge", flag: "🇮🇪" },
] as const;

const LANGUE_VALUES = LANGUES_UE.map((l) => l.value) as readonly string[];
const REGION_VALUES = REGIONS as readonly string[];
const TYPE_VITICULTURE_VALUES = TYPES_VITICULTURE.map((t) => t.value);
const CERTIFICATION_VALUES = CERTIFICATIONS.map((c) => c.value);
const FORME_JURIDIQUE_VALUES = FORMES_JURIDIQUES;
const RAPPORT_FREQUENCE_VALUES = RAPPORT_FREQUENCES.map((r) => r.value);
const POLICE_ELABEL_VALUES = POLICES_ELABEL.map((p) => p.value);
const DEVISE_VALUES = DEVISES;
const FORMAT_DATE_VALUES = FORMATS_DATE.map((f) => f.value);

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

// Helpers Zod : pas de `.default()` car cela créerait un mismatch
// input/output qui casse l'inférence de types dans RHF + zodResolver.
// Les valeurs par défaut "" sont fournies par les `defaultValues` RHF.

const optionalString = z
  .string()
  .trim()
  .max(500, "Maximum 500 caractères")
  .optional();

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^https?:\/\/[^\s]+$/.test(v),
    "URL invalide (doit commencer par http:// ou https://)",
  );

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Email invalide",
  );

// ──────────────────────────────────────────────────────────────────────────
// Section : Domaine
// ──────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

export const domaineSchema = z
  .object({
    nom_domaine: z
      .string()
      .trim()
      .min(1, "Le nom du domaine est obligatoire")
      .max(120),
    adresse: optionalString,
    region: z
      .string()
      .optional()
      .refine(
        (v) => !v || REGION_VALUES.includes(v),
        "Région inconnue",
      ),
    siret: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^\d{14}$/.test(v),
        "Le SIRET doit contenir exactement 14 chiffres",
      ),
    site_web: optionalUrl,
    annee_creation: z
      .union([z.number().int(), z.literal(""), z.null()])
      .optional()
      .refine(
        (v) =>
          v === "" || v === null || v === undefined ||
          (typeof v === "number" && v >= 1800 && v <= CURRENT_YEAR),
        `L'année doit être entre 1800 et ${CURRENT_YEAR}`,
      ),
    surface_hectares: z
      .union([z.number(), z.literal(""), z.null()])
      .optional()
      .refine(
        (v) =>
          v === "" || v === null || v === undefined ||
          (typeof v === "number" && v >= 0 && v <= 9999.99),
        "La surface doit être positive (max 9999,99 ha)",
      ),
    type_viticulture: z.array(
      z.enum(TYPE_VITICULTURE_VALUES as [string, ...string[]]),
    ),
    certifications: z.array(
      z.enum(CERTIFICATION_VALUES as [string, ...string[]]),
    ),
    latitude: z
      .union([z.number(), z.literal(""), z.null()])
      .optional()
      .refine(
        (v) =>
          v === "" || v === null || v === undefined ||
          (typeof v === "number" && v >= -90 && v <= 90),
        "Latitude entre -90 et 90",
      ),
    longitude: z
      .union([z.number(), z.literal(""), z.null()])
      .optional()
      .refine(
        (v) =>
          v === "" || v === null || v === undefined ||
          (typeof v === "number" && v >= -180 && v <= 180),
        "Longitude entre -180 et 180",
      ),
    logo_url: z.string().optional(),
    photo_domaine_url: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasLat = typeof data.latitude === "number";
    const hasLng = typeof data.longitude === "number";
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: "custom",
        message: "Latitude et longitude doivent être renseignées ensemble",
        path: hasLat ? ["longitude"] : ["latitude"],
      });
    }
  });

export type DomaineFormValues = z.input<typeof domaineSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Section : Compte
// ──────────────────────────────────────────────────────────────────────────

export const compteSchema = z.object({
  prenom: optionalString,
  nom: optionalString,
  fonction: optionalString,
  telephone: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (v) => !v || /^[+0-9 .()-]{6,20}$/.test(v),
      "Numéro de téléphone invalide",
    ),
  email_contact_public: optionalEmail,
});

export type CompteFormValues = z.input<typeof compteSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Section : Facturation
// ──────────────────────────────────────────────────────────────────────────

export const facturationSchema = z
  .object({
    raison_sociale: optionalString,
    forme_juridique: z
      .string()
      .optional()
      .refine(
        (v) => !v || (FORME_JURIDIQUE_VALUES as readonly string[]).includes(v),
        "Forme juridique invalide",
      ),
    adresse_facturation: optionalString,
    tva_intracommunautaire: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(v),
        "Numéro de TVA invalide (ex: FR12345678901)",
      ),
    livraison_identique_facturation: z.boolean(),
    adresse_livraison: optionalString,
  })
  .superRefine((data, ctx) => {
    if (
      !data.livraison_identique_facturation &&
      (!data.adresse_livraison || data.adresse_livraison.trim().length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Adresse de livraison requise",
        path: ["adresse_livraison"],
      });
    }
  });

export type FacturationFormValues = z.input<typeof facturationSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Section : Préférences
// ──────────────────────────────────────────────────────────────────────────

export const preferencesSchema = z.object({
  langue: z.enum(LANGUE_VALUES as [string, ...string[]]),
  langues_elabel: z
    .array(z.enum(LANGUE_VALUES as [string, ...string[]]))
    .min(1, "Au moins une langue d'affichage e-label"),
  fuseau_horaire: z.string().min(1).max(64),
  devise: z.enum(DEVISE_VALUES as unknown as [string, ...string[]]),
  format_date: z.enum(FORMAT_DATE_VALUES as [string, ...string[]]),
});

export type PreferencesFormValues = z.input<typeof preferencesSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Section : Notifications
// ──────────────────────────────────────────────────────────────────────────

export const notificationsSchema = z.object({
  newsletter_produit: z.boolean(),
  alertes_reglementaires: z.boolean(),
  emails_marketing: z.boolean(),
  notif_scan_seuil: z
    .number()
    .int("Doit être un entier")
    .min(0, "Doit être ≥ 0")
    .max(100000, "Maximum 100 000"),
  rapport_frequence: z.enum(RAPPORT_FREQUENCE_VALUES as [string, ...string[]]),
  alerte_expiration_certif: z.boolean(),
  rappel_renouvellement: z.boolean(),
});

export type NotificationsFormValues = z.input<typeof notificationsSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Section : Personnalisation e-label
// ──────────────────────────────────────────────────────────────────────────

export const personnalisationSchema = z.object({
  couleur_principale: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide (format #RRGGBB)"),
  police_elabel: z.enum(POLICE_ELABEL_VALUES as [string, ...string[]]),
  banniere_url: z.string().optional(),
  mentions_legales_custom: z
    .string()
    .trim()
    .max(2000, "Maximum 2000 caractères")
    .optional(),
  lien_boutique: optionalUrl,
});

export type PersonnalisationFormValues = z.input<typeof personnalisationSchema>;

// ──────────────────────────────────────────────────────────────────────────
// Helper : sérialise les "" en null avant écriture DB
// ──────────────────────────────────────────────────────────────────────────

export function emptyToNull<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]: T[K] extends string ? string | null : T[K] } {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === "string" && value === "" ? null : value;
  }
  return result as { [K in keyof T]: T[K] extends string ? string | null : T[K] };
}
