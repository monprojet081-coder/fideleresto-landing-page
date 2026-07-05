"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"

type Step = "checking" | "not_found" | "not_premium" | "auth" | "compte"
type MenuItem = { id: string; nom: string; description: string | null; prix: number | null; categorie: string }
type Restaurant = {
  nom_restaurant: string
  slug: string
  fidelite_tampons_requis: number
  fidelite_recompense: string
}

export default function CartePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [step, setStep] = useState<Step>("checking")
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tampons, setTampons] = useState(0)
  const [user, setUser] = useState<any>(null)

  const [mode, setMode] = useState<"connexion" | "inscription">("inscription")
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  React.useEffect(() => {
    const init = async () => {
      const { data: resto } = await supabase
        .from("restaurants")
        .select("nom_restaurant, slug, fidelite_tampons_requis, fidelite_recompense, plan")
        .eq("slug", slug)
        .maybeSingle()

      if (!resto) {
        setStep("not_found")
        return
      }
      if (resto.plan !== "premium") {
        setStep("not_premium")
        return
      }
      setRestaurant(resto)

      const { data: items } = await supabase
        .from("menu_items")
        .select("id, nom, description, prix, categorie")
        .eq("restaurant_slug", slug)
        .order("ordre", { ascending: true })
      setMenuItems(items || [])

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        await chargerCarte(currentUser.id)
        setStep("compte")
      } else {
        setStep("auth")
      }
    }
    init()
  }, [slug])

  const chargerCarte = async (clientId: string) => {
    const { data: carte } = await supabase
      .from("cartes_fidelite")
      .select("tampons")
      .eq("client_id", clientId)
      .eq("restaurant_slug", slug)
      .maybeSingle()

    if (carte) {
      setTampons(carte.tampons)
    } else {
      // Première visite de ce client sur ce restaurant : on crée la carte à 0
      await supabase
        .from("cartes_fidelite")
        .insert([{ client_id: clientId, restaurant_slug: slug, tampons: 0 }])
      setTampons(0)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "inscription") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password: motDePasse })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      if (data.user) {
        setUser(data.user)
        await chargerCarte(data.user.id)
        setStep("compte")
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password: motDePasse })
      if (signInError) {
        setError("Email ou mot de passe incorrect.")
        setLoading(false)
        return
      }
      if (data.user) {
        setUser(data.user)
        await chargerCarte(data.user.id)
        setStep("compte")
      }
    }
    setLoading(false)
  }

  if (step === "checking") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <p className="text-ink/50 text-sm">Chargement...</p>
      </div>
    )
  }

  if (step === "not_found") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-display font-semibold text-ink mb-2">Page introuvable</h1>
          <p className="text-ink/55 text-sm">Ce lien ne correspond à aucun restaurant.</p>
        </div>
      </div>
    )
  }

  if (step === "not_premium") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-display font-semibold text-ink mb-2">Fonctionnalité non disponible</h1>
          <p className="text-ink/55 text-sm">Ce restaurant ne propose pas encore de menu digital ni de carte de fidélité.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-wine text-gold-light mx-auto mb-4">
            🍽️
          </span>
          <h1 className="text-2xl font-display font-semibold text-ink">{restaurant?.nom_restaurant}</h1>
          <p className="text-ink/55 text-sm mt-2">Menu et carte de fidélité</p>
        </div>

        {step === "auth" && (
          <>
            <div className="mb-6 inline-flex w-full items-center rounded-full border border-wine/15 bg-secondary/40 p-1">
              <button
                onClick={() => setMode("inscription")}
                className={`flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  mode === "inscription" ? "bg-wine text-gold-light" : "text-ink/60"
                }`}
              >
                Créer mon compte
              </button>
              <button
                onClick={() => setMode("connexion")}
                className={`flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  mode === "connexion" ? "bg-wine text-gold-light" : "text-ink/60"
                }`}
              >
                Se connecter
              </button>
            </div>

            <p className="text-xs text-ink/50 text-center mb-4">
              Un seul compte pour toutes vos cartes de fidélité FidèleResto
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              {error && <p className="text-wine text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-wine hover:bg-wine-dark disabled:opacity-60 text-gold-light font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? "..." : mode === "inscription" ? "Créer mon compte" : "Se connecter"}
              </button>
            </form>
          </>
        )}

        {step === "compte" && restaurant && (
          <div>
            {/* Carte de fidélité */}
            <div className="rounded-xl border border-gold/30 bg-gold/8 p-5 mb-8">
              <p className="text-sm font-medium text-wine-dark mb-3">Votre carte de fidélité</p>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {Array.from({ length: restaurant.fidelite_tampons_requis }).map((_, i) => (
                  <span
                    key={i}
                    className={`flex size-8 items-center justify-center rounded-full text-sm ${
                      i < tampons ? "bg-wine text-gold-light" : "bg-card border border-wine/15 text-ink/20"
                    }`}
                  >
                    {i < tampons ? "★" : ""}
                  </span>
                ))}
              </div>
              <p className="text-xs text-ink/60">
                {tampons} / {restaurant.fidelite_tampons_requis} — Récompense : <span className="font-medium">{restaurant.fidelite_recompense}</span>
              </p>
            </div>

            {/* Menu */}
            <div>
              <p className="text-sm font-medium text-ink mb-3">Le menu</p>
              {menuItems.length === 0 ? (
                <p className="text-sm text-ink/50 text-center py-6">Le menu n'est pas encore disponible.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    menuItems.reduce((acc: Record<string, MenuItem[]>, item) => {
                      acc[item.categorie] = acc[item.categorie] || []
                      acc[item.categorie].push(item)
                      return acc
                    }, {})
                  ).map(([categorie, items]) => (
                    <div key={categorie}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-wine mb-2">{categorie}</p>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className="flex justify-between gap-3 text-sm">
                            <div>
                              <p className="text-ink font-medium">{item.nom}</p>
                              {item.description && <p className="text-ink/50 text-xs">{item.description}</p>}
                            </div>
                            {item.prix != null && <p className="text-ink/70 whitespace-nowrap">{item.prix}€</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
