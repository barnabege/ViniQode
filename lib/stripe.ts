// lib/stripe.ts
import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("STRIPE_SECRET_KEY manquante.");
    }
    stripeSingleton = new Stripe(secret, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeSingleton;
}

export const STRIPE_PRICES = {
  essentiel: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL ?? "",
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
} as const;
