"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { QrCode, Users, Star, Gift, LogOut, LayoutDashboard, Settings, Sliders, UtensilsCrossed, Download, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("accueil")
  const qrGenerated = useRef(false)
  const [rewards, setRewards] = useState([
    { label: "Boisson offerte 🥤", probabilite: 25, couleur: "#6b1e2e" },
    { label: "Dessert offert 🍰", probabilite: 25, couleur: "#c9962c" },
    { label: "10% de réduction 🏷️", probabilite: 25, couleur: "#3f6b4f" },
    { label: "Perdu 😢", probabilite: 25, couleur: "#a8536a" },
  ])
  const [newLabel, setNewLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [googleAvisUrl, setGoogleAvisUrl] = useState("")
  const [savingParams, setSavingParams] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/inscription")
      } else {
        setUser(user)
        const slug = user.id.slice(0, 8)

        const { data } = await supabase
          .from("roue_config")
          .select("*")
          .eq("restaurant_id", slug)
        if (data && data.length > 0) {
          setRewards(data.map((r: any) => ({
            label: r.label,
            probabilite: r.probabilite,
            couleur: r.couleur,
          })))
        }

        const { data: clientsData } = await supabase
          .from("clients")
          .select("*")
          .eq("restaurant_slug", slug)
          .order("created_at", { ascending: false })
        if (clientsData) {
          setClients(clientsData)
        }
        setClientsLoading(false)

        const { data: restoData } = await supabase
          .from("restaurants")
          .select("*")
          .eq("slug", slug)
          .maybeSingle()

        if (restoData) {
          setRestaurant(restoData)
          setGoogleAvisUrl(restoData.google_avis_url || "")
        } else {
          const { data: newResto } = await supabase
            .from("restaurants")
            .insert([{
              user_id: user.id,
              slug,
              nom_restaurant: user.user_metadata?.nom_restaurant || "Mon Restaurant",
              google_avis_url: user.user_metadata?.google_avis_url || null,
              scan_qr: 0,
            }])
            .select()
            .single()
          if (newResto) {
            setRestaurant(newResto)
            setGoogleAvisUrl(newResto.google_avis_url || "")
          }
        }
      }
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (activeSection === "qrcode" && user && !qrGenerated.current) {
      qrGenerated.current = true
      import('qrcode').then(QRCode => {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
        if (canvas) {
          QRCode.toCanvas(
            canvas,
            `https://fideleresto-landing-page-9dhz.vercel.app/r/${user.id.slice(0, 8)}`,
            { width: 200, margin: 2, color: { dark: "#241914", light: "#faf3e8" } },
            () => {}
          )
        }
      })
    }
  }, [activeSection, user])

  const saveRewards = async () => {
    setSaving(true)
    const slug = user.id.slice(0, 8)
    const { error: deleteError } = await supabase
      .from("roue_config")
      .delete()
      .eq("restaurant_id", slug)
    if (deleteError) {
      console.error("Erreur delete:", deleteError)
      alert("Erreur lors de la sauvegarde : " + deleteError.message)
      setSaving(false)
      return
    }
    const { error: insertError } = await supabase
      .from("roue_config")
      .insert(rewards.map(r => ({ ...r, restaurant_id: slug })))
    if (insertError) {
      console.error("Erreur insert:", insertError)
      alert("Erreur lors de la sauvegarde : " + insertError.message)
      setSaving(false)
      return
    }
    setSaving(false)
    alert("Roue sauvegardée !")
  }

  const saveParametres = async () => {
    setSavingParams(true)
    const slug = user.id.slice(0, 8)
    const { error } = await supabase
      .from("restaurants")
      .update({ google_avis_url: googleAvisUrl })
      .eq("slug", slug)
    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message)
    } else {
      alert("Paramètres sauvegardés !")
    }
    setSavingParams(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-wine border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-ink/50 text-sm">Chargement...</p>
      </div>
    </div>
  )

  const nomResto = user?.user_metadata?.nom_restaurant || "Mon Restaurant"
  const totalProba = rewards.reduce((a, r) => a + r.probabilite, 0)

  const kpis = [
    { label: "Scans QR", value: restaurant?.scan_qr?.toString() || "0", icon: QrCode, color: "bg-wine/8 text-wine" },
    { label: "Clients collectés", value: clients.length.toString(), icon: Users, color: "bg-sage/10 text-sage" },
    { label: "Récompenses distribuées", value: clients.filter((c) => c.a_gagne).length.toString(), icon: Gift, color: "bg-gold/12 text-wine-dark" },
    { label: "Avis Google", value: "0", icon: Star, color: "bg-wine/8 text-wine" },
  ]

  const navItems = [
    { id: "accueil", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "qrcode", label: "Mon QR code", icon: QrCode },
    { id: "clients", label: "Mes clients", icon: Users },
    { id: "roue", label: "Ma roue", icon: Sliders },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-secondary/40 flex">

      <aside className="w-64 bg-wine flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gold-light/15 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-gold-light/15 text-gold-light">
            <UtensilsCrossed className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <span className="text-base font-display font-semibold text-gold-light block leading-tight">FidèleResto</span>
            <p className="text-xs text-ivory/50 truncate leading-tight">{nomResto}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-gold text-wine-dark"
                    : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gold-light/15">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/inscription")
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ivory/60 hover:bg-white/5 hover:text-ivory transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">

        {activeSection === "accueil" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Bonjour, {nomResto} 👋</h1>
              <p className="text-ink/55 mt-1">Voici un aperçu de votre activité</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div key={kpi.label} className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-display font-semibold text-ink">{kpi.value}</p>
                    <p className="text-sm text-ink/55 mt-1">{kpi.label}</p>
                  </div>
                )
              })}
            </div>
            <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm">
              <h2 className="font-display font-semibold text-ink mb-4">Démarrer rapidement</h2>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Configurez votre roue", action: () => setActiveSection("roue"), cta: "Configurer" },
                  { step: "2", text: "Téléchargez votre QR code", action: () => setActiveSection("qrcode"), cta: "Voir mon QR code" },
                  { step: "3", text: "Vos clients scannent et jouent à la roue", action: null, cta: null },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-7 h-7 rounded-full bg-wine text-gold-light text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-sm text-ink/75 flex-1">{item.text}</p>
                    {item.action && (
                      <button onClick={item.action} className="text-xs text-wine font-semibold hover:underline flex items-center gap-1">
                        {item.cta}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "qrcode" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Mon QR code</h1>
              <p className="text-ink/55 mt-1">Imprimez le et posez le sur vos tables, additions ou vitrines</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-wine/10 shadow-sm max-w-md">
              <div className="flex justify-center mb-6 p-4 rounded-xl border border-dashed border-wine/20 bg-ivory">
                <canvas id="qr-canvas" className="rounded-lg" />
              </div>
              <p className="text-center text-sm text-ink/55 mb-6">
                URL : <span className="text-wine font-medium">fideleresto-landing-page-9dhz.vercel.app/r/{user?.id?.slice(0, 8)}</span>
              </p>
              <button
                onClick={() => {
                  const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement
                  if (canvas) {
                    const link = document.createElement("a")
                    link.download = "qrcode-fideleresto.png"
                    link.href = canvas.toDataURL()
                    link.click()
                  }
                }}
                className="w-full bg-wine hover:bg-wine-dark text-gold-light font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger en PNG
              </button>
            </div>
          </div>
        )}

        {activeSection === "clients" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Mes clients</h1>
              <p className="text-ink/55 mt-1">Liste des clients collectés via votre QR code</p>
            </div>
            <div className="bg-card rounded-xl border border-wine/10 shadow-sm">
              {clientsLoading ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-wine border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : clients.length === 0 ? (
                <div className="p-10 flex flex-col items-center text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-wine/8 text-wine mb-4">
                    <Users className="w-6 h-6" />
                  </span>
                  <p className="text-sm text-ink/60 max-w-sm">
                    Aucun client pour le moment. Partagez votre QR code pour commencer à collecter des contacts !
                  </p>
                  <button
                    onClick={() => setActiveSection("qrcode")}
                    className="mt-4 text-sm text-wine font-semibold hover:underline flex items-center gap-1"
                  >
                    Voir mon QR code
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-wine/10 text-left text-ink/50 bg-secondary/30">
                        <th className="px-6 py-3 font-medium">Prénom</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Résultat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b border-wine/5 last:border-0 hover:bg-secondary/25 transition-colors">
                          <td className="px-6 py-3 text-ink font-medium">{client.prenom}</td>
                          <td className="px-6 py-3 text-ink/70">{client.email}</td>
                          <td className="px-6 py-3 text-ink/70">
                            {new Date(client.created_at).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-3">
                            {client.a_gagne ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage/12 text-sage">
                                {client.recompense}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-ink/50">
                                Perdu
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "roue" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Ma roue</h1>
              <p className="text-ink/55 mt-1">Configurez les récompenses et leurs probabilités</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm max-w-2xl">
              <div className="space-y-4 mb-6">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-secondary/40 rounded-xl">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: reward.couleur }} />
                    <input
                      type="text"
                      value={reward.label}
                      onChange={e => {
                        const updated = [...rewards]
                        updated[index].label = e.target.value
                        setRewards(updated)
                      }}
                      className="flex-1 border border-wine/15 bg-card rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <div className="flex items-center gap-2 w-40">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={reward.probabilite}
                        onChange={e => {
                          const updated = [...rewards]
                          updated[index].probabilite = parseInt(e.target.value)
                          setRewards(updated)
                        }}
                        className="flex-1 accent-wine"
                      />
                      <span className="text-sm font-medium text-ink/70 w-10 text-right">{reward.probabilite}%</span>
                    </div>
                    <input
                      type="color"
                      value={reward.couleur}
                      onChange={e => {
                        const updated = [...rewards]
                        updated[index].couleur = e.target.value
                        setRewards(updated)
                      }}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    {rewards.length > 2 && (
                      <button
                        onClick={() => setRewards(rewards.filter((_, i) => i !== index))}
                        className="text-wine/40 hover:text-wine text-xl font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Nouvelle récompense..."
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  className="flex-1 border border-wine/15 bg-card rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  onClick={() => {
                    if (!newLabel.trim()) return
                    setRewards([...rewards, { label: newLabel, probabilite: 10, couleur: "#c9962c" }])
                    setNewLabel("")
                  }}
                  className="bg-secondary hover:bg-secondary/70 text-ink font-medium px-4 py-2 rounded-lg text-sm"
                >
                  + Ajouter
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg mb-6">
                <span className="text-sm text-ink/65">Total des probabilités :</span>
                <span className={`text-sm font-bold ${totalProba === 100 ? "text-sage" : "text-wine"}`}>
                  {totalProba}% {totalProba === 100 ? "✓" : "(doit être égal à 100%)"}
                </span>
              </div>

              <button
                onClick={saveRewards}
                disabled={saving || totalProba !== 100}
                className="w-full bg-wine hover:bg-wine-dark disabled:opacity-50 text-gold-light font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder ma roue"}
              </button>
            </div>
          </div>
        )}

        {activeSection === "parametres" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Paramètres</h1>
              <p className="text-ink/55 mt-1">Gérez les informations de votre restaurant</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm max-w-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Nom du restaurant</label>
                  <input
                    type="text"
                    defaultValue={nomResto}
                    className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full border border-wine/10 rounded-lg px-4 py-2.5 text-sm bg-secondary/40 text-ink/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Lien de votre page avis Google</label>
                  <input
                    type="text"
                    placeholder="Ex : https://g.page/r/XXXXXXXXXXXX/review"
                    value={googleAvisUrl}
                    onChange={e => setGoogleAvisUrl(e.target.value)}
                    className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <p className="mt-1 text-xs text-ink/45">Vos clients seront redirigés vers ce lien après avoir gagné à la roue.</p>
                </div>
                <button
                  onClick={saveParametres}
                  disabled={savingParams}
                  className="bg-wine hover:bg-wine-dark disabled:opacity-50 text-gold-light font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
                >
                  {savingParams ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
