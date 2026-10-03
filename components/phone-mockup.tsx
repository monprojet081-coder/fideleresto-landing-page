import type { ReactNode } from "react"

/**
 * Petit mockup de téléphone stylisé, codé en SVG/CSS (pas d'image générée).
 * Sert d'élément visuel signature réutilisé dans "Comment ça marche" et "Fonctionnalités".
 */
export function PhoneMockup({
  children,
  tone = "wine",
  size = "md",
}: {
  children: ReactNode
  tone?: "wine" | "sage"
  size?: "md" | "lg"
}) {
  const frameBorder = tone === "wine" ? "border-wine/20" : "border-sage/30"
  const dims = size === "lg" ? "h-56 w-[8.5rem]" : "h-40 w-24"

  return (
    <div className={`relative mx-auto flex ${dims} flex-col rounded-[1.1rem] border-[3px] ${frameBorder} bg-ink p-1.5 shadow-lg shadow-wine/10`}>
      <div className="mx-auto mb-1 h-1 w-6 rounded-full bg-ivory/20" aria-hidden="true" />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[0.6rem] bg-ivory">
        {children}
      </div>
    </div>
  )
}
