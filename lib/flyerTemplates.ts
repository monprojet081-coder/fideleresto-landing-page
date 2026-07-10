// Configuration des 6 modèles de flyer FidèleResto.
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
  plan: "standard" | "premium"
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
    id: "standard-1",
    plan: "standard",
    nom: "Noir & Or",
    fichierPng: "/flyers/standard-1.png",
    fichierThumb: "/flyers/standard-1-thumb.jpg",
    largeurPx: 1054,
    hauteurPx: 1492,
    interieurClair: true,
    banniere: { xPct: 8.0, yPct: 3.3, wPct: 83.4, hPct: 13.6 },
    qr: { xPct: 33.9, yPct: 67.4, wPct: 31.4, hPct: 20.7 },
  },
  {
    id: "standard-2",
    plan: "standard",
    nom: "Rose Néon",
    fichierPng: "/flyers/standard-2.png",
    fichierThumb: "/flyers/standard-2-thumb.jpg",
    largeurPx: 1054,
    hauteurPx: 1492,
    interieurClair: false,
    banniere: { xPct: 14.6, yPct: 4.4, wPct: 70.7, hPct: 10.3 },
    qr: { xPct: 34.6, yPct: 66.4, wPct: 30.3, hPct: 22.4 },
  },
  {
    id: "standard-3",
    plan: "standard",
    nom: "Vert Guinguette",
    fichierPng: "/flyers/standard-3.png",
    fichierThumb: "/flyers/standard-3-thumb.jpg",
    largeurPx: 1254,
    hauteurPx: 1254,
    interieurClair: true,
    banniere: { xPct: 10.5, yPct: 4.3, wPct: 79.1, hPct: 12.7 },
    qr: { xPct: 11.1, yPct: 62.5, wPct: 21.4, hPct: 20.4 },
  },
  {
    id: "premium-1",
    plan: "premium",
    nom: "Noir & Or Gourmet",
    fichierPng: "/flyers/premium-1.png",
    fichierThumb: "/flyers/premium-1-thumb.jpg",
    largeurPx: 1054,
    hauteurPx: 1492,
    interieurClair: false,
    banniere: { xPct: 14.9, yPct: 2.3, wPct: 70.8, hPct: 10.5 },
    qr: { xPct: 4.6, yPct: 63.3, wPct: 17.7, hPct: 12.5 },
  },
  {
    id: "premium-2",
    plan: "premium",
    nom: "Rose Néon Gourmet",
    fichierPng: "/flyers/premium-2.png",
    fichierThumb: "/flyers/premium-2-thumb.jpg",
    largeurPx: 1054,
    hauteurPx: 1492,
    interieurClair: false,
    banniere: { xPct: 13.9, yPct: 2.9, wPct: 72.2, hPct: 9.9 },
    qr: { xPct: 4.9, yPct: 66.3, wPct: 17.2, hPct: 11.9 },
  },
  {
    id: "premium-3",
    plan: "premium",
    nom: "Vert Guinguette Gourmet",
    fichierPng: "/flyers/premium-3.png",
    fichierThumb: "/flyers/premium-3-thumb.jpg",
    largeurPx: 1254,
    hauteurPx: 1254,
    interieurClair: true,
    banniere: { xPct: 14.5, yPct: 3.6, wPct: 70.7, hPct: 10.5 },
    qr: { xPct: 12.3, yPct: 54.9, wPct: 21.8, hPct: 21.0 },
  },
]
