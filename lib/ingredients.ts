// lib/ingredients.ts
//
// Catalogue des ingrédients/additifs autorisés pour les vins,
// avec leur code E et les allergènes éventuels associés.

export type AllergeneCode =
  | "sulfites"
  | "oeuf"
  | "lait"
  | "poisson"
  | "soja"
  | "fruits-coque";

export interface Ingredient {
  id: string;
  nom: string;
  codeE?: string;
  categorie:
    | "base"
    | "enrichissement"
    | "regulateur-acidite"
    | "conservateur"
    | "stabilisant"
    | "pratique";
  allergenes?: AllergeneCode[];
  /** Toujours coché par défaut, non décochable */
  fixe?: boolean;
}

export const INGREDIENTS: Ingredient[] = [
  { id: "raisins", nom: "Raisins", categorie: "base", fixe: true },

  { id: "saccharose", nom: "Sucre / Saccharose", categorie: "enrichissement" },
  { id: "mrc", nom: "Moût de raisin concentré (MRC)", categorie: "enrichissement" },
  {
    id: "mrcr",
    nom: "Moût de raisin concentré rectifié (MRCR)",
    categorie: "enrichissement",
  },

  { id: "e334", nom: "Acide tartrique", codeE: "E334", categorie: "regulateur-acidite" },
  { id: "e296", nom: "Acide malique", codeE: "E296", categorie: "regulateur-acidite" },
  { id: "e270", nom: "Acide lactique", codeE: "E270", categorie: "regulateur-acidite" },
  { id: "e330", nom: "Acide citrique", codeE: "E330", categorie: "regulateur-acidite" },
  {
    id: "e516",
    nom: "Sulfate de calcium",
    codeE: "E516",
    categorie: "regulateur-acidite",
  },

  {
    id: "e220",
    nom: "Dioxyde de soufre / Sulfites",
    codeE: "E220",
    categorie: "conservateur",
    allergenes: ["sulfites"],
  },
  {
    id: "e228",
    nom: "Bisulfite de potassium",
    codeE: "E228",
    categorie: "conservateur",
    allergenes: ["sulfites"],
  },
  {
    id: "e224",
    nom: "Métabisulfite de potassium",
    codeE: "E224",
    categorie: "conservateur",
    allergenes: ["sulfites"],
  },
  {
    id: "e202",
    nom: "Sorbate de potassium",
    codeE: "E202",
    categorie: "conservateur",
  },
  {
    id: "e1105",
    nom: "Lysozyme",
    codeE: "E1105",
    categorie: "conservateur",
    allergenes: ["oeuf"],
  },
  {
    id: "e300",
    nom: "Acide ascorbique / Vitamine C",
    codeE: "E300",
    categorie: "conservateur",
  },

  {
    id: "e353",
    nom: "Acide métatartrique",
    codeE: "E353",
    categorie: "stabilisant",
  },
  { id: "e414", nom: "Gomme arabique", codeE: "E414", categorie: "stabilisant" },
  { id: "mannoproteines", nom: "Mannoprotéines de levure", categorie: "stabilisant" },
  {
    id: "e466",
    nom: "Carboxyméthylcellulose",
    codeE: "E466",
    categorie: "stabilisant",
  },
  {
    id: "e456",
    nom: "Polyaspartate de potassium",
    codeE: "E456",
    categorie: "stabilisant",
  },

  { id: "froid", nom: "Traitement par le froid", categorie: "pratique" },
  { id: "filtration", nom: "Filtration", categorie: "pratique" },
  { id: "bentonite", nom: "Collage (bentonite)", categorie: "pratique" },
  {
    id: "caseine",
    nom: "Collage (caséine)",
    categorie: "pratique",
    allergenes: ["lait"],
  },
  {
    id: "albumine",
    nom: "Collage (albumine d'œuf)",
    categorie: "pratique",
    allergenes: ["oeuf"],
  },
];

const LIBELLES_ALLERGENES: Record<AllergeneCode, string> = {
  sulfites: "Sulfites",
  oeuf: "Œuf",
  lait: "Lait",
  poisson: "Poisson",
  soja: "Soja",
  "fruits-coque": "Fruits à coque",
};

export function detecterAllergenes(idsIngredients: string[]): AllergeneCode[] {
  const set = new Set<AllergeneCode>();
  for (const id of idsIngredients) {
    const ing = INGREDIENTS.find((i) => i.id === id);
    ing?.allergenes?.forEach((a) => set.add(a));
  }
  return Array.from(set);
}

export function libelleAllergenes(codes: AllergeneCode[]): string {
  if (codes.length === 0) return "";
  return codes.map((c) => LIBELLES_ALLERGENES[c]).join(", ");
}

export function listeIngredientsLibelle(idsIngredients: string[]): string {
  const noms = idsIngredients
    .map((id) => INGREDIENTS.find((i) => i.id === id))
    .filter((i): i is Ingredient => i !== undefined)
    .map((i) => (i.codeE ? `${i.nom} (${i.codeE})` : i.nom));
  return noms.join(", ");
}

export const APPELLATIONS_FR: string[] = [
  "Alsace",
  "Bandol",
  "Beaujolais",
  "Bordeaux",
  "Bourgogne",
  "Cahors",
  "Chablis",
  "Champagne",
  "Châteauneuf-du-Pape",
  "Chinon",
  "Condrieu",
  "Corbières",
  "Côte-Rôtie",
  "Côtes-du-Rhône",
  "Crozes-Hermitage",
  "Gaillac",
  "Gigondas",
  "Hermitage",
  "Jurançon",
  "Madiran",
  "Margaux",
  "Médoc",
  "Meursault",
  "Minervois",
  "Pauillac",
  "Pomerol",
  "Pouilly-Fumé",
  "Saint-Émilion",
  "Saint-Estèphe",
  "Saint-Joseph",
  "Sancerre",
  "Saumur",
  "Vacqueyras",
  "Vouvray",
];

export const REGIONS_VITICOLES: string[] = [
  "Alsace",
  "Bordeaux",
  "Bourgogne",
  "Champagne",
  "Loire",
  "Provence",
  "Rhône",
  "Sud-Ouest",
  "Autre",
];
