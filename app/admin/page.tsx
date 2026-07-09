"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ArrowRight, ShieldCheck } from "lucide-react"

type RestaurantAdmin = {
  id: string
  user_id: string
  slug: string
  nom_restaurant: string
  plan: string | null
  statut_abonnement: string | null
  email: string | null
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accesRefuse, setAccesRefuse] = useState(false)
  const [restaurants, setRestaurants] = useState<RestaurantAdmin[]>([])
  const [entreeEnCours, setEntreeEnCours] = useState<string | null>(null)
  const [erreur, setErreur] = useState("")

  useEffect(() => {
    const charger = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/connexion")
        return
      }

      const res = await fetch("/api/admin/restaurants", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.status === 403) {
        setAccesRefuse(true)
        setLoading(false)
        return
      }

      const result = await res.json()
      setRestaurants(result.restaurants || [])
      setLoading(false)
    }
    charger()
  }, [router])

  const accederAuCompte = async (restaurant: RestaurantAdmin) => {
    setErreur("")
    setEntreeEnCours(restaurant.id)

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ targetUserId: restaurant.user_id }),
    })

    const result = await res.json()
    if (result.error) {
      setErreur(result.error)
      setEntreeEnCours(null)
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      email: result.email,
      token_hash: result.hashedToken,
      type: "email",
    })

    if (error) {
      setErreur("Connexion au compte impossible : " + error.message)
      setEntreeEnCours(null)
      return
    }

    router.push("/dashboard")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-ivory text-ink/50">Chargement...</div>
  }

  if (accesRefuse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-wine/10 text-center max-w-md">
          <h1 className="text-xl font-display font-semibold text-ink mb-2">Accès refusé</h1>
          <p className="text-ink/55 text-sm">Ce compte n'a pas les droits administrateur.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="w-6 h-6 text-wine" />
          <h1 className="text-2xl font-display font-semibold text-ink">Espace admin — Tous les restaurants</h1>
        </div>

        {erreur && <p className="text-wine text-sm mb-4">{erreur}</p>}

        <div className="bg-card rounded-xl border border-wine/10 shadow-sm divide-y divide-wine/10">
          {restaurants.length === 0 && (
            <p className="p-6 text-sm text-ink/50">Aucun restaurant pour le moment.</p>
          )}
          {restaurants.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-ink">{r.nom_restaurant || "(sans nom)"}</p>
                <p className="text-xs text-ink/50">
                  {r.email} · plan {r.plan || "aucun"} · {r.statut_abonnement || "statut inconnu"}
                </p>
              </div>
              <button
                onClick={() => accederAuCompte(r)}
                disabled={entreeEnCours === r.id}
                className="flex items-center gap-1.5 text-sm bg-wine hover:bg-wine-dark text-gold-light font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {entreeEnCours === r.id ? "Connexion..." : "Accéder"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
