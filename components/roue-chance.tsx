"use client"

import { useEffect, useRef } from "react"
import { Lot, DUREE_ROTATION_MS, lotsGagnables, chanceSur, couleurTexteSur } from "@/lib/roue"

const TAILLE = 320
const CENTRE = TAILLE / 2
const RAYON = 138
const RAYON_MOYEU = 25

type TexteAjuste = { lignes: string[]; taille: number }

// Trouve comment ecrire un libelle dans l'espace disponible d'un segment :
// 1 ligne si elle reste lisible, sinon 2 lignes, sinon texte reduit puis tronque.
function ajusterTexte(ctx: CanvasRenderingContext2D, label: string, largeurMax: number, hauteurMax: number): TexteAjuste {
  const tailleMax = Math.min(16, hauteurMax)
  const police = (t: number) => `bold ${t}px sans-serif`

  let uneLigne = 0
  for (let t = tailleMax; t >= 10; t -= 0.5) {
    ctx.font = police(t)
    if (ctx.measureText(label).width <= largeurMax) { uneLigne = t; break }
  }
  if (uneLigne >= 12.5) return { lignes: [label], taille: uneLigne }

  let deuxLignes: { l1: string; l2: string; taille: number } | null = null
  const mots = label.split(" ")
  if (mots.length > 1) {
    for (let t = Math.min(tailleMax, hauteurMax / 2.1); t >= 10; t -= 0.5) {
      ctx.font = police(t)
      let meilleur: { l1: string; l2: string; w: number } | null = null
      for (let i = 1; i < mots.length; i++) {
        const l1 = mots.slice(0, i).join(" ")
        const l2 = mots.slice(i).join(" ")
        const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width)
        if (!meilleur || w < meilleur.w) meilleur = { l1, l2, w }
      }
      if (meilleur && meilleur.w <= largeurMax) { deuxLignes = { l1: meilleur.l1, l2: meilleur.l2, taille: t }; break }
    }
  }

  if (deuxLignes && deuxLignes.taille > uneLigne) return { lignes: [deuxLignes.l1, deuxLignes.l2], taille: deuxLignes.taille }
  if (uneLigne > 0) return { lignes: [label], taille: uneLigne }

  ctx.font = police(10)
  let txt = label
  while (txt.length > 1 && ctx.measureText(txt + "…").width > largeurMax) txt = txt.slice(0, -1)
  return { lignes: [txt + "…"], taille: 10 }
}

