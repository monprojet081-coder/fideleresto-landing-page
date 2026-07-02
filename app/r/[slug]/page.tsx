"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"

type Step = "form" | "wheel" | "win" | "lose" | "already_played"

export default function WheelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [step, setStep] = useState<Step>("form")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; probabilite: number; couleur: string } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rewards, setRewards] = useState<{ label: string; probabilite: number; couleur: string }[]>([])

  // Enregistre le scan du QR code dès l'arrivée sur la page
  React.useEffect(() => {
    fetch("/api/track-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
  }, [])

  const getResult = (rewardsList: { label: string; probabilite: number; couleur: string }[]) => {
    const rand = Math.random() * 100
    let cumulative = 0
    for (const reward of rewardsList) {
      cumulative += reward.probabilite
      if (rand < cumulative) return reward
    }
    return rewardsList[rewardsList.length - 1]
  }

  // Calcule l'angle pour que la flèche (en haut) pointe sur la bonne case
  const getTargetRotation = (
    rewardsList: { label: string; probabilite: number; couleur: string }[],
    wonReward: { label: string; probabilite: number; couleur: string }
  ) => {
    const index = rewardsList.findIndex(r => r.label === wonReward.label)
    const arcDeg = 360 / rewardsList.length
    const caseCenterDeg = index * arcDeg + arcDeg / 2
    const randomOffset = (Math.random() - 0.5) * (arcDeg * 0.6)
    const extraSpins = 5 * 360
    return extraSpins + (360 - caseCenterDeg + randomOffset)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from("clients")
      .select("id, created_at")
      .eq("email", email)
      .eq("restaurant_slug", slug)
      .gte("created_at", since)

    if (existing && existing.length > 0 && email !== "cokillage67@gmail.com" && email !== "monprojet081@gmail.com") {
      setStep("already_played")
      setLoading(false)
      return
    }

    const { data: roueData } = await supabase
      .from("roue_config")
      .select("label, probabilite, couleur")
      .filter("restaurant_id", "like", `${slug}%`)

    const rewardsList = roueData && roueData.length > 0 ? roueData : [
      { label: "Boisson offerte 🥤", probabilite: 25, couleur: "#3b82f6" },
      { label: "Dessert offert 🍰", probabilite: 25, couleur: "#10b981" },
      { label: "10% de réduction 🏷️", probabilite: 25, couleur: "#f59e0b" },
      { label: "Perdu 😢", probabilite: 25, couleur: "#ef4444" },
    ]

    setRewards(rewardsList)
    const reward = getResult(rewardsList)

    const { error: insertError } = await supabase
      .from("clients")
      .insert([{
        prenom,
        email,
        restaurant_slug: slug,
        a_gagne: reward.label !== "Perdu 😢",
        recompense: reward.label
      }])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    if (reward.label !== "Perdu 😢") {
      await fetch("/api/send-reward-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email, recompense: reward.label }),
      })
    }

    setResult(reward)
    setLoading(false)
    setStep("wheel")

    setTimeout(() => {
      setSpinning(true)
      const targetAngle = getTargetRotation(rewardsList, reward)
      setRotation(targetAngle)

      setTimeout(() => {
        setSpinning(false)
        if (reward.label === "Perdu 😢") {
          setStep("lose")
        } else {
          setStep("win")
        }
      }, 4000)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tentez votre chance !</h1>
          <p className="text-gray-500 text-sm mt-2">Remplissez vos infos et tournez la roue pour gagner une récompense</p>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                required
                placeholder="Jean"
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="jean@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" required id="rgpd" className="mt-1 accent-blue-600" />
              <label htmlFor="rgpd" className="text-xs text-gray-500">
                J'accepte que mes données soient utilisées pour recevoir des offres de ce restaurant
              </label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? "Vérification..." : "Tourner la roue 🎡"}
            </button>
          </form>
        )}

        {step === "wheel" && (
          <div className="text-center">
            <div className="relative mx-auto mb-6" style={{ width: 280, height: 280 }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0" style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "20px solid #1d4ed8"
                }} />
              </div>
              <canvas
                id="wheel-canvas"
                width={280}
                height={280}
                ref={(canvas) => {
                  if (!canvas || rewards.length === 0) return
                  const ctx = canvas.getContext("2d")
                  if (!ctx) return
                  const numSegments = rewards.length
                  const arc = (2 * Math.PI) / numSegments
                  const centerX = 140
                  const centerY = 140
                  const radius = 130

                  rewards.forEach((reward, i) => {
                    const startAngle = i * arc - Math.PI / 2
                    const endAngle = startAngle + arc
                    ctx.beginPath()
                    ctx.moveTo(centerX, centerY)
                    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
                    ctx.closePath()
                    ctx.fillStyle = reward.couleur
                    ctx.fill()
                    ctx.strokeStyle = "#ffffff"
                    ctx.lineWidth = 2
                    ctx.stroke()

                    ctx.save()
                    ctx.translate(centerX, centerY)
                    ctx.rotate(startAngle + arc / 2)
                    ctx.textAlign = "right"
                    ctx.fillStyle = "#ffffff"
                    ctx.font = "bold 12px sans-serif"
                    ctx.fillText(reward.label, radius - 10, 5)
                    ctx.restore()
                  })

                  ctx.beginPath()
                  ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
                  ctx.fillStyle = "#1d4ed8"
                  ctx.fill()
                  ctx.strokeStyle = "#ffffff"
                  ctx.lineWidth = 3
                  ctx.stroke()
                }}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 4000ms cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                  borderRadius: "50%",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                }}
              />
            </div>
            <p className="text-gray-500 text-sm">{spinning ? "La roue tourne... 🎡" : "Regardez le résultat !"}</p>
          </div>
        )}

        {step === "win" && result && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Félicitations !</h2>
            <p className="text-gray-500 mb-6">Vous avez gagné :</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-xl font-bold text-blue-600">{result.label}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">Un email avec votre récompense vient de vous être envoyé. Montrez-le au comptoir pour en profiter !</p>
            <GoogleReviewButton slug={slug} />
          </div>
        )}

        {step === "lose" && (
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pas de chance !</h2>
            <p className="text-gray-500 mb-6">Vous n'avez rien gagné cette fois...</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600">Revenez nous voir bientôt pour retenter votre chance ! 🍀</p>
            </div>
          </div>
        )}

        {step === "already_played" && (
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Déjà joué !</h2>
            <p className="text-gray-500 mb-6">Vous avez déjà participé avec cet email aujourd'hui.</p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <p className="text-sm text-orange-600 font-medium">Revenez dans 24h pour retenter votre chance ! 🍀</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function GoogleReviewButton({ slug }: { slug: string }) {
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)

  React.useEffect(() => {
    supabase
      .from("restaurants")
      .select("google_avis_url")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.google_avis_url) {
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(data.google_avis_url)}#lrd=1`
          setGoogleUrl(searchUrl)
        }
      })
  }, [slug])

  if (!googleUrl) return null

  return (
    <a
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-yellow-100 transition-colors"
    >
      ⭐ Laisser un avis Google
    </a>
  )
}