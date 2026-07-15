import Stripe from 'stripe'

// Créé à la demande, pas au chargement du module — sinon Next.js essaie de l'exécuter
// pendant l'étape de build "Collecting page data" et ça plante tout le build si la
// variable d'env n'est pas dispo à ce moment précis
export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-06-24.dahlia',
  })
}

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

// Options, disponibles sur le Premium, quel que soit le rythme choisi (mensuel/trimestriel/annuel)
// Frais uniques de mise en place, toujours au même montant peu importe le rythme
export const STRIPE_PRICE_FRAIS_SITE = process.env.STRIPE_PRICE_FRAIS_SITE!
export const STRIPE_PRICE_FRAIS_RESEAUX = process.env.STRIPE_PRICE_FRAIS_RESEAUX!

// Abonnements de suivi (maintenance / gestion), au tarif plein multiplié par la durée
// (pas de remise -10%/-20% dessus, contrairement au plan principal), et surtout : leur
// fréquence doit matcher celle du plan principal, car Stripe ne peut pas mélanger deux
// fréquences de facturation différentes dans un seul abonnement
export const STRIPE_PRICE_MAINTENANCE_SITE = {
  mensuel: process.env.STRIPE_PRICE_MAINTENANCE_SITE_MENSUEL!,
  trimestriel: process.env.STRIPE_PRICE_MAINTENANCE_SITE_TRIMESTRIEL!,
  annuel: process.env.STRIPE_PRICE_MAINTENANCE_SITE_ANNUEL!,
} as const

export const STRIPE_PRICE_GESTION_RESEAUX = {
  mensuel: process.env.STRIPE_PRICE_GESTION_RESEAUX_MENSUEL!,
  trimestriel: process.env.STRIPE_PRICE_GESTION_RESEAUX_TRIMESTRIEL!,
  annuel: process.env.STRIPE_PRICE_GESTION_RESEAUX_ANNUEL!,
} as const

export type PlanKey = keyof typeof STRIPE_PRICES

// Périodicité déduite d'une clé de plan (ex: "standard_trimestriel" -> "trimestriel")
export function periodeDuPlan(plan: PlanKey): 'mensuel' | 'trimestriel' | 'annuel' {
  if (plan.endsWith('trimestriel')) return 'trimestriel'
  if (plan.endsWith('annuel')) return 'annuel'
  return 'mensuel'
}
