import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "En trois mois, on est passés de 80 à plus de 300 avis Google. Notre note est montée à 4,8 et on voit clairement la différence sur les réservations.",
    name: "Marc D.",
    role: "Gérant, La Bella Vita",
    initials: "MD",
  },
  {
    quote:
      "La roue de la fidélité fait un carton auprès des clients. Ils reviennent pour leur café offert et finissent par commander bien plus. Simple et efficace.",
    name: "Sophie L.",
    role: "Propriétaire, Le Petit Zinc",
    initials: "SL",
  },
  {
    quote:
      "Les alertes insatisfaction m'ont sauvé plusieurs fois. Je peux régler un problème en salle avant qu'un mauvais avis ne soit publié. Indispensable.",
    name: "Karim B.",
    role: "Propriétaire, O'Tacos du Marché",
    initials: "KB",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Témoignages
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ils ont fidélisé leurs clients
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Des restaurateurs qui ont transformé leurs visiteurs en habitués.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="block text-sm text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
