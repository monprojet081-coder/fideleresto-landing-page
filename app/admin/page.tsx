"use client"

// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ArrowRight, ShieldCheck, Users, Contact, Trash2 } from "lucide-react"

type RestaurantAdmin = {
  id: string
  user_id: string
  slug: string
  nom_restaurant: string
  plan: string | null
  statut_abonnement: string | null
  option_site: boolean | null
  option_reseaux: boolean | null
  telephone: string | null
  ville: string | null
  email: string | null
  created_at: string
}

type Prospect = {
  id: string
  nom: string
  email: string
  telephone: string | null
  ville: string | null
  statut: string
  notes: string | null
  sujet_email: string | null
  corps_email: string | null
  created_at: string
  updated_at: string
}

const STATUTS_PROSPECT = [
  { value: "a_contacter", label: "Pas encore envoyé", couleur: "bg-secondary text-ink/60" },
  { value: "envoye", label: "Envoyé", couleur: "bg-gold/15 text-wine-dark" },
  { value: "en_attente", label: "En attente de réponse", couleur: "bg-gold/25 text-wine-dark" },
  { value: "repondu", label: "A répondu", couleur: "bg-sage/15 text-sage" },
  { value: "pas_interesse", label: "Pas intéressé", couleur: "bg-wine/10 text-wine" },
  { value: "client", label: "Devenu client 🎉", couleur: "bg-sage text-white" },
  { value: "desabonne", label: "Désabonné", couleur: "bg-wine/5 text-ink/40" },
]

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accesRefuse, setAccesRefuse] = useState(false)
  const [onglet, setOnglet] = useState<"restaurants" | "prospection">("restaurants")
  const [restaurants, setRestaurants] = useState<RestaurantAdmin[]>([])
  const [entreeEnCours, setEntreeEnCours] = useState<string | null>(null)
  const [erreur, setErreur] = useState("")

  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loadingProspects, setLoadingProspects] = useState(false)
  const [filtreStatut, setFiltreStatut] = useState<string>("tous")
  const [filtreVille, setFiltreVille] = useState<string>("toutes")

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

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

  const chargerProspects = async () => {
    setLoadingProspects(true)
    const token = await getToken()
    const res = await fetch("/api/admin/prospects", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await res.json()
    setProspects(result.prospects || [])
    setLoadingProspects(false)
  }

  useEffect(() => {
    if (onglet === "prospection" && !accesRefuse) {
      chargerProspects()
    }
  }, [onglet, accesRefuse])

  const changerStatut = async (id: string, statut: string) => {
    setProspects(prospects.map(p => p.id === id ? { ...p, statut } : p))
    const token = await getToken()
    await fetch("/api/admin/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, statut }),
    })
  }

  const supprimerProspect = async (id: string) => {
    if (!confirm("Supprimer ce contact ?")) return
    const token = await getToken()
    const res = await fetch(`/api/admin/prospects?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await res.json()
    if (result.success) {
      setProspects(prospects.filter(p => p.id !== id))
    }
  }

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

  const villesDisponibles = Array.from(new Set(prospects.map(p => p.ville).filter(Boolean))).sort() as string[]

  const prospectsAffiches = prospects
    .filter(p => filtreStatut === "tous" || p.statut === filtreStatut)
    .filter(p => filtreVille === "toutes" || p.ville === filtreVille)
    .sort((a, b) => {
      const villeA = a.ville || "zzz"
      const villeB = b.ville || "zzz"
      if (villeA !== villeB) return villeA.localeCompare(villeB)
      return a.nom.localeCompare(b.nom)
    })

  return (
    <div className="min-h-screen bg-ivory px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-6 h-6 text-wine" />
          <h1 className="text-2xl font-display font-semibold text-ink">Espace admin</h1>
        </div>

        <div className="inline-flex items-center rounded-full border border-wine/15 bg-card p-1 mb-8">
          <button
            onClick={() => setOnglet("restaurants")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              onglet === "restaurants" ? "bg-wine text-gold-light" : "text-ink/60"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Restaurants
          </button>
          <button
            onClick={() => setOnglet("prospection")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              onglet === "prospection" ? "bg-wine text-gold-light" : "text-ink/60"
            }`}
          >
            <Contact className="w-3.5 h-3.5" /> Prospection
          </button>
        </div>

        {erreur && <p className="text-wine text-sm mb-4">{erreur}</p>}

        {onglet === "restaurants" && (
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
                  {(r.telephone || r.ville) && (
                    <p className="text-xs text-ink/40 mt-0.5">
                      {[r.telephone, r.ville].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {(r.option_site || r.option_reseaux) && (
                    <div className="flex gap-1.5 mt-1.5">
                      {r.option_site && (
                        <span className="text-[11px] font-medium bg-gold/15 text-wine-dark px-2 py-0.5 rounded-full">
                          🔔 Création de site
                        </span>
                      )}
                      {r.option_reseaux && (
                        <span className="text-[11px] font-medium bg-gold/15 text-wine-dark px-2 py-0.5 rounded-full">
                          🔔 Réseaux sociaux
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => accederAuCompte(r)}
                  disabled={entreeEnCours === r.id}
                  className="flex items-center gap-1.5 text-sm bg-wine hover:bg-wine-dark text-gold-light font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60 flex-shrink-0"
                >
                  {entreeEnCours === r.id ? "Connexion..." : "Accéder"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {onglet === "prospection" && (
          <div>

            {/* Progression de la campagne d'envoi */}
            {(() => {
              const debutAujourdhui = new Date()
              debutAujourdhui.setHours(0, 0, 0, 0)
              const envoyesAujourdhui = prospects.filter(p => p.statut === "envoye" && new Date(p.updated_at || p.created_at) >= debutAujourdhui).length
              const totalEnvoyes = prospects.filter(p => ["envoye", "en_attente", "repondu", "client"].includes(p.statut)).length
              const avecMessage = prospects.filter(p => p.sujet_email && p.corps_email).length
              const restants = prospects.filter(p => p.statut === "a_contacter").length
              return (
                <div className="bg-card rounded-xl border border-wine/10 shadow-sm p-5 mb-6">
                  <p className="text-sm font-medium text-ink mb-3">📤 Campagne d'envoi automatique</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-display font-semibold text-wine">{envoyesAujourdhui}</p>
                      <p className="text-xs text-ink/50 mt-0.5">Envoyés aujourd'hui</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-semibold text-ink">{totalEnvoyes}</p>
                      <p className="text-xs text-ink/50 mt-0.5">Envoyés au total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-semibold text-ink">{restants}</p>
                      <p className="text-xs text-ink/50 mt-0.5">Restants à contacter</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wine transition-all"
                      style={{ width: `${prospects.length > 0 ? (totalEnvoyes / prospects.length) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink/40 mt-2">
                    ~6 envois/heure entre 8h et 20h (max 70/jour, marge gardée pour vos autres emails) · {avecMessage} contact{avecMessage > 1 ? "s" : ""} sur {prospects.length} ont un message prêt à envoyer
                  </p>
                </div>
              )
            })()}

            {/* Filtre par statut */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFiltreStatut("tous")}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  filtreStatut === "tous" ? "bg-wine text-gold-light" : "bg-card border border-wine/10 text-ink/60"
                }`}
              >
                Tous ({prospects.length})
              </button>
              {STATUTS_PROSPECT.map(s => (
                <button
                  key={s.value}
                  onClick={() => setFiltreStatut(s.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    filtreStatut === s.value ? "bg-wine text-gold-light" : "bg-card border border-wine/10 text-ink/60"
                  }`}
                >
                  {s.label} ({prospects.filter(p => p.statut === s.value).length})
                </button>
              ))}
            </div>

            {/* Filtre par ville */}
            {villesDisponibles.length > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setFiltreVille("toutes")}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    filtreVille === "toutes" ? "bg-wine-dark text-gold-light border-wine-dark" : "bg-card border-wine/10 text-ink/60"
                  }`}
                >
                  🗺️ Toutes les villes ({prospects.length})
                </button>
                {villesDisponibles.map(ville => (
                  <button
                    key={ville}
                    onClick={() => setFiltreVille(ville)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      filtreVille === ville ? "bg-wine-dark text-gold-light border-wine-dark" : "bg-card border-wine/10 text-ink/60"
                    }`}
                  >
                    {ville} ({prospects.filter(p => p.ville === ville).length})
                  </button>
                ))}
              </div>
            )}

            {/* Liste des prospects, groupée par ville */}
            <div className="bg-card rounded-xl border border-wine/10 shadow-sm divide-y divide-wine/10">
              {loadingProspects ? (
                <p className="p-6 text-sm text-ink/50">Chargement...</p>
              ) : prospectsAffiches.length === 0 ? (
                <p className="p-6 text-sm text-ink/50">Aucun contact pour ce filtre.</p>
              ) : (
                prospectsAffiches.map((p, index) => {
                  const statutInfo = STATUTS_PROSPECT.find(s => s.value === p.statut) || STATUTS_PROSPECT[0]
                  const villePrecedente = index > 0 ? prospectsAffiches[index - 1].ville : null
                  const nouvelleVille = filtreVille === "toutes" && p.ville !== villePrecedente
                  return (
                    <div key={p.id}>
                      {nouvelleVille && (
                        <div className="px-5 py-2 bg-secondary/50 text-xs font-semibold text-wine-dark uppercase tracking-wide">
                          {p.ville || "Ville non renseignée"}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">{p.nom}</p>
                          <p className="text-xs text-ink/50 truncate">
                            {p.email}{p.telephone ? ` · ${p.telephone}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select
                            value={p.statut}
                            onChange={e => changerStatut(p.id, e.target.value)}
                            className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 cursor-pointer ${statutInfo.couleur}`}
                          >
                            {STATUTS_PROSPECT.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => supprimerProspect(p.id)}
                            className="text-ink/30 hover:text-wine p-1"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
