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
    <section id="comment-ca-marche" className="border-t border-border bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Comment ça marche
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trois étapes, zéro friction
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Un parcours pensé pour vos clients, qui prend moins d&apos;une minute et fonctionne sans application.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <step.icon className="size-7" aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
