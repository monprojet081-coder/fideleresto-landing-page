"use client"

import { useEffect } from "react"

// Enregistre une visite du site, une seule fois par session de navigateur (pas a
// chaque changement de page), pour eviter de gonfler artificiellement le compteur.
export function VisitTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem("fideleresto_visite_loggee")) return
    sessionStorage.setItem("fideleresto_visite_loggee", "1")
    fetch("/api/visite", { method: "POST" }).catch(() => {})
  }, [])

  return null
}
