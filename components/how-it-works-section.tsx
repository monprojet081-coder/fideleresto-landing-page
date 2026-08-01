import { ArrowRight, Gift, Star } from "lucide-react"
import { PhoneMockup } from "./phone-mockup"

// Vrai motif de QR code stylisé : 3 carrés de repérage (coins) + modules de données,
// construit sur une grille 15x15, en pur SVG (aucune image générée).
const qrRows = [
  "111111101111111",
  "100000101000001",
  "101110101011101",
  "101110101011101",
  "101110101011101",
  "100000101000001",
  "111111101111111",
  "000000000000000",
  "111111100101101",
  "100000101101011",
  "101110100110101",
  "101110101011010",
  "101110100101101",
  "100000101010110",
  "111111100110101",
]

const qrModules = qrRows.flatMap((row, y) =>
  [...row].flatMap((cell, x) => (cell === "1" ? [{ x, y }] : []))
)
const qrModuleSize = 100 / qrRows.length

// Roue de la chance : segments bordeaux/ivoire alternes, bordure doree pointillee,
// logo fourchette-couteau au centre. Genere en pur SVG (memes valeurs que le visuel de marque).
const wheelPrizes = ["Dessert", "-10%", "Boisson", "-5€", "Café", "-15%", "Plat"]

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function RewardWheel() {
  const cx = 50
  const cy = 50
  const r = 46
  const segmentAngle = 360 / wheelPrizes.length

  return (
    <svg viewBox="0 0 100 100" className="size-20 drop-shadow-md" aria-hidden="true">
      {/* Anneau exterieur dore avec pastilles, comme la roue physique de la marque */}
      <circle cx={cx} cy={cy} r={r + 2} fill="var(--gold)" />
      {Array.from({ length: 24 }).map((_, i) => {
        const p = polarPoint(cx, cy, r + 2, (360 / 24) * i)
        return <circle key={i} cx={p.x} cy={p.y} r={0.6} fill="var(--wine-dark)" opacity={0.5} />
      })}

      {/* Segments */}
      {wheelPrizes.map((label, i) => {
        const start = i * segmentAngle - segmentAngle / 2
        const end = start + segmentAngle
        const p1 = polarPoint(cx, cy, r, start)
        const p2 = polarPoint(cx, cy, r, end)
        const fill = i % 2 === 0 ? "var(--wine-dark)" : "var(--ivory)"
        const textColor = i % 2 === 0 ? "var(--ivory)" : "var(--wine-dark)"
        const mid = polarPoint(cx, cy, r * 0.62, start + segmentAngle / 2)

        return (
          <g key={label}>
            <path
              d={`M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`}
              fill={fill}
              stroke="var(--gold)"
              strokeWidth={0.4}
            />
            <text
              x={mid.x}
              y={mid.y}
              fill={textColor}
              fontSize={5.2}
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* Hub central : fourchette + couteau croises, comme le logo */}
      <circle cx={cx} cy={cy} r={9} fill="var(--wine-dark)" stroke="var(--gold)" strokeWidth={1.2} />
      <g stroke="var(--gold-light)" strokeWidth={1.1} strokeLinecap="round">
        <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} />
        <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} />
      </g>
    </svg>
  )
}

const steps = [
  {
    title: "Le client scanne le QR code",
    description:
      "Posé sur la table, l'addition ou la vitrine. Pas d'application à installer, ça s'ouvre directement dans son navigateur.",
    visual: (
      <PhoneMockup>
        <div className="rounded-md bg-white p-2 shadow-sm">
          <svg viewBox="0 0 100 100" className="size-16" aria-hidden="true">
            {qrModules.map(({ x, y }) => (
              <rect
                key={`${x}-${y}`}
                x={x * qrModuleSize}
                y={y * qrModuleSize}
                width={qrModuleSize}
                height={qrModuleSize}
                fill="var(--ink)"
              />
            ))}
          </svg>
        </div>
      </PhoneMockup>
    ),
  },
  {
    title: "Il tourne la roue et gagne une récompense",
    description:
      "Café offert, dessert, réduction… en quelques secondes, il repart avec une vraie raison de revenir.",
    visual: (
      <PhoneMockup>
        <div className="relative flex items-center justify-center">
          {/* Flèche dorée */}
          <span
            className="absolute -top-1 z-10 size-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-gold drop-shadow-sm"
            aria-hidden="true"
          />
          <RewardWheel />
        </div>
      </PhoneMockup>
    ),
  },
  {
    title: "Il laisse un avis Google et récupère son cadeau",
    description:
      "Un tap suffit pour publier son avis. La récompense se débloque aussitôt, prête à être présentée en caisse.",
    visual: (
      <PhoneMockup tone="sage">
        <div className="flex flex-col items-center gap-2" aria-hidden="true">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-gold text-gold" />
            ))}
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-sage/15 px-2.5 py-1 text-[9px] font-semibold text-sage">
            <Gift className="size-3" aria-hidden="true" />
            Récompense débloquée
          </span>
        </div>
      </PhoneMockup>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="relative overflow-hidden border-t border-wine/10 bg-secondary/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-wine">
            Comment ça marche
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            De la table au clic, en moins d&apos;une minute
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            Aucune application, aucun compte à créer côté client. Trois gestes, et vous récupérez un avis
            Google et un client qui reviendra.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-start md:gap-0">
          {steps.map((step, index) => (
            <div key={step.title} className="contents">
              <div className="flex flex-1 flex-col items-center px-4 text-center">
                <div className="relative">
                  {step.visual}
                  <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border-2 border-secondary bg-gold text-xs font-bold text-wine-dark shadow-sm">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 text-pretty leading-relaxed text-ink/65">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden shrink-0 items-center justify-center pt-20 md:flex">
                  <span className="flex size-8 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
