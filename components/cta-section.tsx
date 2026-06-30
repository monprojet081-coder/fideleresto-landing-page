import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
          </div>

          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à fidéliser vos clients dès aujourd&apos;hui ?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed opacity-90">
            Rejoignez les centaines de restaurateurs qui boostent leur fidélité et leurs avis Google avec FidèleResto.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<a href="/inscription" />}
            >
              Commencer gratuitement
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              className="h-11 border border-white/30 bg-transparent px-6 text-base text-white hover:bg-white/10"
              nativeButton={false}
              render={<a href="#comment-ca-marche" />}
            >
              Demander une démo
            </Button>
          </div>
          <p className="relative mt-6 text-sm opacity-80">
            14 jours d&apos;essai gratuit · Sans carte bancaire · Sans engagement
          </p>
        </div>
      </div>
    </section>
  )
}