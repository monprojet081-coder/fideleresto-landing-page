import { VideoYoutube } from "@/components/video-youtube"

const YOUTUBE_ID = "3jDmugug0D8"

export function VideoPresentationSection() {
  return (
    <section id="video" className="relative border-t border-wine/10 bg-ivory py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            FidèleResto en 38 secondes
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/80">
            Le QR code, la roue, la récompense, la carte de fidélité : tout le parcours de votre client, du premier
            repas à son retour.
          </p>
        </div>

        <VideoYoutube
          id={YOUTUBE_ID}
          poster="/assets/video-presentation-poster.webp"
          titre="Présentation de FidèleResto"
          duree="0:38"
          className="mt-10 shadow-[0_30px_60px_rgba(66,16,28,0.25)]"
        />
      </div>
    </section>
  )
}
