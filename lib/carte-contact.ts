// Coordonnées de la carte de visite digitale (/contact) et de la vCard associée
export const CARTE = {
  prenom: "Victor",
  nom: "Ehrenbogen",
  titre: "Fondateur",
  entreprise: "FidèleResto",
  telephoneAffiche: "07 78 72 66 51",
  telephone: "+33778726651",
  email: "contact@fideleresto.fr",
  siteAffiche: "fideleresto.fr",
  site: "https://fideleresto.fr",
  url: "https://fideleresto.fr/contact",
  accroche: "La fidélité client pour les restaurants indépendants : QR code sur table, roue de la fidélité et avis Google.",
  region: "Alsace · Grand Est",
} as const

export const NOM_COMPLET = `${CARTE.prenom} ${CARTE.nom}`
