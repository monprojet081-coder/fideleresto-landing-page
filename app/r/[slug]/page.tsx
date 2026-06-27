"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Step = "form" | "wheel" | "win" | "lose"

const REWARDS = [
  { label: "Boisson offerte 🥤", probability: 0.2 },
  { label: "Dessert offert 🍰", probability: 0.2 },
  { label: "10% de réduction 🏷️", probability: 0.3 },
  { label: "Perdu 😢", probability: 0.3 },
]

function getResult() {
  const rand = Math.random()
  let cumulative = 0
  for (const reward of REWARDS) {
    cumulative += reward.probability
    if (rand < cumulative) return reward
  }
  return REWARDS[REWARDS.length - 1]
}

export default function WheelPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState<Step>("form")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; probability: number } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase
      .from("clients")
      .insert([{ prenom, email, restaurant_slug: params.slug }])

    if (error && !error.message.includes("duplicate")) {
      setError("Une erreur est survenue, réessayez.")
      setLoading(false)
      return
    }

    setLoading(false)
    setStep("wheel")
  }

  const handleSpin = () => {
    if (spinning) return
    setSpinning(true)

    const reward = getResult()
    const extraSpins = 5 * 360
    const targetAngle = extraSpins + Math.random() * 360
    setRotation(prev => prev + targetAngle)

    setTimeout(() => {
      setResult(reward)
      setSpinning(false)
      if (reward.label === "Perdu 😢") {
        setStep("lose")
      } else {
        setStep("win")
      }
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tentez votre chance !</h1>
          <p className="text-gray-500 text-sm mt-2">Remplissez vos infos et tournez la roue pour gagner une récompense</p>
        </div>

        {/* Étape 1 — Formulaire */}
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
              {loading ? "Chargement..." : "Tourner la roue 🎡"}
            </button>
          </form>
        )}

        {/* Étape 2 — La roue */}
        {step === "wheel" && (
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div
                className="w-full h-full rounded-full border-8 border-blue-600 flex items-center justify-center text-4xl transition-transform"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: spinning ? "4000ms" : "0ms",
                  transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
                  background: "conic-gradient(#3b82f6 0deg 90deg, #10b981 90deg 180deg, #f59e0b 180deg 270deg, #ef4444 270deg 360deg)"
                }}
              >
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center">GO</span>
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              {spinning ? "La roue tourne... 🎡" : "Tourner ! 🎯"}
            </button>
          </div>
        )}

        {/* Étape 3 — Gagné */}
        {step === "win" && result && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Félicitations !</h2>
            <p className="text-gray-500 mb-6">Vous avez gagné :</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-xl font-bold text-blue-600">{result.label}</p>
            </div>
            <p className="text-sm text-gray-500">
              Un email avec votre récompense vous a été envoyé. Montrez le au comptoir pour en profiter !
            </p>
          </div>
        )}

        {/* Étape 4 — Perdu */}
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

      </div>
    </div>
  )
}