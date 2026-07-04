import { QrCode, Disc3, Gift } from "lucide-react"

const steps = [
  {
    icon: QrCode,
    title: "Scannez le QR code",
    description:
      "Le client scanne le QR code unique présent sur sa table, son addition ou sa vitrine. Aucune application à télécharger.",
  },
  {
    icon: Disc3,
    title: "Tournez la roue",
    description:
      "Il fait tourner la roue de la fidélité et laisse un avis Google en quelques secondes pour tenter sa chance.",
  },
  {
    icon: Gift,
    title: "Recevez votre récompense",
    description:
      "Café offert, dessert gratuit, réduction… Le client gagne une récompense et a une vraie raison de revenir.",
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
            Trois étapes, zéro friction
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            Un parcours pensé pour vos clients, qui prend moins d&apos;une minute et fonctionne sans application.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full translate-x-8 border-t border-dashed border-gold/50 md:block" />
              )}
              <div className="relative flex size-16 items-center justify-center rounded-full bg-wine text-gold-light shadow-lg shadow-wine/20">
                <step.icon className="size-7" aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full border-2 border-secondary bg-gold text-xs font-bold text-wine-dark">
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