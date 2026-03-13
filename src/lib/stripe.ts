import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PRICE_IDS = {
  SUPPORTER: process.env.STRIPE_PRICE_SUPPORTER!,
  PATRON: process.env.STRIPE_PRICE_PATRON!,
  INNER_CIRCLE: process.env.STRIPE_PRICE_INNER_CIRCLE!,
} as const;
