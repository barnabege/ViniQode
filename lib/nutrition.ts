// lib/nutrition.ts
//
// Calcul réglementaire des valeurs nutritionnelles d'un vin (pour 100 ml)
// Référentiel : tables DGCCRF / IFV simplifiées + formule de calcul
// par composition (alcool, sucres, glycérol, acides organiques).

export interface NutritionInput {
  /** Degré alcoolique en % vol (ex. 12.5) */
  degreAlcool: number;
  /** Sucres résiduels en g/L (ex. 2) */
  sucresResiduels: number;
}

export interface NutritionValues {
  /** Énergie en kJ pour 100 ml */
  energieKj: number;
  /** Énergie en kcal pour 100 ml */
  energieKcal: number;
  /** Matières grasses (g / 100 ml) */
  matieresGrasses: number;
  /** Acides gras saturés (g / 100 ml) */
  acidesGrasSatures: number;
  /** Glucides (g / 100 ml) */
  glucides: number;
  /** dont sucres (g / 100 ml) */
  sucres: number;
  /** Protéines (g / 100 ml) */
  proteines: number;
  /** Sel (g / 100 ml) */
  sel: number;
  /** Source du calcul ("table" ou "formule") */
  source: "table" | "formule";
}

const GLYCEROL_FIXE_G_PAR_L = 7; // valeur réglementaire fixe
const ACIDES_ORGANIQUES_FIXE_G_PAR_L = 5;

interface Tranche {
  alcoolMin: number;
  alcoolMax: number;
  sucresMin: number;
  sucresMax: number;
  kj: number;
  kcal: number;
}

const TABLE_DGCCRF: Tranche[] = [
  { alcoolMin: 8.5, alcoolMax: 11, sucresMin: 0, sucresMax: 4, kj: 234, kcal: 56 },
  { alcoolMin: 11, alcoolMax: 12, sucresMin: 0, sucresMax: 4, kj: 267, kcal: 64 },
  { alcoolMin: 12, alcoolMax: 15, sucresMin: 0, sucresMax: 4, kj: 328, kcal: 79 },
  { alcoolMin: 12, alcoolMax: 15, sucresMin: 4, sucresMax: 12, kj: 356, kcal: 85 },
  { alcoolMin: 12, alcoolMax: 15, sucresMin: 12, sucresMax: 45, kj: 440, kcal: 105 },
];

function trouverTranche(input: NutritionInput): Tranche | null {
  return (
    TABLE_DGCCRF.find(
      (t) =>
        input.degreAlcool >= t.alcoolMin &&
        input.degreAlcool < t.alcoolMax &&
        input.sucresResiduels >= t.sucresMin &&
        input.sucresResiduels < t.sucresMax,
    ) ?? null
  );
}

/**
 * Formule de calcul :
 *   Énergie (kJ / 100 ml) =
 *     (alcool% × 10 × 29 × 0.789)         // éthanol → 29 kJ/g, densité 0.789
 *     + (sucres g/L × 0.1 × 17)           // glucides → 17 kJ/g
 *     + (glycérol g/L × 0.1 × 18)         // glycérol → 18 kJ/g
 *     + (acides organiques g/L × 0.1 × 13)
 */
function calculerParFormule(input: NutritionInput): { kj: number; kcal: number } {
  const energieAlcoolKj = input.degreAlcool * 10 * 29 * 0.789;
  const energieSucresKj = input.sucresResiduels * 0.1 * 17;
  const energieGlycerolKj = GLYCEROL_FIXE_G_PAR_L * 0.1 * 18;
  const energieAcidesKj = ACIDES_ORGANIQUES_FIXE_G_PAR_L * 0.1 * 13;

  const totalKj =
    energieAlcoolKj + energieSucresKj + energieGlycerolKj + energieAcidesKj;
  const totalKcal = totalKj / 4.184;

  return {
    kj: Math.round(totalKj / 100), // ramener à 100 ml
    kcal: Math.round(totalKcal / 100),
  };
}

export function calculerNutrition(input: NutritionInput): NutritionValues {
  const tranche = trouverTranche(input);

  let energieKj: number;
  let energieKcal: number;
  let source: "table" | "formule";

  if (tranche) {
    energieKj = tranche.kj;
    energieKcal = tranche.kcal;
    source = "table";
  } else {
    const calc = calculerParFormule(input);
    energieKj = calc.kj;
    energieKcal = calc.kcal;
    source = "formule";
  }

  const sucresPer100ml = Math.round((input.sucresResiduels / 10) * 10) / 10;

  return {
    energieKj,
    energieKcal,
    matieresGrasses: 0,
    acidesGrasSatures: 0,
    glucides: sucresPer100ml,
    sucres: sucresPer100ml,
    proteines: 0,
    sel: 0,
    source,
  };
}
