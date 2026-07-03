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
    <section id="tarifs" className="relative overflow-hidden border-t border-wine/10 bg-secondary/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-wine">
            Tarifs
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Un tarif simple et transparent
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            Tout est inclus. Sans engagement, sans frais cachés. Annulez quand vous voulez.
          </p>
        </div>

        {/* Carte façon ticket de tombola gagnant, avec bord perforé et encoches */}
        <div className="mx-auto mt-14 max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-wine/15 bg-card shadow-xl shadow-wine/10">
            <span className="absolute top-[168px] -left-3 size-6 rounded-full bg-secondary" aria-hidden="true" />
            <span className="absolute top-[168px] -right-3 size-6 rounded-full bg-secondary" aria-hidden="true" />

            <div className="bg-wine px-8 py-8 text-center text-gold-light">
              <p className="text-sm font-medium uppercase tracking-widest text-gold">
                Formule unique
              </p>
              <div className="mt-3 flex items-end justify-center gap-1 font-display">
                <span className="text-5xl font-semibold">50€</span>
                <span className="mb-1 text-lg opacity-80">/mois</span>
              </div>
              <p className="mt-2 text-sm opacity-80">par établissement, tout compris</p>
            </div>

            <div className="border-t border-dashed border-wine/25 px-8 py-8">
              <ul className="flex flex-col gap-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-wine">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-ink">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="mt-8 h-11 w-full bg-wine text-base text-gold-light shadow-md shadow-wine/20 hover:bg-wine-dark"
                nativeButton={false}
                render={<a href="/inscription" />}
              >
                Commencer gratuitement
              </Button>
              <p className="mt-3 text-center text-xs text-ink/50">
                14 jours d&apos;essai gratuit · Sans carte bancaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}