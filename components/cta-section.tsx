import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à fidéliser vos clients dès aujourd&apos;hui ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed opacity-90">
            Rejoignez les centaines de restaurateurs qui boostent leur fidélité et leurs avis Google avec FidèleResto.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<a href="#tarifs" />}
            >
              Commencer gratuitement
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              className="h-11 border border-primary-foreground/30 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10"
              nativeButton={false}
              render={<a href="#comment-ca-marche" />}
            >
              Demander une démo
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            14 jours d&apos;essai gratuit · Sans carte bancaire · Sans engagement
          </p>
        </div>
      </div>
    </section>
  )
}
