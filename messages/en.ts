// messages/en.ts
import type { Messages } from "./types";

export const en: Messages = {
  elabel: {
    pageTitle: "Regulatory information (EU) 2021/2117",
    bannerHeader: "ViniQode",
    bannerSubheader: "Regulatory information — (EU) 2021/2117",
    headings: {
      ingredients: "Ingredients",
      nutrition: "Nutrition declaration",
    },
    nutrition: {
      per100ml: "Per 100 ml",
      energy: "Energy",
      fat: "Fat",
      saturates: "of which saturates",
      carbs: "Carbohydrate",
      sugars: "of which sugars",
      protein: "Protein",
      salt: "Salt",
    },
    bottle: {
      volumeLabel: "Volume",
      volumeUnit: "cl",
      alcoholLabel: "Alcohol by volume",
      alcoholUnit: "% vol.",
    },
    allergens: {
      contains: "contains",
    },
    footer: {
      disclaimer:
        "This page is provided for regulatory information purposes in accordance with Regulation (EU) 2021/2117. No personal data is collected when viewing this page.",
      lastUpdated: "Last updated",
    },
    unavailable: {
      title: "This cuvée is not yet available.",
      message: "The producer is finalising the legal information.",
    },
    notFound: {
      title: "This e-label page does not exist.",
      message:
        "The QR code you scanned does not match any active cuvée. Please make sure you scanned an authentic ViniQode label.",
    },
    languageSwitcher: {
      ariaLabel: "Change language",
    },
  },
  typesVin: {
    blanc: "White",
    rouge: "Red",
    rose: "Rosé",
    effervescent: "Sparkling",
    liquoreux: "Sweet",
    autre: "Other",
  },
  allergenes: {
    sulfites: "Sulphites",
    oeuf: "Egg",
    lait: "Milk",
    poisson: "Fish",
    soja: "Soya",
    "fruits-coque": "Tree nuts",
  },
  ingredients: {
    raisins: "Grapes",
    saccharose: "Sugar / Sucrose",
    mrc: "Concentrated grape must (CGM)",
    mrcr: "Rectified concentrated grape must (RCGM)",
    e334: "Tartaric acid",
    e296: "Malic acid",
    e270: "Lactic acid",
    e330: "Citric acid",
    e516: "Calcium sulphate",
    e220: "Sulphur dioxide / Sulphites",
    e228: "Potassium bisulphite",
    e224: "Potassium metabisulphite",
    e202: "Potassium sorbate",
    e1105: "Lysozyme",
    e300: "Ascorbic acid / Vitamin C",
    e353: "Metatartaric acid",
    e414: "Gum arabic",
    mannoproteines: "Yeast mannoproteins",
    e466: "Carboxymethylcellulose",
    e456: "Potassium polyaspartate",
    froid: "Cold treatment",
    filtration: "Filtration",
    bentonite: "Fining (bentonite)",
    caseine: "Fining (casein)",
    albumine: "Fining (egg albumin)",
  },
};
