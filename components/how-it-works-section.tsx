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
          <span
            className="absolute -top-1.5 z-10 size-0 border-x-[6px] border-b-[9px] border-x-transparent border-b-wine"
            aria-hidden="true"
          />
          <div
            className="size-20 rounded-full border-[3px] border-wine-dark shadow-inner"
            style={{
              background:
                "conic-gradient(var(--wine) 0deg 45deg, var(--gold) 45deg 90deg, var(--sage) 90deg 135deg, var(--wine) 135deg 180deg, var(--gold) 180deg 225deg, var(--sage) 225deg 270deg, var(--wine) 270deg 315deg, var(--gold) 315deg 360deg)",
            }}
            aria-hidden="true"
          />
          <span className="absolute size-5 rounded-full border-2 border-wine-dark bg-gold-light" aria-hidden="true" />
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
