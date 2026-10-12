"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

const YOUTUBE_ID = "3jDmugug0D8"

// La video YouTube ne se charge qu'au clic (facade) : la page reste rapide
// et aucun cookie YouTube n'est depose tant que le visiteur ne lance pas la video.
export function VideoPresentationSection() {
  const [lancee, setLancee] = useState(false)

  return (
    <section id="video" className="relative border-t border-wine/10 bg-ivory py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            FidèleResto en 38 secondes
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/70">
            Le QR code, la roue, la récompense, la carte de fidélité : tout le parcours de votre client, du premier
            repas à son retour.
          </p>
        </div>

        <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl bg-wine-dark shadow-[0_30px_60px_rgba(66,16,28,0.25)] ring-1 ring-wine/10">
          {lancee ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Présentation de FidèleResto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setLancee(true)}
              className="group absolute inset-0 h-full w-full cursor-pointer"
              aria-label="Lire la vidéo de présentation de FidèleResto (38 secondes)"
            >
              <Image
                src="/assets/video-presentation-poster.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 bg-wine-dark/10 transition-colors group-hover:bg-wine-dark/20" />
              <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-wine text-gold-light shadow-xl shadow-wine/40 ring-4 ring-ivory/70 transition-transform duration-300 group-hover:scale-110 sm:size-24">
                <Play className="ml-1 size-7 fill-current sm:size-10" aria-hidden="true" />
              </span>
              <span className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full bg-ink/70 sm:block px-4 py-1.5 text-sm font-medium text-ivory backdrop-blur-sm">
                ▶ 0:38 · avec le son
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
