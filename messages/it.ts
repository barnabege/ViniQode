// messages/it.ts
import type { Messages } from "./types";

export const it: Messages = {
  elabel: {
    pageTitle: "Informazione regolamentare (UE) 2021/2117",
    bannerHeader: "ViniQode",
    bannerSubheader: "Informazione regolamentare — (UE) 2021/2117",
    headings: {
      ingredients: "Ingredienti",
      nutrition: "Dichiarazione nutrizionale",
    },
    nutrition: {
      per100ml: "Per 100 ml",
      energy: "Valore energetico",
      fat: "Grassi",
      saturates: "di cui acidi grassi saturi",
      carbs: "Carboidrati",
      sugars: "di cui zuccheri",
      protein: "Proteine",
      salt: "Sale",
    },
    bottle: {
      volumeLabel: "Volume",
      volumeUnit: "cl",
      alcoholLabel: "Titolo alcolometrico",
      alcoholUnit: "% vol.",
    },
    allergens: {
      contains: "contiene",
    },
    footer: {
      disclaimer:
        "Questa pagina è fornita a titolo di informazione regolamentare ai sensi del regolamento (UE) 2021/2117. Nessun dato personale viene raccolto durante la consultazione di questa pagina.",
      lastUpdated: "Ultimo aggiornamento",
    },
    unavailable: {
      title: "Questa cuvée non è ancora disponibile.",
      message: "Il produttore sta finalizzando le informazioni legali.",
    },
    notFound: {
      title: "Questa pagina e-label non esiste.",
      message:
        "Il codice QR scansionato non corrisponde ad alcuna cuvée attiva. Verifica di aver scansionato un'etichetta ViniQode autentica.",
    },
    languageSwitcher: {
      ariaLabel: "Cambia lingua",
    },
  },
  typesVin: {
    blanc: "Bianco",
    rouge: "Rosso",
    rose: "Rosato",
    effervescent: "Spumante",
    liquoreux: "Dolce",
    autre: "Altro",
  },
  allergenes: {
    sulfites: "Solfiti",
    oeuf: "Uovo",
    lait: "Latte",
    poisson: "Pesce",
    soja: "Soia",
    "fruits-coque": "Frutta a guscio",
  },
  ingredients: {
    raisins: "Uva",
    saccharose: "Zucchero / Saccarosio",
    mrc: "Mosto d'uva concentrato (MC)",
    mrcr: "Mosto d'uva concentrato rettificato (MCR)",
    e334: "Acido tartarico",
    e296: "Acido malico",
    e270: "Acido lattico",
    e330: "Acido citrico",
    e516: "Solfato di calcio",
    e220: "Anidride solforosa / Solfiti",
    e228: "Bisolfito di potassio",
    e224: "Metabisolfito di potassio",
    e202: "Sorbato di potassio",
    e1105: "Lisozima",
    e300: "Acido ascorbico / Vitamina C",
    e353: "Acido metatartarico",
    e414: "Gomma arabica",
    mannoproteines: "Mannoproteine di lievito",
    e466: "Carbossimetilcellulosa",
    e456: "Poliaspartato di potassio",
    froid: "Trattamento a freddo",
    filtration: "Filtrazione",
    bentonite: "Chiarifica (bentonite)",
    caseine: "Chiarifica (caseina)",
    albumine: "Chiarifica (albumina d'uovo)",
  },
};
