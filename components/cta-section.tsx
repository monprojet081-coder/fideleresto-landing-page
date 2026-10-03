import { Button } from "@/components/ui/button"

const perforation = {
  maskImage: "radial-gradient(circle at 10px 2.5px, transparent 6px, black 6.5px)",
  maskSize: "20px 20px",
  maskRepeat: "repeat-x",
  WebkitMaskImage: "radial-gradient(circle at 10px 2.5px, transparent 6px, black 6.5px)",
  WebkitMaskSize: "20px 20px",
  WebkitMaskRepeat: "repeat-x",
} as const

export function CtaSection() {
  return (
    <section className="bg-ivory px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-wine text-gold-light">
        <div className="h-5 bg-ivory" style={perforation} aria-hidden="true" />

        <div className="px-6 py-14 text-center sm:px-16 sm:py-20">
          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Vos tables sont prêtes. Et votre QR code ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-ivory/75">
            Installez FidèleResto en quelques minutes et laissez vos clients vous donner une bonne
            raison de revenir.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-gold px-7 text-base text-wine-dark hover:bg-gold-light"
              nativeButton={false}
              render={<a href="/inscription?plan=standard_mensuel" />}
            >
              Essayer gratuitement 14 jours
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-3 text-base text-gold-light underline decoration-gold-light/40 decoration-2 underline-offset-4 hover:bg-transparent hover:text-ivory"
              nativeButton={false}
              render={<a href="#tarifs" />}
            >
              Voir les tarifs
            </Button>
          </div>
        </div>

        <div className="h-5 bg-ivory" style={perforation} aria-hidden="true" />
      </div>
    </section>
  )
}