import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

// Les 6 tarifs créés dans Stripe (Produits > FidèleResto Standard / Premium)
// Standard : 180€/mois, Premium : 280€/mois — trimestriel -10%, annuel -20%
export const STRIPE_PRICES = {
  standard_mensuel: process.env.STRIPE_PRICE_STANDARD_MENSUEL!,
  standard_trimestriel: process.env.STRIPE_PRICE_STANDARD_TRIMESTRIEL!,
  standard_annuel: process.env.STRIPE_PRICE_STANDARD_ANNUEL!,
  premium_mensuel: process.env.STRIPE_PRICE_PREMIUM_MENSUEL!,
  premium_trimestriel: process.env.STRIPE_PRICE_PREMIUM_TRIMESTRIEL!,
  premium_annuel: process.env.STRIPE_PRICE_PREMIUM_ANNUEL!,
} as const

// Options, disponibles uniquement en formule mensuelle (voir create-checkout-session)
// Frais uniques de mise en place, puis abonnement mensuel de suivi
export const STRIPE_PRICE_FRAIS_SITE = process.env.STRIPE_PRICE_FRAIS_SITE!
export const STRIPE_PRICE_MAINTENANCE_SITE = process.env.STRIPE_PRICE_MAINTENANCE_SITE!
export const STRIPE_PRICE_FRAIS_RESEAUX = process.env.STRIPE_PRICE_FRAIS_RESEAUX!
export const STRIPE_PRICE_GESTION_RESEAUX = process.env.STRIPE_PRICE_GESTION_RESEAUX!

export type PlanKey = keyof typeof STRIPE_PRICES

// Périodicité déduite d'une clé de plan (ex: "standard_trimestriel" -> "trimestriel")
export function periodeDuPlan(plan: PlanKey): 'mensuel' | 'trimestriel' | 'annuel' {
  if (plan.endsWith('trimestriel')) return 'trimestriel'
  if (plan.endsWith('annuel')) return 'annuel'
  return 'mensuel'
}
