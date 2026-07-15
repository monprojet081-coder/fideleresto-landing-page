"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function SignupForm() {
  return (
    <Suspense fallback={null}>
      <SignupFormContent />
    </Suspense>
  )
}

function SignupFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "standard_mensuel"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [avecCreationSite, setAvecCreationSite] = useState(false)
  const [avecReseaux, setAvecReseaux] = useState(false)
  const [formData, setFormData] = useState({
    nomRestaurant: "",
    typeCuisine: "",
    ville: "",
    telephone: "",
    googleAvisUrl: "",
    email: "",
    motDePasse: "",
    confirmerMotDePasse: "",
    conditions: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (!formData.conditions) {
      setError("Veuillez accepter les conditions générales.")
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.motDePasse,
      options: {
        data: {
          nom_restaurant: formData.nomRestaurant,
          type_cuisine: formData.typeCuisine,
          ville: formData.ville,
          telephone: formData.telephone,
          google_avis_url: formData.googleAvisUrl,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      // Cas rare : confirmation par email requise, pas de session immédiate
      router.push("/dashboard")
      return
    }

    // Redirection directe vers le paiement Stripe pour le plan choisi
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          plan,
          avecCreationSite: plan.startsWith("premium") ? avecCreationSite : false,
          avecReseaux: plan.startsWith("premium") ? avecReseaux : false,
        }),
      })
      const checkoutData = await res.json()
      if (checkoutData.url) {
        window.location.href = checkoutData.url
        return
      }
    } catch (err) {
      console.error("Erreur redirection paiement:", err)
    }

    // Si le paiement n'a pas pu démarrer pour une raison quelconque, on ne bloque pas
    // l'utilisateur : il atterrit sur le dashboard et pourra payer depuis l'onglet Abonnement
    router.push("/dashboard")
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">
          Créez votre compte restaurant
        </h1>
        <p className="text-ink/55">
          Rejoignez FidèleResto et commencez à fidéliser vos clients dès aujourd'hui.
        </p>
      </div>

      <div className="bg-card border border-wine/10 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Nom du restaurant
            </label>
            <input
              type="text"
              placeholder="Chez Marco"
              required
              className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              value={formData.nomRestaurant}
              onChange={(e) => setFormData({ ...formData, nomRestaurant: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Type de cuisine
            </label>
            <select
              required
              className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-card"
              value={formData.typeCuisine}
              onChange={(e) => setFormData({ ...formData, typeCuisine: e.target.value })}
            >
              <option value="">Sélectionnez un type</option>
              <option value="pizzeria">Pizzeria</option>
              <option value="kebab">Kebab</option>
              <option value="burger">Burger</option>
              <option value="sushi">Sushi</option>
              <option value="francais">Traditionnel français</option>
              <option value="italien">Italien</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">
                Ville
              </label>
              <input
                type="text"
                placeholder="Paris"
                required
                pattern="[A-Za-zÀ-ÿ\s\-']+"
                title="La ville ne doit contenir que des lettres"
                className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                required
                pattern="^(0|\+33\s?)[1-9]([\s.\-]?\d{2}){4}$"
                title="Format attendu : 06 12 34 56 78"
                className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Lien de votre page avis Google
            </label>
            <input
              type="text"
              placeholder="Ex : https://g.page/r/XXXXXXXXXXXX/review"
              className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              value={formData.googleAvisUrl}
              onChange={(e) => setFormData({ ...formData, googleAvisUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-ink/45">
              Vous pouvez le laisser vide pour l'instant, mais pensez à l'ajouter dans Paramètres avant de commencer à utiliser la roue, sinon vos clients ne pourront pas laisser d'avis après avoir gagné.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">
              Email professionnel
            </label>
            <input
              type="email"
              placeholder="contact@monresto.fr"
              required
              className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-wine/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                value={formData.confirmerMotDePasse}
                onChange={(e) => setFormData({ ...formData, confirmerMotDePasse: e.target.value })}
              />
            </div>
          </div>

          {plan.startsWith("premium") && (
            <div className="space-y-2 rounded-lg border border-wine/10 bg-secondary/40 p-4">
              <p className="text-sm font-medium text-ink/80">Options (facultatif)</p>
              <label className="flex items-start gap-2.5 text-sm text-ink/75 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-wine"
                  checked={avecCreationSite}
                  onChange={(e) => setAvecCreationSite(e.target.checked)}
                />
                <span>
                  Je n&apos;ai pas encore de site, créez-moi en un
                  <span className="block text-xs text-ink/50">
                    600€ de frais uniques, puis {" "}
                    {plan.endsWith("trimestriel") ? "300€/trimestre" : plan.endsWith("annuel") ? "1200€/an" : "100€/mois"} de maintenance
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-ink/75 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-wine"
                  checked={avecReseaux}
                  onChange={(e) => setAvecReseaux(e.target.checked)}
                />
                <span>
                  Gérez-moi mes réseaux sociaux
                  <span className="block text-xs text-ink/50">
                    400€ de frais uniques, puis {" "}
                    {plan.endsWith("trimestriel") ? "600€/trimestre" : plan.endsWith("annuel") ? "2400€/an" : "200€/mois"} de gestion
                  </span>
                </span>
              </label>
              <p className="text-xs text-ink/45 pt-1">
                Ces options resteront modifiables plus tard depuis votre dashboard, onglet Abonnement.
              </p>
            </div>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="conditions"
              className="mt-1 accent-wine"
              checked={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.checked })}
            />
            <label htmlFor="conditions" className="text-sm text-ink/70">
              J'accepte les{" "}
              <a href="/cgv" className="text-wine hover:underline">
                conditions générales
              </a>{" "}
              et la{" "}
              <a href="/confidentialite" className="text-wine hover:underline">
                politique de confidentialité
              </a>
            </label>
          </div>

          {error && (
            <p className="text-wine text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine hover:bg-wine-dark disabled:opacity-60 text-gold-light font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-ink/55">
            Déjà un compte ?{" "}
            <a href="/connexion" className="text-wine hover:underline font-medium">
              Se connecter
            </a>
          </p>

        </form>
      </div>

      <p className="text-center text-xs text-ink/45 mt-6">
        14 jours d'essai gratuit · Sans engagement
      </p>
    </div>
  )
}