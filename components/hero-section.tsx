import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="flex size-2 rounded-full bg-primary" aria-hidden="true" />
            La fidélité client, simplifiée pour les restaurants
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Fidélisez vos clients et multipliez vos{" "}
            <span className="text-primary">avis Google</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            FidèleResto transforme chaque visite en occasion de revenir. Un simple QR code,
            une roue de la fidélité ludique et des récompenses qui font revenir vos clients —
            tout en boostant votre réputation en ligne.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<a href="#tarifs" />}
            >
              Commencer
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<a href="#comment-ca-marche" />}
            >
              Voir comment ça marche
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-primary text-primary" />
              ))}
            </span>
            Plébiscité par plus de 300 restaurateurs en France
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
            <div className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-3">
              {[
                { value: "+38%", label: "de clients fidèles" },
                { value: "x4", label: "plus d'avis Google" },
                { value: "4,8/5", label: "note moyenne après 3 mois" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card px-6 py-8 text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
