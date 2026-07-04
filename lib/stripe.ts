import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

// Les 4 tarifs créés dans Stripe (Produits > FidèleResto Standard / Premium)
export const STRIPE_PRICES = {
  standard_mensuel: process.env.STRIPE_PRICE_STANDARD_MENSUEL!,
  standard_annuel: process.env.STRIPE_PRICE_STANDARD_ANNUEL!,
  premium_mensuel: process.env.STRIPE_PRICE_PREMIUM_MENSUEL!,
  premium_annuel: process.env.STRIPE_PRICE_PREMIUM_ANNUEL!,
} as const

export type PlanKey = keyof typeof STRIPE_PRICES
