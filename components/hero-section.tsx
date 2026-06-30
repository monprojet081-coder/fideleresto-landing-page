import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Formes décoratives en arrière-plan */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/30 via-violet-500/20 to-transparent blur-3xl" />
        <div className="absolute top-20 -left-20 h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[300px] w-[300px] rounded-full bg-violet-400/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <span className="flex size-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" aria-hidden="true" />
            La fidélité client, simplifiée pour les restaurants
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Fidélisez vos clients et multipliez vos{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              avis Google
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            FidèleResto transforme chaque visite en occasion de revenir. Un simple QR code,
            une roue de la fidélité ludique et des récompenses qui font revenir vos clients —
            tout en boostant votre réputation en ligne.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-base text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] hover:from-blue-700 hover:to-violet-700"
              nativeButton={false}
              render={<a href="/inscription" />}
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
                <Star key={i} className="size-4 fill-blue-500 text-blue-500" />
              ))}
            </span>
            Plébiscité par plus de 300 restaurateurs en France
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card/80 p-2 shadow-xl shadow-blue-500/10 backdrop-blur-sm">
            <div className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-3">
              {[
                { value: "+38%", label: "de clients fidèles" },
                { value: "x4", label: "plus d'avis Google" },
                { value: "4,8/5", label: "note moyenne après 3 mois" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card px-6 py-8 text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-3xl font-bold text-transparent">
                    {stat.value}
                  </div>
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