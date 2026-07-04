import { ArrowRight, Star, QrCode } from "lucide-react"
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
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Colonne texte */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-wine-dark">
              <span className="flex size-2 rounded-full bg-gold" aria-hidden="true" />
              La fidélité client, simplifiée pour les restaurants
            </span>

            <h1 className="mt-6 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Fidélisez vos clients et multipliez vos{" "}
              <span className="italic text-wine">avis Google</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink/65">
              FidèleResto transforme chaque visite en occasion de revenir. Un simple QR code,
              une roue de la fidélité ludique et des récompenses qui font revenir vos clients —
              tout en boostant votre réputation en ligne.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 bg-wine px-6 text-base text-gold-light shadow-lg shadow-wine/20 transition-transform hover:scale-[1.02] hover:bg-wine-dark"
                nativeButton={false}
                render={<a href="/inscription" />}
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

          {/* Colonne visuelle : mockup téléphone avec la roue de la fidélité */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="relative rounded-[2.5rem] border-[6px] border-ink/90 bg-ink/90 shadow-2xl shadow-wine/20">
              <div className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-ink/90" />
              <div className="overflow-hidden rounded-[2rem] bg-card">
                <div className="flex flex-col items-center gap-4 px-5 pt-10 pb-8">
                  <p className="text-center font-display text-sm font-semibold text-ink">
                    Le Petit Zinc <span className="not-italic">🍷</span>
                  </p>
                  <p className="text-center text-xs text-ink/55">
                    Tournez la roue et tentez votre chance !
                  </p>

                  {/* La roue */}
                  <div className="relative mt-2 size-48">
                    <svg
                      viewBox="0 0 200 200"
                      className="size-full drop-shadow-lg"
                      style={{ transform: "rotate(-12deg)" }}
                      aria-hidden="true"
                    >
                      <path d="M100,100 L100,10 A90,90 0 0,1 177.94,55 Z" fill="var(--wine)" />
                      <path d="M100,100 L177.94,55 A90,90 0 0,1 177.94,145 Z" fill="var(--gold)" />
                      <path d="M100,100 L177.94,145 A90,90 0 0,1 100,190 Z" fill="var(--sage)" />
                      <path d="M100,100 L100,190 A90,90 0 0,1 22.06,145 Z" fill="#a8536a" />
                      <path d="M100,100 L22.06,145 A90,90 0 0,1 22.06,55 Z" fill="var(--wine-dark)" />
                      <path d="M100,100 L22.06,55 A90,90 0 0,1 100,10 Z" fill="var(--gold-light)" />
                      <circle cx="100" cy="100" r="90" fill="none" stroke="var(--ivory)" strokeWidth="3" />
                      <text x="140" y="38" textAnchor="middle" fontSize="16">🥤</text>
                      <text x="162" y="103" textAnchor="middle" fontSize="16">🍰</text>
                      <text x="140" y="168" textAnchor="middle" fontSize="16">🏷️</text>
                      <text x="60" y="168" textAnchor="middle" fontSize="14">😢</text>
                      <text x="38" y="103" textAnchor="middle" fontSize="16">🎁</text>
                      <text x="60" y="38" textAnchor="middle" fontSize="16">☕</text>
                      <circle cx="100" cy="100" r="16" fill="var(--ivory)" />
                    </svg>
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M9 18 L1 2 L17 2 Z" fill="var(--ink)" />
                      </svg>
                    </span>
                  </div>

                  <span className="mt-1 rounded-full bg-wine px-5 py-2 text-xs font-semibold text-gold-light">
                    Faire tourner la roue
                  </span>
                </div>
              </div>
            </div>

            {/* Carte flottante : gain */}
            <div className="absolute -right-6 top-10 flex items-center gap-2 rounded-xl border border-wine/10 bg-card px-3 py-2 text-left shadow-lg shadow-wine/10">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-base">
                🎉
              </span>
              <span>
                <span className="block text-xs font-semibold text-ink">Vous avez gagné !</span>
                <span className="block text-[11px] text-ink/55">Café offert ☕</span>
              </span>
            </div>

            {/* Carte flottante : QR code, rappelle le point de départ du parcours */}
            <div className="absolute -bottom-4 -left-6 flex items-center gap-2 rounded-xl border border-wine/10 bg-card px-3 py-2 shadow-lg shadow-wine/10">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-wine text-gold-light">
                <QrCode className="size-4" aria-hidden="true" />
              </span>
              <span className="block text-[11px] font-medium text-ink/70">
                Scanné en salle
              </span>
            </div>
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