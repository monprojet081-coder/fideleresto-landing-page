import { ArrowRight, Star } from "lucide-react"
import { PhoneMockup } from "./phone-mockup"

// Motif QR stylisé avec des "coins de repérage" pleins (comme un vrai QR code), purement décoratif
const qrCells = new Set([
  0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19,
  20, 21, 22, 23, 24, 8, 13, 18, 6, 16,
])

const steps = [
  {
    title: "Le client scanne le QR code",
    description:
      "Posé sur la table, l'addition ou la vitrine. Pas d'application à installer, ça s'ouvre directement dans son navigateur.",
    visual: (
      <PhoneMockup>
        <div className="grid size-16 grid-cols-5 grid-rows-5 gap-[3px] rounded-md bg-ivory p-1.5" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={`rounded-[1px] ${qrCells.has(i) ? "bg-ink" : "bg-ink/0"}`} />
          ))}
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
        <svg viewBox="0 0 100 100" className="size-20" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--wine)" strokeWidth="3" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8
            const x2 = 50 + 42 * Math.cos((angle * Math.PI) / 180)
            const y2 = 50 + 42 * Math.sin((angle * Math.PI) / 180)
            return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="var(--gold)" strokeWidth="1.5" opacity="0.6" />
          })}
          <circle cx="50" cy="50" r="6" fill="var(--gold)" />
          <path d="M50 4 L45 14 L55 14 Z" fill="var(--wine)" />
        </svg>
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
          <span className="rounded-full bg-sage/15 px-2.5 py-1 text-[9px] font-semibold text-sage">
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
