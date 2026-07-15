import { ArrowRight } from "lucide-react"
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
            L&apos;outil de fidélisation pensé pour les restaurateurs
          </span>

          <h1 className="mt-6 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Transformez chaque repas en{" "}
            <span className="italic text-wine">client qui revient</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink/65">
            Vous tenez un restaurant ? FidèleResto installe une roue de la chance derrière un simple
            QR code sur vos tables. Vos clients jouent, gagnent une récompense, laissent un avis Google
            et reviennent — pendant que vous récupérez leurs coordonnées et suivez tout depuis un tableau de bord.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 bg-wine px-6 text-base text-gold-light shadow-lg shadow-wine/20 transition-transform hover:scale-[1.02] hover:bg-wine-dark"
              nativeButton={false}
              render={<a href="/inscription?plan=standard_mensuel" />}
            >
              Essayer gratuitement 14 jours
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

          <p className="mt-4 text-sm text-ink/45">
            Sans engagement · Résiliable à tout moment · Aucune application à installer pour vos clients
          </p>
        </div>
      </div>
    </section>
  )
}
