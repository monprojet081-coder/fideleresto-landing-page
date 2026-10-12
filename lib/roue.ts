// Regles communes de la roue de la chance, partagees entre le serveur (/api/roue/jouer)
// et l'affichage client (page /r/[slug], composant RoueChance).

export type Lot = {
  label: string
  probabilite: number
  couleur: string
  /** Ce que le lot coute au restaurateur (prix d'achat), en euros */
  cout?: number | null
  /** Nombre maximum de fois ou ce lot peut sortir par jour */
  max_par_jour?: number | null
  /** Offert a coup sur tous les N passages du meme client (ex : 30 -> a la 30e, 60e... visite) */
  garanti_apres_visites?: number | null
}

// Lot qui signifie "rien gagne" (meme valeur que celle comparee cote serveur)
export const LABEL_PERDU = "Perdu 😢"

// Reglages par defaut PRUDENTS et valables pour tout type de restaurant (kebab, pizzeria,
// restaurant...) : environ 1 client sur 3,5 gagne, le gros lot est rarissime mais garanti
// au 30e passage. Cout moyen ~0,25 EUR par partie. (Avant : 75 % de gagnants.)
export const REWARDS_PAR_DEFAUT: Lot[] = [
  { label: "Boisson offerte 🥤", probabilite: 18, couleur: "#6b1e2e", cout: 0.5 },
  { label: "-10 % sur l'addition 🏷️", probabilite: 10, couleur: "#c9962c", cout: 1.5 },
  { label: "Repas offert 🎁", probabilite: 0.1, couleur: "#3f6b4f", cout: 6, garanti_apres_visites: 30 },
  { label: LABEL_PERDU, probabilite: 71.9, couleur: "#a8536a", cout: 0 },
]

// Modeles prets a l'emploi selon le type de restaurant (couts = estimations de prix d'achat)
export const MODELES_ROUE: { id: string; nom: string; lots: Lot[] }[] = [
  {
    id: "kebab",
    nom: "Kebab / snack",
    lots: [
      { label: "Boisson offerte 🥤", probabilite: 15, couleur: "#6b1e2e", cout: 0.5 },
      { label: "Frites offertes 🍟", probabilite: 12, couleur: "#c9962c", cout: 0.4 },
      { label: "-10 % sur l'addition 🏷️", probabilite: 6, couleur: "#3f6b4f", cout: 1 },
      { label: "Menu offert 🌯", probabilite: 0.1, couleur: "#1f4e5f", cout: 3.5, garanti_apres_visites: 30 },
      { label: LABEL_PERDU, probabilite: 66.9, couleur: "#a8536a", cout: 0 },
    ],
  },
  {
    id: "pizzeria",
    nom: "Pizzeria",
    lots: [
      { label: "Boisson offerte 🥤", probabilite: 15, couleur: "#6b1e2e", cout: 0.5 },
      { label: "Supplément offert 🧀", probabilite: 10, couleur: "#c9962c", cout: 0.4 },
      { label: "-10 % sur l'addition 🏷️", probabilite: 7, couleur: "#3f6b4f", cout: 1.4 },
      { label: "Pizza offerte 🍕", probabilite: 0.1, couleur: "#1f4e5f", cout: 3.5, garanti_apres_visites: 30 },
      { label: LABEL_PERDU, probabilite: 67.9, couleur: "#a8536a", cout: 0 },
    ],
  },
  {
    id: "burger",
    nom: "Burger / fast-food",
    lots: [
      { label: "Boisson offerte 🥤", probabilite: 15, couleur: "#6b1e2e", cout: 0.5 },
      { label: "Frites offertes 🍟", probabilite: 12, couleur: "#c9962c", cout: 0.4 },
      { label: "Sauce ou cookie offert 🍪", probabilite: 10, couleur: "#3f6b4f", cout: 0.3 },
      { label: "Menu offert 🍔", probabilite: 0.1, couleur: "#1f4e5f", cout: 4, garanti_apres_visites: 30 },
      { label: LABEL_PERDU, probabilite: 62.9, couleur: "#a8536a", cout: 0 },
    ],
  },
  {
    id: "restaurant",
    nom: "Restaurant traditionnel",
    lots: [
      { label: "Café offert ☕", probabilite: 18, couleur: "#6b1e2e", cout: 0.3 },
      { label: "Boisson offerte 🥤", probabilite: 10, couleur: "#c9962c", cout: 0.6 },
      { label: "Dessert offert 🍰", probabilite: 7, couleur: "#3f6b4f", cout: 1.2 },
      { label: "Repas offert 🍽️", probabilite: 0.1, couleur: "#1f4e5f", cout: 8, garanti_apres_visites: 30 },
      { label: LABEL_PERDU, probabilite: 64.9, couleur: "#a8536a", cout: 0 },
    ],
  },
]

// Duree du tour de roue (assez longue pour laisser lire les lots) puis pause une fois
// arretee, pour voir sur quoi elle s'est posee avant d'afficher le resultat.
export const DUREE_ROTATION_MS = 8000
export const PAUSE_FIN_MS = 1200
export const PAUSE_AVANT_ROTATION_MS = 700

// Les lots reellement gagnables (on n'affiche pas la case "Perdu" dans la liste)
export function lotsGagnables(lots: Lot[]): Lot[] {
  return lots.filter((l) => l.label !== LABEL_PERDU && l.probabilite > 0)
}

// Formule "1 chance sur X" a partir de la probabilite (en %) reglee par le restaurateur.
// On ecrit "environ" quand l'arrondi n'est pas exact, pour ne jamais annoncer
// une chance plus grande que la vraie sans le dire.
export function chanceSur(probabilite: number): string {
  if (probabilite >= 99.5) return "gagné à coup sûr"

  if (probabilite < 67) {
    const x = Math.max(2, Math.round(100 / probabilite))
    const exact = Math.abs(100 / x - probabilite) < 0.5
    return `${exact ? "" : "environ "}1 chance sur ${x}`
  }

  const n = Math.min(9, Math.max(7, Math.round(probabilite / 10)))
  const exact = Math.abs(n * 10 - probabilite) < 0.5
  return `${exact ? "" : "environ "}${n} chances sur 10`
}

// Choisit une couleur de texte lisible (clair ou fonce) selon la couleur du segment,
// car le restaurateur peut choisir n'importe quelle couleur de fond.
export function couleurTexteSur(fondHex: string): { texte: string; clair: boolean } {
  const m = /^#?([0-9a-f]{6})$/i.exec((fondHex || "").trim())
  if (!m) return { texte: "#faf3e8", clair: true }
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const luminance = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  // On prend la couleur de texte qui offre le meilleur contraste (formule WCAG)
  // avec la luminance du creme #faf3e8 (0.902) et de l'encre #241914 (0.011)
  const contrasteClair = (0.902 + 0.05) / (luminance + 0.05)
  const contrasteFonce = (luminance + 0.05) / (0.011 + 0.05)
  return contrasteFonce > contrasteClair ? { texte: "#241914", clair: false } : { texte: "#faf3e8", clair: true }
}
