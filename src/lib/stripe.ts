import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PRICE_IDS = {
  SUPPORTER: process.env.STRIPE_PRICE_SUPPORTER!,
  PATRON: process.env.STRIPE_PRICE_PATRON!,
  INNER_CIRCLE: process.env.STRIPE_PRICE_INNER_CIRCLE!,
} as const;
