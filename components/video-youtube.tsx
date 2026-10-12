"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

// Video YouTube chargee seulement au clic (facade) : page rapide, et aucun cookie
// YouTube tant que le visiteur ne lance pas la video (mode youtube-nocookie).
// Le bouton de lecture est en bas de l'image pour laisser le logo de la miniature bien visible.
export function VideoYoutube({
  id,
  poster,
  titre,
  duree,
  sizes = "(min-width: 1024px) 1024px, 100vw",
  className = "",
}: {
  id: string
  poster: string
  titre: string
  duree: string
  sizes?: string
  className?: string
}) {
  const [lancee, setLancee] = useState(false)

  return (
    <div className={`@container relative aspect-video w-full overflow-hidden rounded-2xl bg-wine-dark ring-1 ring-wine/10 ${className}`}>
      {lancee ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLancee(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Lire la vidéo : ${titre} (${duree})`}
        >
          <Image src={poster} alt="" fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-wine-dark/60 to-transparent" />
          {/* grande video : pastille centree en bas ; petite video : bouton rond dans le coin */}
          <span className="absolute bottom-[6%] left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-full bg-gold py-2.5 pl-2.5 pr-5 font-semibold text-wine-dark shadow-xl shadow-wine-dark/40 ring-2 ring-ivory/60 transition-transform duration-300 group-hover:scale-105 @2xl:flex">
            <span className="flex size-10 items-center justify-center rounded-full bg-wine text-gold-light">
              <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap text-base">Regarder · {duree}</span>
          </span>
          <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-gold py-1.5 pl-1.5 pr-3 text-sm font-semibold text-wine-dark shadow-lg shadow-wine-dark/40 ring-2 ring-ivory/60 transition-transform duration-300 group-hover:scale-105 @2xl:hidden">
            <span className="flex size-8 items-center justify-center rounded-full bg-wine text-gold-light">
              <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
            </span>
            {duree}
          </span>
        </button>
      )}
    </div>
  )
}
