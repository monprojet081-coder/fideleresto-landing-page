"use client"

// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Email ou mot de passe incorrect.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="bg-card p-8 rounded-2xl shadow-sm w-full max-w-md border border-wine/10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-display font-semibold text-ink">Connexion</h1>
          <p className="text-ink/55 mt-1 text-sm">Accédez à votre espace restaurateur</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {error && <p className="text-wine text-sm">{error}</p>}

          <div className="text-right">
            <a href="/mot-de-passe-oublie" className="text-xs text-ink/55 hover:text-wine hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine hover:bg-wine-dark text-gold-light font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/55">
          Pas encore de compte ?{" "}
          <a href="/inscription?plan=standard_mensuel" className="text-wine font-medium hover:underline">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  )
}