export function dessinerRoue(ctx: CanvasRenderingContext2D, lots: Lot[]) {
  const arc = (2 * Math.PI) / lots.length

  ctx.clearRect(0, 0, TAILLE, TAILLE)

  // Anneau exterieur dore avec pastilles
  ctx.beginPath()
  ctx.arc(CENTRE, CENTRE, RAYON + 8, 0, 2 * Math.PI)
  ctx.fillStyle = "#c9962c"
  ctx.fill()
  for (let d = 0; d < 28; d++) {
    const a = (2 * Math.PI * d) / 28
    ctx.beginPath()
    ctx.arc(CENTRE + (RAYON + 8) * Math.cos(a), CENTRE + (RAYON + 8) * Math.sin(a), 2, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(107,30,46,0.45)"
    ctx.fill()
  }

  // Zone de texte : du bord du moyeu (+ marge) jusqu'a proximite du bord de la roue
  const xFin = RAYON - 12
  const xDebut = RAYON_MOYEU + 11
  const largeurMax = xFin - xDebut
  const rayonMilieu = (xFin + xDebut) / 2
  const hauteurMax = 2 * rayonMilieu * Math.sin(arc / 2) * 0.8

  lots.forEach((lot, i) => {
    const debut = i * arc - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(CENTRE, CENTRE)
    ctx.arc(CENTRE, CENTRE, RAYON, debut, debut + arc)
    ctx.closePath()
    ctx.fillStyle = lot.couleur
    ctx.fill()
    ctx.strokeStyle = "#c9962c"
    ctx.lineWidth = 1.5
    ctx.stroke()

    const { texte, clair } = couleurTexteSur(lot.couleur)
    const { lignes, taille } = ajusterTexte(ctx, lot.label, largeurMax, hauteurMax)

    // Case tournee vers la gauche : on retourne le texte pour qu'il se lise toujours a l'endroit
    // (sinon la moitie des libelles serait a l'envers sur la roue a l'arret)
    const milieu = debut + arc / 2
    const versLaGauche = Math.cos(milieu) < -0.001

    ctx.save()
    ctx.translate(CENTRE, CENTRE)
    ctx.rotate(milieu + (versLaGauche ? Math.PI : 0))
    ctx.textAlign = versLaGauche ? "left" : "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = texte
    ctx.font = `bold ${taille}px sans-serif`
    if (clair) {
      ctx.shadowColor = "rgba(0,0,0,0.35)"
      ctx.shadowBlur = 2
    }
    const interligne = taille * 1.15
    const decalage = ((lignes.length - 1) * interligne) / 2
    lignes.forEach((ligne, k) => ctx.fillText(ligne, versLaGauche ? -xFin : xFin, k * interligne - decalage))
    ctx.restore()
  })

  // Moyeu central : fourchette et couteau croises (logo de la marque)
  ctx.beginPath()
  ctx.arc(CENTRE, CENTRE, RAYON_MOYEU, 0, 2 * Math.PI)
  ctx.fillStyle = "#6b1e2e"
  ctx.fill()
  ctx.strokeStyle = "#c9962c"
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.strokeStyle = "#f4e4c1"
  ctx.lineWidth = 2.5
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(CENTRE - 10, CENTRE - 10)
  ctx.lineTo(CENTRE + 10, CENTRE + 10)
  ctx.moveTo(CENTRE + 10, CENTRE - 10)
  ctx.lineTo(CENTRE - 10, CENTRE + 10)
  ctx.stroke()
}

export function RoueChance({ rewards, rotation, spinning }: { rewards: Lot[]; rotation: number; spinning: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || rewards.length === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Resolution doublee sur ecrans retina pour que le texte reste net
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = TAILLE * dpr
    canvas.height = TAILLE * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    dessinerRoue(ctx, rewards)
  }, [rewards])

  return (
    // La roue suit la largeur de l'ecran (max 320px) au lieu de deborder sur petits telephones
    <div className="relative mx-auto" style={{ width: "min(320px, 100%)", aspectRatio: "1 / 1" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: "18px solid #c9962c",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
          }}
        />
      </div>
      <canvas
        ref={canvasRef}
        id="wheel-canvas"
        className="h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${DUREE_ROTATION_MS}ms cubic-bezier(0.1, 0.65, 0.05, 1)` : "none",
          borderRadius: "50%",
          boxShadow: "0 4px 20px rgba(107,30,46,0.25)",
        }}
      />
    </div>
  )
}

// Liste "Ce que vous pouvez gagner" avec la chance de chaque lot, calculee depuis le reglage de la roue
export function LegendeLots({ rewards }: { rewards: Lot[] }) {
  const gagnables = lotsGagnables(rewards)
  if (gagnables.length === 0) return null

  return (
    <div className="mt-7 rounded-2xl border border-wine/15 bg-ivory p-4 text-left">
      <p className="mb-3 text-center font-display text-base font-semibold text-wine-dark">Ce que vous pouvez gagner</p>
      <ul className="space-y-2">
        {gagnables.map((lot) => (
          <li key={lot.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="size-3.5 shrink-0 rounded-full border border-wine/20" style={{ background: lot.couleur }} aria-hidden="true" />
              <span className="text-base font-medium text-ink">{lot.label}</span>
            </span>
            <span className="shrink-0 text-sm text-ink/75">{chanceSur(lot.probabilite)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
