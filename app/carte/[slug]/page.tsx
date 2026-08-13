"use client"

// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

import React, { useState } from "react"
import { UtensilsCrossed } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Step = "checking" | "not_found" | "no_access" | "auth" | "compte"
type Restaurant = {
  nom_restaurant: string
  slug: string
  fidelite_tampons_requis: number
  fidelite_recompense: string
  menu_type: "pdf" | "image" | "document" | null
  menu_url: string | null
  menu_html: string | null
}

export default function CartePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [step, setStep] = useState<Step>("checking")
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [tampons, setTampons] = useState(0)
  const [user, setUser] = useState<any>(null)

  const [mode, setMode] = useState<"connexion" | "inscription">("inscription")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  React.useEffect(() => {
    const init = async () => {
      const { data: resto } = await supabase
        .from("restaurants")
        .select("nom_restaurant, slug, fidelite_tampons_requis, fidelite_recompense, plan, statut_abonnement, menu_type, menu_url, menu_html")
        .eq("slug", slug)
        .maybeSingle()

      if (!resto) {
        setStep("not_found")
        return
      }
      // Menu digital + carte fidélité sont inclus dans Standard ET Premium :
      // l'accès dépend d'un abonnement actif (ou en essai), pas du plan précis
      if (!resto.plan || !["actif", "essai"].includes(resto.statut_abonnement)) {
        setStep("no_access")
        return
      }
      setRestaurant(resto)

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        const ok = await chargerCarte(currentUser.id)
        setStep(ok ? "compte" : "auth")
      } else {
        setStep("auth")
      }
    }
    init()
  }, [slug])

  const chargerCarte = async (clientId: string, prenomAFournir?: string): Promise<boolean> => {
    const { data: carte, error: erreurLecture } = await supabase
      .from("cartes_fidelite")
      .select("tampons, prenom")
      .eq("client_id", clientId)
      .eq("restaurant_slug", slug)
      .maybeSingle()

    if (erreurLecture) {
      console.error("Erreur lecture carte:", erreurLecture.message)
      setError("Impossible de charger votre carte de fidélité. Réessayez dans un instant.")
      return false
    }

    if (carte) {
      setTampons(carte.tampons)
      // Carte existante mais sans prenom enregistre (ancien compte cree avant l'ajout de ce champ) :
      // on le complete si on en a un a fournir
      if (prenomAFournir && !carte.prenom) {
        const { error: erreurMaj } = await supabase
          .from("cartes_fidelite")
          .update({ prenom: prenomAFournir })
          .eq("client_id", clientId)
          .eq("restaurant_slug", slug)
        if (erreurMaj) console.error("Erreur mise a jour prenom:", erreurMaj.message)
      }
      return true
    } else {
      // Première visite de ce client sur ce restaurant : on crée la carte à 0
      const { error: erreurCreation } = await supabase
        .from("cartes_fidelite")
        .insert([{ client_id: clientId, restaurant_slug: slug, tampons: 0, prenom: prenomAFournir || null }])
      if (erreurCreation) {
        console.error("Erreur creation carte:", erreurCreation.message)
        setError("Votre compte est créé, mais votre carte de fidélité n'a pas pu être enregistrée. Contactez le restaurant.")
        return false
      }
      setTampons(0)
      return true
    }
  }

  React.useEffect(() => {
    if (step === "compte" && user) {
      import('qrcode').then(QRCode => {
        const canvas = document.getElementById('qr-carte-canvas') as HTMLCanvasElement
        if (canvas) {
          QRCode.toCanvas(
            canvas,
            `fideleresto:client:${user.id}`,
            { width: 180, margin: 1, color: { dark: "#241914", light: "#ffffff" } },
            () => {}
          )
        }
      })
    }
  }, [step, user])

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
        const ok = await chargerCarte(data.user.id, prenom)
        if (ok) setStep("compte")
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
        const ok = await chargerCarte(data.user.id)
        if (ok) setStep("compte")
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

  if (step === "no_access") {
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
      <div className={`bg-card rounded-2xl shadow-sm border border-wine/10 w-full p-8 ${step === "compte" ? "max-w-4xl" : "max-w-md"}`}>

        <div className="text-center mb-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-wine text-gold-light mx-auto mb-3">
            <UtensilsCrossed className="size-5.5" aria-hidden="true" />
          </span>
          <p className="text-xs font-medium tracking-wide text-ink/40 uppercase mb-1">FidèleResto</p>
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
              {mode === "inscription" && (
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              )}
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
          <div className="grid gap-8 md:grid-cols-[300px_1fr] items-start">
            {/* Carte de fidélité */}
            <div className="overflow-hidden rounded-xl border border-gold/30 bg-gold/8">
              <div className="h-1.5 bg-gradient-to-r from-gold via-wine to-gold" aria-hidden="true" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <UtensilsCrossed className="size-4 text-wine" aria-hidden="true" />
                  <p className="text-sm font-medium text-wine-dark">Votre carte de fidélité</p>
                </div>

                <div className="flex justify-center mb-4">
                  <canvas id="qr-carte-canvas" className="rounded-lg bg-card p-2 shadow-sm" />
                </div>
                <p className="text-xs text-ink/50 text-center mb-4">
                  Montrez ce QR code au comptoir au moment de payer
                </p>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  {Array.from({ length: restaurant.fidelite_tampons_requis }).map((_, i) => (
                    <span
                      key={i}
                      className={`flex size-8 items-center justify-center rounded-full text-sm transition-colors ${
                        i < tampons ? "bg-wine text-gold-light shadow-sm" : "bg-card border border-wine/15 text-ink/20"
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
            </div>

            {/* Menu */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink mb-3">Le menu</p>
              {!restaurant.menu_type ? (
                <p className="text-sm text-ink/50 text-center py-6">Le menu n'est pas encore disponible.</p>
              ) : restaurant.menu_type === "image" ? (
                <a href={restaurant.menu_url!} target="_blank" rel="noreferrer" className="block group">
                  <img src={restaurant.menu_url!} alt="Menu du restaurant" className="w-full rounded-lg border border-wine/10" />
                  <p className="mt-2 text-center text-sm text-wine font-medium group-hover:underline">
                    Ouvrir en plein écran ↗
                  </p>
                </a>
              ) : restaurant.menu_type === "pdf" ? (
                <div className="rounded-lg border border-wine/10 overflow-hidden">
                  <iframe src={restaurant.menu_url!} className="w-full h-[75vh] min-h-[500px]" title="Menu du restaurant" />
                  <a
                    href={restaurant.menu_url!}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-sm text-wine font-medium py-2.5 border-t border-wine/10 hover:underline"
                  >
                    Ouvrir en plein écran ↗
                  </a>
                </div>
              ) : restaurant.menu_html ? (
                <div
                  className="text-base text-ink prose prose-sm sm:prose-base max-w-none [&_table]:w-full [&_td]:border [&_td]:border-wine/10 [&_td]:px-3 [&_td]:py-2"
                  dangerouslySetInnerHTML={{ __html: restaurant.menu_html }}
                />
              ) : (
                <a href={restaurant.menu_url!} target="_blank" rel="noreferrer" className="text-sm text-wine font-medium hover:underline">
                  Télécharger le menu →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
