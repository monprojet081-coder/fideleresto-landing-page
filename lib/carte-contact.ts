// Cartes de visite digitales de l'équipe (/contact et /contact/[personne])
export type Carte = {
  slug: string
  prenom: string
  nom: string
  titre: string
  telephoneAffiche: string
  telephone: string
}

export const ENTREPRISE = {
  nom: "FidèleResto",
  email: "contact@fideleresto.fr",
  siteAffiche: "fideleresto.fr",
  site: "https://fideleresto.fr",
  accroche: "La fidélité client pour les restaurants indépendants : QR code sur table, roue de la fidélité et avis Google.",
  region: "Alsace · Grand Est",
} as const

export const CARTES: Carte[] = [
  { slug: "bryan", prenom: "Bryan", nom: "Gommenginger", titre: "Fondateur", telephoneAffiche: "07 78 72 66 51", telephone: "+33778726651" },
  { slug: "victor", prenom: "Victor", nom: "Ehrenbogen", titre: "Co-fondateur", telephoneAffiche: "07 86 76 50 98", telephone: "+33786765098" },
]

export const carteParSlug = (slug: string) => CARTES.find((c) => c.slug === slug)
export const nomComplet = (c: Carte) => `${c.prenom} ${c.nom}`
export const urlCarte = (c: Carte) => `${ENTREPRISE.site}/contact/${c.slug}`
export const fichierVcf = (c: Carte) => `${c.prenom}-${c.nom}-FideleResto.vcf`
