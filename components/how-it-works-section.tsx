import { Star } from "lucide-react"
import { PhoneMockup } from "./phone-mockup"

const steps = [
  {
    title: "Le client scanne le QR code",
    description:
      "Posé sur la table, l'addition ou la vitrine. Pas d'application à installer, ça s'ouvre directement dans son navigateur.",
    visual: (
      <PhoneMockup>
        <div className="grid grid-cols-4 gap-[2px] p-3" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={`aspect-square rounded-[1px] ${[0, 1, 3, 4, 6, 9, 10, 12, 13, 15].includes(i) ? "bg-ink" : "bg-ivory"}`}
            />
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

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-20 hidden h-px w-full translate-x-12 border-t border-dashed border-gold/50 md:block" />
              )}
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
          ))}
        </div>
      </div>
    </section>
  )
}
