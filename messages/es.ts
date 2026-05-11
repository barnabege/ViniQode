// messages/es.ts
import type { Messages } from "./types";

export const es: Messages = {
  elabel: {
    pageTitle: "Información reglamentaria (UE) 2021/2117",
    bannerHeader: "ViniQode",
    bannerSubheader: "Información reglamentaria — (UE) 2021/2117",
    headings: {
      ingredients: "Ingredientes",
      nutrition: "Información nutricional",
    },
    nutrition: {
      per100ml: "Por 100 ml",
      energy: "Valor energético",
      fat: "Grasas",
      saturates: "de las cuales saturadas",
      carbs: "Hidratos de carbono",
      sugars: "de los cuales azúcares",
      protein: "Proteínas",
      salt: "Sal",
    },
    bottle: {
      volumeLabel: "Volumen",
      volumeUnit: "cl",
      alcoholLabel: "Grado alcohólico",
      alcoholUnit: "% vol.",
    },
    allergens: {
      contains: "contiene",
    },
    footer: {
      disclaimer:
        "Esta página se proporciona a título informativo reglamentario de conformidad con el reglamento (UE) 2021/2117. No se recopila ningún dato personal durante la consulta de esta página.",
      lastUpdated: "Última actualización",
    },
    unavailable: {
      title: "Esta cuvée aún no está disponible.",
      message: "El productor está finalizando la información legal.",
    },
    notFound: {
      title: "Esta página e-label no existe.",
      message:
        "El código QR escaneado no corresponde a ninguna cuvée activa. Compruebe que ha escaneado una etiqueta ViniQode auténtica.",
    },
    languageSwitcher: {
      ariaLabel: "Cambiar idioma",
    },
  },
  typesVin: {
    blanc: "Blanco",
    rouge: "Tinto",
    rose: "Rosado",
    effervescent: "Espumoso",
    liquoreux: "Dulce",
    autre: "Otro",
  },
  allergenes: {
    sulfites: "Sulfitos",
    oeuf: "Huevo",
    lait: "Leche",
    poisson: "Pescado",
    soja: "Soja",
    "fruits-coque": "Frutos de cáscara",
  },
  ingredients: {
    raisins: "Uvas",
    saccharose: "Azúcar / Sacarosa",
    mrc: "Mosto de uva concentrado (MC)",
    mrcr: "Mosto de uva concentrado rectificado (MCR)",
    e334: "Ácido tartárico",
    e296: "Ácido málico",
    e270: "Ácido láctico",
    e330: "Ácido cítrico",
    e516: "Sulfato de calcio",
    e220: "Dióxido de azufre / Sulfitos",
    e228: "Bisulfito de potasio",
    e224: "Metabisulfito de potasio",
    e202: "Sorbato de potasio",
    e1105: "Lisozima",
    e300: "Ácido ascórbico / Vitamina C",
    e353: "Ácido metatartárico",
    e414: "Goma arábiga",
    mannoproteines: "Manoproteínas de levadura",
    e466: "Carboximetilcelulosa",
    e456: "Poliaspartato de potasio",
    froid: "Tratamiento por frío",
    filtration: "Filtración",
    bentonite: "Clarificación (bentonita)",
    caseine: "Clarificación (caseína)",
    albumine: "Clarificación (albúmina de huevo)",
  },
};
