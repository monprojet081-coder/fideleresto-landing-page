import { Star } from "lucide-react"

const avant = [
  "Peu d'avis, et souvent les mécontents crient plus fort que les autres",
  "Des clients satisfaits qui repartent sans jamais laisser d'avis",
  "Aucune trace des clients : impossible de les faire revenir",
  "Une carte de fidélité en carton qu'on oublie ou qu'on perd",
]

const apres = [
  "Un flux régulier d'avis Google, porté par vos clients contents",
  "Les retours négatifs interceptés en privé avant d'être publiés",
  "Une base de clients qui grandit à chaque visite",
  "Une carte de fidélité sur le téléphone, toujours dans la poche",
]

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

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* AVANT */}
          <div className="rounded-2xl border border-wine/15 bg-card p-7">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">😕</span>
              <h3 className="font-display text-xl font-semibold text-wine">Sans FidèleResto</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {avant.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/70">
                  <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-wine/50" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* APRÈS */}
          <div className="rounded-2xl border border-sage/40 bg-sage/5 p-7">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🚀</span>
              <h3 className="font-display text-xl font-semibold text-sage">Avec FidèleResto</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {apres.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
                  <span className="mt-0.5 flex size-4 flex-shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <Star className="size-2.5 fill-sage" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
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
