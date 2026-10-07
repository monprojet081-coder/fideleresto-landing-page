import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ivory pt-28 pb-16 sm:pt-32 lg:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-wine/80">
              Logiciel de fidélité pour restaurants
            </p>
            <h1 className="text-balance font-display font-semibold tracking-tight text-ink">
              <span className="block text-4xl sm:text-5xl md:text-6xl md:leading-[1.05]">Augmentez votre</span>
              <span className="mt-1 block text-5xl text-wine sm:text-6xl md:text-7xl md:leading-[1.02]">
                chiffre d&apos;affaires
              </span>
              <span className="mt-4 block text-2xl font-medium text-ink/70 sm:text-3xl">
                en faisant revenir vos clients.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-pretty text-lg leading-relaxed text-ink/70">
              Vos clients scannent un QR code, tournent la roue et gagnent une récompense à venir chercher au
              comptoir. Vous gardez leurs coordonnées, suivez tout depuis un tableau de bord et les relancez
              automatiquement quand ils tardent à revenir.
            </p>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 bg-wine px-7 text-base text-gold-light shadow-lg shadow-wine/20 hover:bg-wine-dark"
                nativeButton={false}
                render={<a href="/inscription?plan=standard_mensuel" />}
              >
                Essayer gratuitement 14 jours
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="-ml-3 h-12 px-3 text-base text-ink underline sm:ml-0 decoration-wine/30 decoration-2 underline-offset-4 hover:bg-transparent hover:text-wine"
                nativeButton={false}
                render={<a href="#comment-ca-marche" />}
              >
                Voir comment ça marche
              </Button>
            </div>

            <p className="mt-5 text-sm text-ink/65">
              Aucune application à installer pour vos clients.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <Image
              src="/assets/hero-mockup.webp"
              alt="L'application FidèleResto sur un smartphone : la roue de la chance à tourner, un lot « Boisson gratuite ! », la carte de fidélité du restaurant et l'invitation à laisser un avis Google"
              width={1200}
              height={1097}
              priority
              sizes="(min-width: 1024px) 560px, 90vw"
              className="h-auto w-full drop-shadow-[0_28px_34px_rgba(66,16,28,0.22)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
