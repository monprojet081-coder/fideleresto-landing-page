"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("")
  const [envoye, setEnvoye] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reinitialiser-mot-de-passe`,
    })

    if (error) {
      setError("Une erreur est survenue. Vérifiez l'adresse et réessayez.")
      setLoading(false)
      return
    }

    setEnvoye(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="bg-card p-8 rounded-2xl shadow-sm w-full max-w-md border border-wine/10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-display font-semibold text-ink">Mot de passe oublié</h1>
          <p className="text-ink/55 mt-1 text-sm">Recevez un lien pour le réinitialiser</p>
        </div>

        {envoye ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📩</div>
            <p className="text-ink/70 text-sm">
              Si un compte existe avec cette adresse, un email contenant un lien de réinitialisation vient
              d&apos;être envoyé. Pensez à vérifier vos spams.
            </p>
            <a href="/connexion" className="mt-6 inline-block text-wine font-medium text-sm hover:underline">
              Retour à la connexion
            </a>
          </div>
        ) : (
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

            {error && <p className="text-wine text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-wine hover:bg-wine-dark text-gold-light font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>

            <p className="text-center text-sm text-ink/55">
              <a href="/connexion" className="text-wine font-medium hover:underline">
                Retour à la connexion
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
