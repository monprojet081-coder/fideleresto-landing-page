// Source UNIQUE des tarifs FideleResto, partagee entre la landing page (pricing-section.tsx)
// et le dashboard (onglet Abonnement). Ne plus jamais dupliquer ces donnees ailleurs --
// on a deja ete pris une fois avec deux copies desynchronisees.

// Mettre a false une fois l'offre de lancement terminee (3 mois apres son lancement),
// puis mettre a jour STRIPE_PRICE_STANDARD_MENSUEL sur Vercel vers le nouveau prix plein.
export const OFFRE_LANCEMENT_ACTIVE = true

export type PlanKeyPublic = "essentiel" | "standard"

export const plans: {
  key: PlanKeyPublic
  nom: string
  description: string
  prixMensuel: number
  prixBarre: number | null
  prixSemestriel: number
  prixAnnuel: number
  totalSemestriel: number
  totalAnnuel: number
  essaiGratuit: boolean
  highlight: boolean
  periodesDisponibles: boolean
  features: string[]
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
      "Alerte insatisfaction (protège votre note Google)",
    ],
  },
  {
    key: "standard",
    nom: "Complet",
    description: "Tout FidèleResto, sans rien laisser de côté",
    prixMensuel: OFFRE_LANCEMENT_ACTIVE ? 120 : 180,
    prixBarre: OFFRE_LANCEMENT_ACTIVE ? 180 : null,
    prixSemestriel: 162,
    prixAnnuel: 144,
    totalSemestriel: 972,
    totalAnnuel: 1728,
    essaiGratuit: true,
    highlight: true,
    periodesDisponibles: true,
    features: [
      "Roue de la fidélité + boost avis Google",
      "Alerte insatisfaction (protège votre note Google)",
      "Statistiques avancées (heures de pointe, évolution)",
      "Accompagnement personnalisé",
      "3 modèles de flyers, fournis et traduits sur demande",
      "Emails de relance automatiques",
      "Menu digital",
      "Carte de fidélité digitale",
      "Traduction de l'application sur demande",
      "Option création de site et gestion des réseaux",
    ],
  },
]
