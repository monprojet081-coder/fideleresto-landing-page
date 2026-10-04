// Regles communes aux recompenses de la roue : duree de validite, statut d'un gain,
// regroupement des parties par client. Utilise par le dashboard et les routes API.

export const DUREE_VALIDITE_JOURS = 10

export type LigneClient = {
  id: string
  prenom: string
  email: string
  a_gagne: boolean
  recompense: string | null
  created_at: string
  recompense_utilisee?: boolean | null
  recompense_utilisee_le?: string | null
}

export type StatutRecompense =
  | { type: "perdu" }
  | { type: "a_utiliser"; jusquau: Date }
  | { type: "utilisee"; le: Date | null }
  | { type: "expiree"; depuis: Date }

export function statutRecompense(ligne: LigneClient, maintenant: Date = new Date()): StatutRecompense {
  if (!ligne.a_gagne) return { type: "perdu" }

  if (ligne.recompense_utilisee) {
    return { type: "utilisee", le: ligne.recompense_utilisee_le ? new Date(ligne.recompense_utilisee_le) : null }
  }

  const limite = new Date(ligne.created_at)
  limite.setDate(limite.getDate() + DUREE_VALIDITE_JOURS)

  if (limite < maintenant) return { type: "expiree", depuis: limite }
  return { type: "a_utiliser", jusquau: limite }
}

export type ClientRegroupe = {
  email: string
  prenom: string
  parties: LigneClient[] // de la plus recente a la plus ancienne
  aUtiliser: number
  derniereVisite: string
}

// Une ligne en base = une partie de roue. Un meme client (meme email) peut en avoir plusieurs.
export function regrouperParClient(lignes: LigneClient[]): ClientRegroupe[] {
  const parEmail = new Map<string, LigneClient[]>()
  for (const l of lignes) {
    const cle = l.email.trim().toLowerCase()
    parEmail.set(cle, [...(parEmail.get(cle) || []), l])
  }

  const maintenant = new Date()
  const resultat: ClientRegroupe[] = []
  parEmail.forEach((parties, email) => {
    const triees = [...parties].sort((a, b) => b.created_at.localeCompare(a.created_at))
    resultat.push({
      email,
      prenom: triees[0].prenom,
      parties: triees,
      aUtiliser: triees.filter((p) => statutRecompense(p, maintenant).type === "a_utiliser").length,
      derniereVisite: triees[0].created_at,
    })
  })

  return resultat.sort((a, b) => b.derniereVisite.localeCompare(a.derniereVisite))
}

// Recherche insensible a la casse et aux accents ("Léa" trouve "lea")
export function normaliserRecherche(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

// "Quand peut-on rejouer ?" selon la frequence choisie par le restaurateur.
// Une frequence de N jours signifie : on peut rejouer N jours calendaires apres sa partie.
export function quandRejouer(frequenceJours: number): string {
  if (frequenceJours <= 1) return "demain"
  return `dans ${frequenceJours} jours`
}
