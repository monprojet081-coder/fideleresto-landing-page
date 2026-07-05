import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ivory pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Halo doré discret en arrière-plan, façon projecteur sur une table */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute top-32 -left-24 h-[280px] w-[280px] rounded-full bg-wine/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-wine-dark">
            <span className="flex size-2 rounded-full bg-gold" aria-hidden="true" />
            La fidélité client, simplifiée pour les restaurants
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Fidélisez vos clients et multipliez vos{" "}
            <span className="italic text-wine">avis Google</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink/65">
            FidèleResto transforme chaque visite en occasion de revenir. Un simple QR code,
            une roue de la fidélité ludique et des récompenses qui font revenir vos clients —
            tout en boostant votre réputation en ligne.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 bg-wine px-6 text-base text-gold-light shadow-lg shadow-wine/20 transition-transform hover:scale-[1.02] hover:bg-wine-dark"
              nativeButton={false}
              render={<a href="/inscription?plan=standard_mensuel" />}
            >
              Commencer
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 border-wine/20 px-6 text-base text-ink hover:bg-wine/5"
              nativeButton={false}
              render={<a href="#comment-ca-marche" />}
            >
              Voir comment ça marche
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-ink/55">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-gold text-gold" />
              ))}
            </span>
            Plébiscité par plus de 300 restaurateurs en France
          </div>
        </div>

        {/* Signature : la carte de stats façon ticket de tombola, avec perforations et encoches */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="relative rounded-2xl border border-wine/15 bg-card shadow-xl shadow-wine/5">
            <div className="grid divide-y divide-dashed divide-wine/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { value: "+38%", label: "de clients fidèles" },
                { value: "x4", label: "plus d'avis Google" },
                { value: "4,8/5", label: "note moyenne après 3 mois" },
              ].map((stat, i) => (
                <div key={stat.label} className="relative px-6 py-8 text-center">
                  {i > 0 && (
                    <span
                      className="absolute top-1/2 -left-2.5 hidden size-5 -translate-y-1/2 rounded-full bg-ivory sm:block"
                      aria-hidden="true"
                    />
                  )}
                  <div className="font-display text-3xl font-semibold text-wine">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-ink/55">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}