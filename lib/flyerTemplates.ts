// Configuration des 3 modèles de flyer FidèleResto (disponibles pour tous les plans,
// puisque roue + menu digital + carte de fidélité sont inclus dans Standard et Premium).
// Toutes les coordonnées sont en pourcentage de la largeur/hauteur de l'image
// (mesurées à la main sur chaque visuel), pour placer le nom/logo et le QR code
// automatiquement au bon endroit, quelle que soit la taille finale du PDF.

export type ZoneFlyer = {
  xPct: number // position gauche en %
  yPct: number // position haut en %
  wPct: number // largeur en %
  hPct: number // hauteur en %
}

export type ModeleFlyer = {
  id: string
  nom: string
  fichierPng: string   // utilisé pour le PDF final (haute résolution)
  fichierThumb: string // utilisé pour l'aperçu dans le dashboard (léger)
  largeurPx: number
  hauteurPx: number
  interieurClair: boolean // true = fond clair dans la bannière -> texte foncé, false = fond sombre -> texte clair
  banniere: ZoneFlyer // zone réservée au nom du restaurant + logo
  qr: ZoneFlyer        // zone réservée au QR code
}

export const MODELES_FLYER: ModeleFlyer[] = [
  {
    id: "noir-or",
    nom: "Noir & Or",
    fichierPng: "/flyers/premium-1.png",
    fichierThumb: "/flyers/premium-1-thumb.jpg",
    largeurPx: 1054,
    hauteurPx: 1492,
    interieurClair: false,
    banniere: { xPct: 14.9, yPct: 2.3, wPct: 70.8, hPct: 10.5 },
    qr: { xPct: 4.6, yPct: 63.3, wPct: 17.7, hPct: 12.5 },
  },
  {
    id: "rose-neon",
    nom: "Rose Néon",
    fichierPng: "/flyers/premium-2.png",
    fichierThumb: "/flyers/premium-2-thumb.jpg",
    largeurPx: 1054,
    hauteurPx: 1492,
    interieurClair: false,
    banniere: { xPct: 13.9, yPct: 2.9, wPct: 72.2, hPct: 9.9 },
    qr: { xPct: 4.9, yPct: 66.3, wPct: 17.2, hPct: 11.9 },
  },
  {
    id: "vert-guinguette",
    nom: "Vert Guinguette",
    fichierPng: "/flyers/premium-3.png",
    fichierThumb: "/flyers/premium-3-thumb.jpg",
    largeurPx: 1254,
    hauteurPx: 1254,
    interieurClair: true,
    banniere: { xPct: 14.5, yPct: 3.6, wPct: 70.7, hPct: 10.5 },
    qr: { xPct: 12.3, yPct: 54.9, wPct: 21.8, hPct: 21.0 },
  },
]
