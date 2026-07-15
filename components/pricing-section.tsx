"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

type Periode = "mensuel" | "trimestriel" | "annuel"

const plans = [
  {
    nom: "Standard",
    key: "standard",
    prixMensuel: 180,
    prixTrimestriel: 162,
    prixAnnuel: 144,
    totalTrimestriel: 486,
    totalAnnuel: 1728,
    description: "Tout pour fidéliser vos clients et booster vos avis",
    highlight: false,
    essaiGratuit: true,
    features: [
      "Roue de la fidélité + boost avis Google",
      "3 modèles de flyers prêts à imprimer",
      "Emails de relance automatiques",
      "Menu digital",
      "Carte de fidélité digitale",
      "Tableau de bord analytics complet",
    ],
  },
  {
    nom: "Premium",
    key: "premium",
    prixMensuel: 280,
    prixTrimestriel: 252,
    prixAnnuel: 224,
    totalTrimestriel: 756,
    totalAnnuel: 2688,
    description: "Pour être accompagné plutôt que livré à vous-même",
    highlight: true,
    essaiGratuit: false,
    features: [
      "Tout ce qui est inclus dans Standard",
      "Alerte insatisfaction (protège votre note Google)",
      "Statistiques avancées (heures de pointe, évolution)",
      "Accompagnement",
      "Flyers fournis et traduits sur demande",
      "Traduction de l'application sur demande",
      "Option création de site et gestion des réseaux",
    ],
  },
]

export function PricingSection() {
  const [periode, setPeriode] = useState<Periode>("mensuel")

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
            Choisissez la formule adaptée à votre établissement. Sans engagement, sans frais cachés.
          </p>
        </div>

        <div className="mx-auto mt-10 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-wine/15 bg-card p-1">
            {([
              { key: "mensuel", label: "Mensuel" },
              { key: "trimestriel", label: "Trimestriel", badge: "-10%" },
              { key: "annuel", label: "Annuel", badge: "-20%" },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriode(opt.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  periode === opt.key ? "bg-wine text-gold-light" : "text-ink/60"
                }`}
              >
                {opt.label} {"badge" in opt && <span className="opacity-75">({opt.badge})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Deux cartes façon ticket de tombola gagnant, avec bord perforé et encoches */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
          {plans.map((plan) => {
            const prixAffiche =
              periode === "mensuel" ? plan.prixMensuel :
              periode === "trimestriel" ? plan.prixTrimestriel :
              plan.prixAnnuel
            const totalPeriode =
              periode === "trimestriel" ? plan.totalTrimestriel :
              periode === "annuel" ? plan.totalAnnuel :
              null
            const planParam = `${plan.key}_${periode}`

            return (
              <div
                key={plan.nom}
                className={`relative overflow-hidden rounded-3xl border bg-card shadow-xl ${
                  plan.highlight ? "border-gold/50 shadow-wine/15" : "border-wine/15 shadow-wine/10"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute right-6 top-6 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-wine-dark">
                    Le plus complet
                  </span>
                )}
                <span className="absolute top-[152px] -left-3 size-6 rounded-full bg-secondary" aria-hidden="true" />
                <span className="absolute top-[152px] -right-3 size-6 rounded-full bg-secondary" aria-hidden="true" />

                <div className="bg-wine px-8 py-8 text-center text-gold-light">
                  <p className="text-sm font-medium uppercase tracking-widest text-gold">
                    {plan.nom}
                  </p>
                  <div className="mt-3 flex items-end justify-center gap-1 font-display">
                    <span className="text-5xl font-semibold">{prixAffiche}€</span>
                    <span className="mb-1 text-lg opacity-80">/mois</span>
                  </div>
                  {totalPeriode && (
                    <p className="mt-1 text-xs opacity-75">
                      soit {totalPeriode}€ facturés {periode === "trimestriel" ? "tous les 3 mois" : "1x/an"}
                    </p>
                  )}
                  <p className="mt-2 text-sm opacity-80">{plan.description}</p>
                  {plan.essaiGratuit && (
                    <p className="mt-3 inline-flex items-center rounded-full bg-gold-light/20 px-3 py-1 text-xs font-semibold">
                      14 jours d&apos;essai gratuit
                    </p>
                  )}
                </div>

                <div className="border-t border-dashed border-wine/25 px-8 py-8">
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((item) => (
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
                    render={<a href={`/inscription?plan=${planParam}`} />}
                  >
                    Commencer
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-8 text-center text-sm text-ink/50">
          Options création de site et gestion des réseaux sociaux disponibles sur le Premium, quel que soit le rythme choisi.
        </p>
      </div>
    </section>
  )
}
