"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/inscription")
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-blue-600 text-lg">FidèleResto</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.user_metadata?.nom_restaurant}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/inscription")
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bonjour, {user?.user_metadata?.nom_restaurant} 👋
        </h1>
        <p className="text-gray-500 mb-8">Voici un aperçu de votre activité</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Scans QR", value: "0" },
            { label: "Clients collectés", value: "0" },
            { label: "Récompenses distribuées", value: "0" },
            { label: "Avis Google", value: "0" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-2">Votre QR code</h2>
          <p className="text-sm text-gray-500 mb-4">Votre QR code personnalisé sera généré ici. Imprimez le et posez le sur vos tables.</p>
          <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-xs text-gray-400 text-center">QR code bientôt disponible</p>
          </div>
        </div>
      </main>
    </div>
  )
}