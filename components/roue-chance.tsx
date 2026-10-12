"use client"

import { useEffect, useRef } from "react"
import { Lot, DUREE_ROTATION_MS, lotsGagnables, chanceSur, couleurTexteSur } from "@/lib/roue"

const TAILLE = 320
const CENTRE = TAILLE / 2
const RAYON = 140
const RAYON_MOYEU = 32

type TexteAjuste = { lignes: string[]; taille: number }

// Trouve comment ecrire un libelle dans l'espace disponible d'un segment :
// 1 ligne si elle reste lisible, sinon 2 lignes, sinon texte reduit puis tronque.
function ajusterTexte(ctx: CanvasRenderingContext2D, label: string, largeurMax: number, hauteurMax: number): TexteAjuste {
  const tailleMax = Math.min(15, hauteurMax)
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

// rotationFinaleDeg : rotation a laquelle la roue va s'arreter. Sert a orienter chaque libelle
// pour qu'il se lise a l'endroit A L'ARRET (et pas seulement avant le lancer).
export function dessinerRoue(ctx: CanvasRenderingContext2D, lots: Lot[], rotationFinaleDeg = 0) {
  const arc = (2 * Math.PI) / lots.length

  ctx.clearRect(0, 0, TAILLE, TAILLE)

  // Zone de texte : du bord du moyeu (+ marge) jusqu'a proximite du bord de la roue
  const xFin = RAYON - 12
  const xDebut = RAYON_MOYEU + 9
  const largeurMax = xFin - xDebut
  const rayonMilieu = (xFin + xDebut) / 2
  const hauteurMax = 2 * rayonMilieu * Math.sin(arc / 2) * 0.8

  // fond sombre sous les cases (visible au ras du cadre dore)
  ctx.beginPath()
  ctx.arc(CENTRE, CENTRE, RAYON + 2, 0, 2 * Math.PI)
  ctx.fillStyle = "#25070f"
  ctx.fill()

  lots.forEach((lot, i) => {
    const debut = i * arc - Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(CENTRE, CENTRE)
    ctx.arc(CENTRE, CENTRE, RAYON, debut, debut + arc)
    ctx.closePath()
    ctx.fillStyle = lot.couleur
    ctx.fill()
    // leger degrade pour donner du relief a chaque case
    const g = ctx.createRadialGradient(CENTRE, CENTRE, RAYON_MOYEU, CENTRE, CENTRE, RAYON)
    g.addColorStop(0, "rgba(0,0,0,0.10)")
    g.addColorStop(0.55, "rgba(255,255,255,0)")
    g.addColorStop(1, "rgba(0,0,0,0.12)")
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = "#ebc677"
    ctx.lineWidth = 2.2
    ctx.stroke()

    const { texte, clair } = couleurTexteSur(lot.couleur)
    const { lignes, taille } = ajusterTexte(ctx, lot.label, largeurMax, hauteurMax)

    // Case tournee vers la gauche : on retourne le texte pour qu'il se lise toujours a l'endroit
    // (sinon la moitie des libelles serait a l'envers sur la roue a l'arret)
    const milieu = debut + arc / 2
    const versLaGauche = Math.cos(milieu + (rotationFinaleDeg * Math.PI) / 180) < -0.001

    ctx.save()
    ctx.translate(CENTRE, CENTRE)
    ctx.rotate(milieu + (versLaGauche ? Math.PI : 0))
    ctx.textAlign = versLaGauche ? "left" : "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = texte
    ctx.font = `800 ${taille}px sans-serif`
    if (clair) {
      ctx.shadowColor = "rgba(0,0,0,0.35)"
      ctx.shadowBlur = 2
    }
    const interligne = taille * 1.15
    const decalage = ((lignes.length - 1) * interligne) / 2
    lignes.forEach((ligne, k) => ctx.fillText(ligne, versLaGauche ? -xFin : xFin, k * interligne - decalage))
    ctx.restore()
  })
}

// Confettis legers (CSS pur), declenches quand la roue s'arrete sur un lot gagne
function Confettis() {
  const couleurs = ["#c9962c", "#ebc677", "#6b1e2e", "#fff4d1", "#f6e3b4", "#b23a52"]
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {Array.from({ length: 70 }).map((_, i) => {
        // pseudo-aleatoire stable (meme rendu a chaque fois)
        const r = (n: number) => {
          const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453
          return x - Math.floor(x)
        }
        const angle = r(1) * Math.PI * 2
        const force = 90 + r(2) * 170
        const w = 6 + r(3) * 7
        return (
          <span
            key={i}
            className="fr-confetti absolute left-1/2 top-1/2 block"
            style={
              {
                width: w,
                height: w * (0.4 + r(4) * 0.4),
                background: couleurs[i % couleurs.length],
                borderRadius: i % 4 === 0 ? "50%" : 2,
                "--dx": `${Math.cos(angle) * force}px`,
                "--dy": `${Math.sin(angle) * force - 40}px`,
                "--rot": `${r(5) * 720 - 360}deg`,
                animationDelay: `${r(6) * 0.12}s`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

export function RoueChance({
  rewards,
  rotation,
  spinning,
  issue,
}: {
  rewards: Lot[]
  rotation: number
  spinning: boolean
  /** Resultat a afficher dans le moyeu une fois la roue arretee */
  issue?: "gagne" | "perdu" | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointeurRef = useRef<HTMLDivElement>(null)
  const arrete = !spinning && rotation !== 0
  const gagne = arrete && issue === "gagne"

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
    dessinerRoue(ctx, rewards, rotation)
  }, [rewards, rotation])

  // Pendant la rotation : le pointeur "claque" a chaque case qui passe et la roue floute avec la vitesse
  useEffect(() => {
    const canvas = canvasRef.current
    const pointeur = pointeurRef.current
    if (!spinning || !canvas || !pointeur || rewards.length === 0) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    const arcDeg = 360 / rewards.length
    let precedent: number | null = null
    let total = 0
    let raf = 0
    const boucle = () => {
      const t = getComputedStyle(canvas).transform
      if (t && t !== "none") {
        const m = new DOMMatrixReadOnly(t)
        const a = (Math.atan2(m.b, m.a) * 180) / Math.PI
        if (precedent !== null) {
          let d = a - precedent
          if (d < -180) d += 360
          if (d > 180) d -= 360
          total += d
          const vitesse = Math.abs(d)
          const phase = ((((total % arcDeg) + arcDeg) % arcDeg) / arcDeg)
          const coup = vitesse > 0.3 ? Math.max(0, 1 - phase * 3.2) * Math.min(1, vitesse / 6) : 0
          pointeur.style.transform = `translateX(-50%) rotate(${-coup * 28}deg)`
          canvas.style.filter = vitesse > 4 ? `blur(${Math.min(2.2, vitesse / 12)}px)` : "none"
        }
        precedent = a
      }
      raf = requestAnimationFrame(boucle)
    }
    raf = requestAnimationFrame(boucle)
    return () => {
      cancelAnimationFrame(raf)
      pointeur.style.transform = "translateX(-50%)"
      canvas.style.filter = "none"
    }
  }, [spinning, rewards.length])

  const arcDeg = rewards.length > 0 ? 360 / rewards.length : 360
  const coin = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return `${CENTRE + r * Math.cos(a)} ${CENTRE + r * Math.sin(a)}`
  }
  const texteMoyeu = arrete ? (issue === "gagne" ? "Gagné !" : issue === "perdu" ? "Raté…" : "Jouer") : "Jouer"

  return (
    // La roue suit la largeur de l'ecran (max 340px) au lieu de deborder sur petits telephones
    <div className="relative mx-auto" style={{ width: "min(340px, 100%)", aspectRatio: "1 / 1" }}>
      <div className="absolute inset-0 rounded-full shadow-[0_18px_40px_rgba(61,15,26,0.40)]" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        id="wheel-canvas"
        className="absolute inset-0 h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${DUREE_ROTATION_MS}ms cubic-bezier(0.1, 0.65, 0.05, 1)` : "none",
          borderRadius: "50%",
        }}
      />
      {/* Cadre dore, ampoules, case gagnante et moyeu : fixes, par-dessus la roue qui tourne */}
      <svg viewBox={`0 0 ${TAILLE} ${TAILLE}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="fr-or" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#f5d88f" />
            <stop offset="60%" stopColor="#c9962c" />
            <stop offset="100%" stopColor="#8a6213" />
          </radialGradient>
          <mask id="fr-anneau">
            <rect width={TAILLE} height={TAILLE} fill="white" />
            <circle cx={CENTRE} cy={CENTRE} r={RAYON} fill="black" />
          </mask>
        </defs>
        <circle cx={CENTRE} cy={CENTRE} r={CENTRE - 1} fill="url(#fr-or)" mask="url(#fr-anneau)" />
        <circle cx={CENTRE} cy={CENTRE} r={RAYON + 0.5} fill="none" stroke="#7a5410" strokeWidth={1.5} />
        {Array.from({ length: 16 }).map((_, i) => {
          const [x, y] = coin(i * 22.5, CENTRE - 11).split(" ").map(Number)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4.6}
              className={`fr-ampoule ${spinning ? "fr-ampoule-vite" : ""}`}
              style={{ animationDelay: i % 2 ? "-0.3s" : "0s" }}
            />
          )
        })}
        {gagne && (
          <path
            className="fr-case-gagnante"
            d={`M${CENTRE} ${CENTRE} L${coin(-arcDeg / 2, RAYON)} A${RAYON} ${RAYON} 0 0 1 ${coin(arcDeg / 2, RAYON)} Z`}
          />
        )}
        <circle cx={CENTRE} cy={CENTRE} r={RAYON_MOYEU} fill="url(#fr-or)" stroke="#fff3cf" strokeWidth={3} />
        <text
          x={CENTRE}
          y={CENTRE + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 800, fontSize: texteMoyeu.length > 5 ? 14 : 16, fill: "#25070f" }}
        >
          {texteMoyeu}
        </text>
      </svg>
      {/* Pointeur dore */}
      <div
        ref={pointeurRef}
        className="pointer-events-none absolute left-1/2 z-10"
        style={{ top: "-5%", width: "13%", transform: "translateX(-50%)", transformOrigin: "50% 20%", filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.35))" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 60 70" className="block w-full">
          <path d="M30 68 L6 14 Q30 -6 54 14 Z" fill="#ebc677" stroke="#7a5410" strokeWidth={3} />
          <circle cx={30} cy={20} r={7} fill="#6b1e2e" />
        </svg>
      </div>
      {gagne && <Confettis />}
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
          <li key={lot.label} className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 items-start gap-2.5">
              <span className="mt-1.5 size-3.5 shrink-0 rounded-full border border-wine/20" style={{ background: lot.couleur }} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-base font-medium text-ink">{lot.label}</span>
                {lot.garanti_apres_visites ? (
                  <span className="block text-xs font-medium text-wine">Offert à coup sûr à votre {lot.garanti_apres_visites}e passage</span>
                ) : null}
              </span>
            </span>
            <span className="mt-0.5 shrink-0 whitespace-nowrap text-sm text-ink/85">{chanceSur(lot.probabilite)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
