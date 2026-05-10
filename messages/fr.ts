// messages/fr.ts
import type { Messages } from "./types";

export const fr: Messages = {
  elabel: {
    pageTitle: "Information réglementaire (UE) 2021/2117",
    bannerHeader: "ViniQode",
    bannerSubheader: "Information réglementaire — (UE) 2021/2117",
    headings: {
      ingredients: "Ingrédients",
      nutrition: "Déclaration nutritionnelle",
    },
    nutrition: {
      per100ml: "Pour 100 ml",
      energy: "Valeur énergétique",
      fat: "Matières grasses",
      saturates: "dont acides gras saturés",
      carbs: "Glucides",
      sugars: "dont sucres",
      protein: "Protéines",
      salt: "Sel",
    },
    bottle: {
      volumeLabel: "Volume",
      volumeUnit: "cl",
      alcoholLabel: "Titre alcoométrique",
      alcoholUnit: "% vol.",
    },
    allergens: {
      contains: "contient",
    },
    footer: {
      disclaimer:
        "Cette page est fournie à titre d'information réglementaire conformément au règlement (UE) 2021/2117. Aucune donnée personnelle n'est collectée lors de la consultation de cette page.",
      lastUpdated: "Dernière mise à jour",
    },
    unavailable: {
      title: "Cette cuvée n'est pas encore disponible.",
      message: "Le producteur finalise les informations légales.",
    },
    notFound: {
      title: "Cette page e-label n'existe pas.",
      message:
        "Le QR code que vous avez scanné ne correspond à aucune cuvée active. Veuillez vérifier que vous avez scanné une étiquette ViniQode authentique.",
    },
    languageSwitcher: {
      ariaLabel: "Changer de langue",
    },
  },
  typesVin: {
    blanc: "Blanc",
    rouge: "Rouge",
    rose: "Rosé",
    effervescent: "Effervescent",
    liquoreux: "Liquoreux",
    autre: "Autre",
  },
  allergenes: {
    sulfites: "Sulfites",
    oeuf: "Œuf",
    lait: "Lait",
    poisson: "Poisson",
    soja: "Soja",
    "fruits-coque": "Fruits à coque",
  },
  ingredients: {
    raisins: "Raisins",
    saccharose: "Sucre / Saccharose",
    mrc: "Moût de raisin concentré (MRC)",
    mrcr: "Moût de raisin concentré rectifié (MRCR)",
    e334: "Acide tartrique",
    e296: "Acide malique",
    e270: "Acide lactique",
    e330: "Acide citrique",
    e516: "Sulfate de calcium",
    e220: "Dioxyde de soufre / Sulfites",
    e228: "Bisulfite de potassium",
    e224: "Métabisulfite de potassium",
    e202: "Sorbate de potassium",
    e1105: "Lysozyme",
    e300: "Acide ascorbique / Vitamine C",
    e353: "Acide métatartrique",
    e414: "Gomme arabique",
    mannoproteines: "Mannoprotéines de levure",
    e466: "Carboxyméthylcellulose",
    e456: "Polyaspartate de potassium",
    froid: "Traitement par le froid",
    filtration: "Filtration",
    bentonite: "Collage (bentonite)",
    caseine: "Collage (caséine)",
    albumine: "Collage (albumine d'œuf)",
  },
};
