"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ReinitialiserMotDePassePage() {
  const router = useRouter()
  const [motDePasse, setMotDePasse] = useState("")
  const [confirmer, setConfirmer] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (motDePasse !== confirmer) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    if (motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setLoading(true)
    // Quand l'utilisateur arrive depuis le lien de l'email, Supabase a déjà ouvert une session
    // temporaire de récupération : updateUser applique alors le nouveau mot de passe
    const { error } = await supabase.auth.updateUser({ password: motDePasse })

    if (error) {
      setError("Le lien a peut-être expiré. Refaites une demande de réinitialisation.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="bg-card p-8 rounded-2xl shadow-sm w-full max-w-md border border-wine/10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-display font-semibold text-ink">Nouveau mot de passe</h1>
          <p className="text-ink/55 mt-1 text-sm">Choisissez un nouveau mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              required
              className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmer}
              onChange={e => setConfirmer(e.target.value)}
              required
              className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {error && <p className="text-wine text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine hover:bg-wine-dark text-gold-light font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  )
}
