"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { QrCode, Users, Star, Gift, LogOut, LayoutDashboard, Settings, Sliders } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("accueil")
  const qrGenerated = useRef(false)
  const [rewards, setRewards] = useState([
    { label: "Boisson offerte 🥤", probabilite: 25, couleur: "#3b82f6" },
    { label: "Dessert offert 🍰", probabilite: 25, couleur: "#10b981" },
    { label: "10% de réduction 🏷️", probabilite: 25, couleur: "#f59e0b" },
    { label: "Perdu 😢", probabilite: 25, couleur: "#ef4444" },
  ])
  const [newLabel, setNewLabel] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/inscription")
      } else {
        setUser(user)
        const { data } = await supabase
          .from("roue_config")
          .select("*")
          .eq("restaurant_id", user.id)
        if (data && data.length > 0) {
          setRewards(data.map((r: any) => ({
            label: r.label,
            probabilite: r.probabilite,
            couleur: r.couleur,
          })))
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
            { width: 200, margin: 2 },
            () => {}
          )
        }
      })
    }
  }, [activeSection, user])

  const saveRewards = async () => {
    setSaving(true)
    await supabase.from("roue_config").delete().eq("restaurant_id", user.id)
    await supabase.from("roue_config").insert(
      rewards.map(r => ({ ...r, restaurant_id: user.id }))
    )
    setSaving(false)
    alert("Roue sauvegardée !")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  )

  const nomResto = user?.user_metadata?.nom_restaurant || "Mon Restaurant"
  const totalProba = rewards.reduce((a, r) => a + r.probabilite, 0)

  const kpis = [
    { label: "Scans QR", value: "0", icon: QrCode, color: "bg-blue-50 text-blue-600" },
    { label: "Clients collectés", value: "0", icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Récompenses distribuées", value: "0", icon: Gift, color: "bg-purple-50 text-purple-600" },
    { label: "Avis Google", value: "0", icon: Star, color: "bg-yellow-50 text-yellow-600" },
  ]

  const navItems = [
    { id: "accueil", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "qrcode", label: "Mon QR code", icon: QrCode },
    { id: "clients", label: "Mes clients", icon: Users },
    { id: "roue", label: "Ma roue", icon: Sliders },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-blue-600">FidèleResto</span>
          <p className="text-xs text-gray-400 mt-1 truncate">{nomResto}</p>
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
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/inscription")
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
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
              <h1 className="text-2xl font-bold text-gray-900">Bonjour, {nomResto} 👋</h1>
              <p className="text-gray-500 mt-1">Voici un aperçu de votre activité</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
                  </div>
                )
              })}
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Démarrer rapidement</h2>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Configurez votre roue", action: () => setActiveSection("roue"), cta: "Configurer" },
                  { step: "2", text: "Téléchargez votre QR code", action: () => setActiveSection("qrcode"), cta: "Voir mon QR code" },
                  { step: "3", text: "Vos clients scannent et jouent à la roue", action: null, cta: null },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{item.text}</p>
                    {item.action && (
                      <button onClick={item.action} className="text-xs text-blue-600 font-medium hover:underline">
                        {item.cta}
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
              <h1 className="text-2xl font-bold text-gray-900">Mon QR code</h1>
              <p className="text-gray-500 mt-1">Imprimez le et posez le sur vos tables, additions ou vitrines</p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm max-w-md">
              <div className="flex justify-center mb-6">
                <canvas id="qr-canvas" className="rounded-xl" />
              </div>
              <p className="text-center text-sm text-gray-500 mb-6">
                URL : <span className="text-blue-600 font-medium">fideleresto-landing-page-9dhz.vercel.app/r/{user?.id?.slice(0, 8)}</span>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Télécharger en PNG
              </button>
            </div>
          </div>
        )}

        {activeSection === "clients" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
              <p className="text-gray-500 mt-1">Liste des clients collectés via votre QR code</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6">
                <p className="text-sm text-gray-500">Aucun client pour le moment. Partagez votre QR code pour commencer à collecter des contacts !</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "roue" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Ma roue</h1>
              <p className="text-gray-500 mt-1">Configurez les récompenses et leurs probabilités</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm max-w-2xl">
              <div className="space-y-4 mb-6">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: reward.couleur }} />
                    <input
                      type="text"
                      value={reward.label}
                      onChange={e => {
                        const updated = [...rewards]
                        updated[index].label = e.target.value
                        setRewards(updated)
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="flex-1 accent-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700 w-10 text-right">{reward.probabilite}%</span>
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
                        className="text-red-400 hover:text-red-600 text-xl font-bold"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (!newLabel.trim()) return
                    setRewards([...rewards, { label: newLabel, probabilite: 10, couleur: "#8b5cf6" }])
                    setNewLabel("")
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm"
                >
                  + Ajouter
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-6">
                <span className="text-sm text-gray-600">Total des probabilités :</span>
                <span className={`text-sm font-bold ${totalProba === 100 ? "text-green-600" : "text-red-500"}`}>
                  {totalProba}% {totalProba === 100 ? "✓" : "(doit être égal à 100%)"}
                </span>
              </div>

              <button
                onClick={saveRewards}
                disabled={saving || totalProba !== 100}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder ma roue"}
              </button>
            </div>
          </div>
        )}

        {activeSection === "parametres" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-500 mt-1">Gérez les informations de votre restaurant</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm max-w-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant</label>
                  <input
                    type="text"
                    defaultValue={nomResto}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm">
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}