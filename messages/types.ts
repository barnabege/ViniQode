// messages/types.ts
import type { TypeVin } from "@/lib/database.types";
import type { AllergeneCode } from "@/lib/ingredients";

export type Messages = {
  elabel: {
    pageTitle: string;
    bannerHeader: string;
    bannerSubheader: string;
    headings: {
      ingredients: string;
      nutrition: string;
    };
    nutrition: {
      per100ml: string;
      energy: string;
      fat: string;
      saturates: string;
      carbs: string;
      sugars: string;
      protein: string;
      salt: string;
    };
    bottle: {
      volumeLabel: string;
      volumeUnit: string;
      alcoholLabel: string;
      alcoholUnit: string;
    };
    allergens: {
      contains: string;
    };
    footer: {
      disclaimer: string;
      lastUpdated: string;
    };
    unavailable: {
      title: string;
      message: string;
    };
    notFound: {
      title: string;
      message: string;
    };
    languageSwitcher: {
      ariaLabel: string;
    };
  };
  typesVin: Record<TypeVin, string>;
  allergenes: Record<AllergeneCode, string>;
  /** Ingredient names keyed by INGREDIENTS[].id */
  ingredients: Record<string, string>;
};
