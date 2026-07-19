import { Star, TrendingDown, TrendingUp } from "lucide-react"

const statsAvant = [
  { label: "Avis Google", value: "45 avis", pct: 25 },
  { label: "Note moyenne", value: "3.6", stars: 3.6, pct: 45 },
  { label: "Visibilité locale", value: "Faible", pct: 20 },
]

const statsApres = [
  { label: "Avis Google", value: "187 avis", detail: "+142 nouveaux", pct: 90 },
  { label: "Note moyenne", value: "4.7", stars: 4.7, pct: 94 },
  { label: "Visibilité locale", value: "Élevée", pct: 90 },
]

const problemes = [
  "Clients satisfaits qui repartent sans jamais laisser d'avis",
  "Avis négatifs publics, jamais traités avant qu'ils s'affichent",
  "Aucune trace des clients : impossible de les faire revenir",
]

const resultats = [
  "Flux régulier d'avis Google, porté par vos clients contents",
  "Retours négatifs interceptés en privé avant d'être publiés",
  "Base de clients qui grandit à chaque visite",
]

function StatRow({ label, value, detail, pct, tone }: { label: string; value: string; detail?: string; pct: number; tone: "wine" | "sage" }) {
  const barColor = tone === "wine" ? "bg-wine/60" : "bg-sage"
  const valueColor = tone === "wine" ? "text-wine" : "text-sage"

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-ink/60">{label}</span>
        <span className={`font-display text-lg font-semibold ${valueColor}`}>
          {value}
          {detail && <span className="ml-1.5 text-xs font-medium opacity-70">{detail}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="resultats" className="relative overflow-hidden bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-wine">
            Le principe
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ce que FidèleResto change dans votre restaurant
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            L&apos;idée est simple : capter chaque client au moment où il est content, juste après son repas.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          {/* AVANT */}
          <div className="relative overflow-hidden rounded-3xl border border-wine/20 bg-card shadow-lg shadow-wine/5">
            <span className="absolute top-[104px] -left-3 size-6 rounded-full bg-ivory" aria-hidden="true" />
            <span className="absolute top-[104px] -right-3 size-6 rounded-full bg-ivory" aria-hidden="true" />

            <div className="px-7 pb-6 pt-7">
              <div className="flex items-center gap-2">
                <TrendingDown className="size-5 text-wine" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold text-wine">Sans FidèleResto</h3>
              </div>
              <p className="mt-1 text-sm text-ink/55">Peu d&apos;avis, visibilité faible</p>
            </div>

            <div className="space-y-4 border-t border-dashed border-wine/25 px-7 py-6">
              {statsAvant.map((stat) => (
                <StatRow key={stat.label} {...stat} tone="wine" />
              ))}
            </div>

            <div className="mx-7 mb-7 rounded-xl bg-wine/5 p-5">
              <p className="text-sm font-semibold text-wine">Problèmes récurrents</p>
              <ul className="mt-3 space-y-2">
                {problemes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink/70">
                    <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-wine/50" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* APRÈS */}
          <div className="relative overflow-hidden rounded-3xl border border-sage/40 bg-card shadow-lg shadow-sage/10">
            <span className="absolute top-[104px] -left-3 size-6 rounded-full bg-ivory" aria-hidden="true" />
            <span className="absolute top-[104px] -right-3 size-6 rounded-full bg-ivory" aria-hidden="true" />

            <div className="px-7 pb-6 pt-7">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-sage" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold text-sage">Avec FidèleResto</h3>
              </div>
              <p className="mt-1 text-sm text-ink/55">Croissance régulière des avis positifs</p>
            </div>

            <div className="space-y-4 border-t border-dashed border-sage/30 px-7 py-6">
              {statsApres.map((stat) => (
                <StatRow key={stat.label} {...stat} tone="sage" />
              ))}
            </div>

            <div className="mx-7 mb-7 rounded-xl bg-sage/8 p-5">
              <p className="text-sm font-semibold text-sage">Résultats obtenus</p>
              <ul className="mt-3 space-y-2">
                {resultats.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                    <span className="mt-0.5 flex size-4 flex-shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                      <Star className="size-2.5 fill-sage" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-ink/45">
          Exemple illustratif du fonctionnement de l&apos;outil. Les résultats dépendent de votre établissement
          et de votre fréquentation.
        </p>
      </div>
    </section>
  )
}
