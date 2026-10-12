// Calculs de rentabilite de la roue, partages entre le dashboard (calculateur) et le serveur.
//
// Principe : chaque partie coute en moyenne  somme(probabilite du lot x cout de revient du lot).
// On compare ce cout moyen au panier moyen du restaurant : en dessous de 5 % c'est rentable
// (c'est l'ordre de grandeur d'une remise de fidelite classique), au-dela de 10 % c'est risque.
import { LABEL_PERDU, type Lot } from "@/lib/roue"

export type LotEco = Lot

export const SEUIL_RENTABLE = 5 // % du panier moyen
export const SEUIL_RISQUE = 10
export const CIBLE_AJUSTEMENT = 4 // % vise par le bouton "rendre ma roue rentable"

export const estPerdu = (l: Lot) => l.label === LABEL_PERDU

/** Probabilite totale de gagner quelque chose, en % */
export function tauxGain(lots: Lot[]): number {
  return lots.filter((l) => !estPerdu(l)).reduce((s, l) => s + (l.probabilite || 0), 0)
}

/** "1 client sur X" gagne quelque chose */
export function unClientSur(lots: Lot[]): string {
  const t = tauxGain(lots)
  if (t <= 0) return "personne ne gagne"
  if (t < 0.95) return `1 client sur ${Math.round(100 / t).toLocaleString("fr-FR")}`
  if (t >= 99.5) return "tous les clients gagnent"
  const x = 100 / t
  return `1 client sur ${x < 10 ? x.toFixed(1).replace(".", ",").replace(",0", "") : Math.round(x)}`
}

/** Cout moyen d'une partie pour le restaurateur, en euros.
 *  Un lot "garanti tous les N passages" ajoute au plus cout/N par partie (cas d'un habitue). */
export function coutParPartie(lots: LotEco[]): number {
  return lots
    .filter((l) => !estPerdu(l))
    .reduce((s, l) => {
      const c = Number(l.cout) || 0
      const garanti = l.garanti_apres_visites && l.garanti_apres_visites > 0 ? c / l.garanti_apres_visites : 0
      return s + ((l.probabilite || 0) / 100) * c + garanti
    }, 0)
}

/** Cout maximum par jour si des plafonds sont regles sur tous les lots gagnants (sinon null) */
export function coutMaxParJour(lots: LotEco[]): number | null {
  const gagnants = lots.filter((l) => !estPerdu(l) && (l.probabilite || 0) > 0)
  if (gagnants.length === 0) return 0
  if (gagnants.some((l) => !l.max_par_jour)) return null
  return gagnants.reduce((s, l) => s + (l.max_par_jour || 0) * (Number(l.cout) || 0), 0)
}

export type Verdict = "rentable" | "surveiller" | "risque" | "inconnu"

export function verdict(lots: LotEco[], panierMoyen: number): { niveau: Verdict; pourcent: number } {
  const gagnants = lots.filter((l) => !estPerdu(l) && (l.probabilite || 0) > 0)
  if (!panierMoyen || panierMoyen <= 0 || gagnants.some((l) => l.cout === null || l.cout === undefined || l.cout === ("" as any)))
    return { niveau: "inconnu", pourcent: 0 }
  const pourcent = (coutParPartie(lots) / panierMoyen) * 100
  return { niveau: pourcent <= SEUIL_RENTABLE ? "rentable" : pourcent <= SEUIL_RISQUE ? "surveiller" : "risque", pourcent }
}

/**
 * Baisse les chances de gagner (en gardant les proportions entre les lots) pour que le cout
 * moyen d'une partie tombe a CIBLE_AJUSTEMENT % du panier moyen. Le reste va sur "Perdu".
 */
export function ajusterPourRentabilite(lots: LotEco[], panierMoyen: number, ciblePourcent = CIBLE_AJUSTEMENT): LotEco[] {
  const cout = coutParPartie(lots)
  const budget = (panierMoyen * ciblePourcent) / 100
  let resultat = lots.map((l) => ({ ...l }))
  if (cout > budget && cout > 0) {
    const k = budget / cout
    resultat = resultat.map((l) =>
      estPerdu(l) || l.probabilite < 1 ? l : { ...l, probabilite: Math.max(1, Math.floor(l.probabilite * k)) },
    )
  }
  const gagne = resultat.filter((l) => !estPerdu(l)).reduce((s, l) => s + l.probabilite, 0)
  const perdu = resultat.find(estPerdu)
  const arrondi = (n: number) => Math.round(n * 10) / 10
  if (perdu) perdu.probabilite = arrondi(Math.max(0, 100 - gagne))
  else resultat.push({ label: LABEL_PERDU, probabilite: arrondi(Math.max(0, 100 - gagne)), couleur: "#a8536a", cout: 0 })
  return resultat
}
