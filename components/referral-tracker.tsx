"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

// Capture le parametre ?ref=xxx (ou ?parrain=xxx) present dans l'URL, quelle que soit
// la page sur laquelle le visiteur arrive en premier (lien partage par un influenceur,
// un apporteur d'affaires...), et le conserve pour qu'il soit toujours disponible
// au moment de l'inscription meme si le visiteur navigue sur plusieurs pages avant.
function ReferralTrackerContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("parrain")
    if (ref) {
      localStorage.setItem("fideleresto_parrain", ref)
    }
  }, [searchParams])

  return null
}

export function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <ReferralTrackerContent />
    </Suspense>
  )
}
