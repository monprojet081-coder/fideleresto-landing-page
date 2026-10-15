// Source UNIQUE des tarifs FideleResto, partagee entre la landing page (pricing-section.tsx)
// et le dashboard (onglet Abonnement). Ne plus jamais dupliquer ces donnees ailleurs --
// on a deja ete pris une fois avec deux copies desynchronisees.

// Mettre a false une fois l'offre de lancement terminee (3 mois apres son lancement),
// puis mettre a jour STRIPE_PRICE_STANDARD_MENSUEL sur Vercel vers le nouveau prix plein.
export const OFFRE_LANCEMENT_ACTIVE = true

// Option creation de site (frais uniques + maintenance). Affichee seulement a l'inscription
// et dans l'onglet Abonnement, pas sur la landing.
// Le montant reellement facture vient du Price Stripe STRIPE_PRICE_FRAIS_SITE : s'il change,
// creer un nouveau Price dans Stripe, mettre a jour la variable sur Vercel, redeployer sans cache.
export const OPTION_SITE = {
  offreLancementActive: true,
  fraisUniques: 500,
  fraisUniquesBarre: 1000,
  maintenance: { mensuel: 100, semestriel: 600, annuel: 1200 },
}

export function libelleMaintenanceSite(periode: "mensuel" | "semestriel" | "annuel") {
  const m = OPTION_SITE.maintenance
  return periode === "annuel" ? `${m.annuel}€/an` : periode === "semestriel" ? `${m.semestriel}€/semestre` : `${m.mensuel}€/mois`
}

export type PlanKeyPublic = "essentiel" | "standard"
export type Periode = "mensuel" | "semestriel" | "annuel"

// Remises de base, identiques pour les deux plans
export const REMISE = { semestriel: 0.1, annuel: 0.2 }
const COMPLET_PLEIN_TARIF = 180
const COMPLET_LANCEMENT = 120
const arrondi = (n: number) => Math.round(n)
const prixComplet = OFFRE_LANCEMENT_ACTIVE ? COMPLET_LANCEMENT : COMPLET_PLEIN_TARIF

export const plans: {
  key: PlanKeyPublic
  nom: string
  description: string
  prixMensuel: number
  /** prix "barre" (avant offre de lancement, mensuel uniquement), ou null */
  prixBarre: number | null
  prixSemestriel: number
  prixAnnuel: number
  totalSemestriel: number
  totalAnnuel: number
  essaiGratuit: boolean
  highlight: boolean
  periodesDisponibles: boolean
  features: string[]
  nonInclus: string[]
}[] = [
  {
    key: "essentiel",
    nom: "Essentiel",
    description: "L'essentiel pour commencer à fidéliser",
    prixMensuel: 50,
    prixBarre: null,
    prixSemestriel: 45,
    prixAnnuel: 40,
    totalSemestriel: 270,
    totalAnnuel: 480,
    essaiGratuit: false,
    highlight: false,
    periodesDisponibles: true,
    features: [
      "Roue de la fidélité",
      "Tri des avis négatifs (retours privés envoyés au restaurant)",
      "Tableau de bord de suivi",
      "Option création de site",
    ],
    nonInclus: [
      "Carte de fidélité digitale",
      "Menu digital",
      "Emails de relance automatiques",
      "Statistiques avancées (heures de pointe, évolution)",
      "Accompagnement personnalisé",
      "Flyers fournis et traduits sur demande",
    ],
  },
  {
    key: "standard",
    nom: "Complet",
    description: "Tout FidèleResto, sans rien laisser de côté",
    // Offre de lancement (2-3 mois) : uniquement en MENSUEL, 120 € au lieu de 180 €.
    // Pendant l'offre, le semestriel et l'annuel ne sont pas proposes (ils seraient plus chers
    // que le mensuel en promo). Ils reviennent automatiquement quand OFFRE_LANCEMENT_ACTIVE = false :
    // 162 €/mois en semestriel (972 €), 144 €/mois en annuel (1 728 €), sur la base de 180 €.
    prixMensuel: prixComplet,
    prixBarre: OFFRE_LANCEMENT_ACTIVE ? COMPLET_PLEIN_TARIF : null,
    prixSemestriel: arrondi(COMPLET_PLEIN_TARIF * (1 - REMISE.semestriel)),
    prixAnnuel: arrondi(COMPLET_PLEIN_TARIF * (1 - REMISE.annuel)),
    totalSemestriel: arrondi(COMPLET_PLEIN_TARIF * (1 - REMISE.semestriel)) * 6,
    totalAnnuel: arrondi(COMPLET_PLEIN_TARIF * (1 - REMISE.annuel)) * 12,
    essaiGratuit: true,
    highlight: true,
    periodesDisponibles: !OFFRE_LANCEMENT_ACTIVE,
    features: [
      "Roue de la fidélité + plus d'avis Google",
      "Tri des avis négatifs (retours privés envoyés au restaurant)",
      "Statistiques avancées (heures de pointe, évolution)",
      "Accompagnement personnalisé",
      "3 modèles de flyers, fournis et traduits sur demande",
      "Emails de relance automatiques",
      "Menu digital",
      "Carte de fidélité digitale",
      "Traduction de l'application sur demande",
      "Option création de site",
    ],
    nonInclus: [],
  },
]

/** Prix affiche pour une periode : prix mensuel, prix barre eventuel, total facture */
export function prixPour(plan: (typeof plans)[number], periode: Periode) {
  const p = plan.periodesDisponibles ? periode : "mensuel"
  return {
    periode: p,
    prix: p === "mensuel" ? plan.prixMensuel : p === "semestriel" ? plan.prixSemestriel : plan.prixAnnuel,
    barre: p === "mensuel" ? plan.prixBarre : null,
    /** vrai si la periode demandee n'est pas proposee pour ce plan (affichage en mensuel) */
    seulementMensuel: p !== periode,
    total: p === "semestriel" ? plan.totalSemestriel : p === "annuel" ? plan.totalAnnuel : null,
  }
}
