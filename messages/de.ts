// messages/de.ts
import type { Messages } from "./types";

export const de: Messages = {
  elabel: {
    pageTitle: "Regulatorische Information (EU) 2021/2117",
    bannerHeader: "ViniQode",
    bannerSubheader: "Regulatorische Information — (EU) 2021/2117",
    headings: {
      ingredients: "Zutaten",
      nutrition: "Nährwertdeklaration",
    },
    nutrition: {
      per100ml: "Pro 100 ml",
      energy: "Brennwert",
      fat: "Fett",
      saturates: "davon gesättigte Fettsäuren",
      carbs: "Kohlenhydrate",
      sugars: "davon Zucker",
      protein: "Eiweiß",
      salt: "Salz",
    },
    bottle: {
      volumeLabel: "Volumen",
      volumeUnit: "cl",
      alcoholLabel: "Alkoholgehalt",
      alcoholUnit: "% vol.",
    },
    allergens: {
      contains: "enthält",
    },
    footer: {
      disclaimer:
        "Diese Seite wird gemäß der Verordnung (EU) 2021/2117 zu regulatorischen Informationszwecken bereitgestellt. Beim Aufruf dieser Seite werden keine personenbezogenen Daten erhoben.",
      lastUpdated: "Zuletzt aktualisiert",
    },
    unavailable: {
      title: "Diese Cuvée ist noch nicht verfügbar.",
      message: "Der Erzeuger vervollständigt gerade die rechtlichen Angaben.",
    },
    notFound: {
      title: "Diese E-Label-Seite existiert nicht.",
      message:
        "Der gescannte QR-Code entspricht keiner aktiven Cuvée. Bitte stellen Sie sicher, dass Sie ein authentisches ViniQode-Etikett gescannt haben.",
    },
    languageSwitcher: {
      ariaLabel: "Sprache wechseln",
    },
  },
  typesVin: {
    blanc: "Weißwein",
    rouge: "Rotwein",
    rose: "Roséwein",
    effervescent: "Schaumwein",
    liquoreux: "Süßwein",
    autre: "Andere",
  },
  allergenes: {
    sulfites: "Sulfite",
    oeuf: "Ei",
    lait: "Milch",
    poisson: "Fisch",
    soja: "Soja",
    "fruits-coque": "Schalenfrüchte",
  },
  ingredients: {
    raisins: "Trauben",
    saccharose: "Zucker / Saccharose",
    mrc: "Konzentrierter Traubenmost (KTM)",
    mrcr: "Rektifiziertes Traubenmostkonzentrat (RTK)",
    e334: "Weinsäure",
    e296: "Äpfelsäure",
    e270: "Milchsäure",
    e330: "Zitronensäure",
    e516: "Calciumsulfat",
    e220: "Schwefeldioxid / Sulfite",
    e228: "Kaliumhydrogensulfit",
    e224: "Kaliumdisulfit",
    e202: "Kaliumsorbat",
    e1105: "Lysozym",
    e300: "Ascorbinsäure / Vitamin C",
    e353: "Metaweinsäure",
    e414: "Gummi arabicum",
    mannoproteines: "Hefe-Mannoproteine",
    e466: "Carboxymethylcellulose",
    e456: "Kaliumpolyaspartat",
    froid: "Kältebehandlung",
    filtration: "Filtration",
    bentonite: "Schönung (Bentonit)",
    caseine: "Schönung (Kasein)",
    albumine: "Schönung (Eieralbumin)",
  },
};
