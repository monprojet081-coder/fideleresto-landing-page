import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const included = [
  "QR code unique personnalisé",
  "Roue de la fidélité illimitée",
  "Collecte d'emails et base clients",
  "Tableau de bord analytics complet",
  "Redirection avis Google automatique",
  "Alertes insatisfaction en temps réel",
  "Récompenses personnalisables",
  "Support prioritaire par email",
]

export function PricingSection() {
  return (
    <section id="tarifs" className="relative overflow-hidden border-t border-border bg-muted/40 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/10 via-violet-400/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Tarifs
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Un tarif simple et transparent
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Tout est inclus. Sans engagement, sans frais cachés. Annulez quand vous voulez.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-lg">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-blue-500/10">
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 px-8 py-8 text-center text-white">
              <p className="text-sm font-medium uppercase tracking-wide opacity-90">
                Formule unique
              </p>
              <div className="mt-3 flex items-end justify-center gap-1">
                <span className="text-5xl font-bold">50€</span>
                <span className="mb-1 text-lg opacity-90">/mois</span>
              </div>
              <p className="mt-2 text-sm opacity-90">par établissement, tout compris</p>
            </div>

            <div className="px-8 py-8">
              <ul className="flex flex-col gap-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="mt-8 h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-base text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700"
                nativeButton={false}
                render={<a href="/inscription" />}
              >
                Commencer gratuitement
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                14 jours d&apos;essai gratuit · Sans carte bancaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}