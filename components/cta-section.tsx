import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="bg-ivory px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-wine px-6 py-16 text-center text-gold-light sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-gold/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-gold/10 blur-3xl" />
          </div>

          <h2 className="relative mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Prêt à fidéliser vos clients dès aujourd&apos;hui ?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed opacity-85">
            Installez FidèleResto dans votre restaurant en quelques minutes et commencez à transformer
            vos visiteurs en habitués.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 bg-gold px-6 text-base text-wine-dark hover:bg-gold-light"
              nativeButton={false}
              render={<a href="/inscription?plan=standard_mensuel" />}
            >
              Essayer gratuitement 14 jours
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              className="h-11 border border-gold-light/30 bg-transparent px-6 text-base text-gold-light hover:bg-gold-light/10"
              nativeButton={false}
              render={<a href="#tarifs" />}
            >
              Voir les tarifs
            </Button>
          </div>
          <p className="relative mt-6 text-sm opacity-70">
            14 jours d&apos;essai gratuit · Sans engagement
          </p>
        </div>
      </div>
    </section>
  )
}