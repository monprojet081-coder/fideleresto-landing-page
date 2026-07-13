"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { UtensilsCrossed } from "lucide-react"

type Step = "checking" | "not_found" | "form" | "wheel" | "win" | "lose" | "already_played"

export default function WheelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [step, setStep] = useState<Step>("checking")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [consentementMarketing, setConsentementMarketing] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; probabilite: number; couleur: string } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rewards, setRewards] = useState<{ label: string; probabilite: number; couleur: string }[]>([])
  const [estPremium, setEstPremium] = useState(false)
  const [avisClique, setAvisClique] = useState(false)
  const [avisExiste, setAvisExiste] = useState(true)
  const [dejaVenu, setDejaVenu] = useState(false)

  // Vérifie que le restaurant existe vraiment avant d'afficher quoi que ce soit.
  // Empêche de contourner l'anti-fraude en modifiant le slug dans l'URL.
  React.useEffect(() => {
    supabase
      .from("restaurants")
      .select("id, plan")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStep("form")
          setEstPremium(data.plan === "premium")
          // Le scan ne compte que si le restaurant existe réellement
          fetch("/api/send-reward-email/track-scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          })
        } else {
          setStep("not_found")
        }
      })
  }, [slug])

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

    // Détecte si ce client est déjà venu au moins une fois avant aujourd'hui
    // (utile pour ne proposer "j'ai déjà laissé un avis" qu'aux habitués, pas aux nouveaux clients)
    const { count: visitesPrecedentes } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .eq("restaurant_slug", slug)
    setDejaVenu((visitesPrecedentes || 0) > 0)

    const { data: roueData } = await supabase
      .from("roue_config")
      .select("label, probabilite, couleur")
      .filter("restaurant_id", "like", `${slug}%`)

    const rewardsList = roueData && roueData.length > 0 ? roueData : [
      { label: "Boisson offerte 🥤", probabilite: 25, couleur: "#6b1e2e" },
      { label: "Dessert offert 🍰", probabilite: 25, couleur: "#c9962c" },
      { label: "10% de réduction 🏷️", probabilite: 25, couleur: "#3f6b4f" },
      { label: "Perdu 😢", probabilite: 25, couleur: "#a8536a" },
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
        recompense: reward.label,
        consentement_marketing: consentementMarketing
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
          <h1 className="text-2xl font-display font-semibold text-ink mb-2">Roue introuvable</h1>
          <p className="text-ink/55 text-sm">Ce lien ne correspond à aucun restaurant. Vérifiez le QR code ou le lien utilisé.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎡</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-ink">Tentez votre chance !</h1>
          <p className="text-ink/55 text-sm mt-2">Remplissez vos infos et tournez la roue pour gagner une récompense</p>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Prénom</label>
              <input
                type="text"
                required
                placeholder="Jean"
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="jean@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-wine/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                id="rgpd"
                checked={consentementMarketing}
                onChange={e => setConsentementMarketing(e.target.checked)}
                className="mt-1 accent-wine"
              />
              <label htmlFor="rgpd" className="text-xs text-ink/50">
                J'accepte que mes données soient utilisées pour recevoir des offres de ce restaurant.{" "}
                <a href="/confidentialite" target="_blank" className="underline hover:text-wine">
                  En savoir plus
                </a>
              </label>
            </div>
            {error && <p className="text-wine text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-wine hover:bg-wine-dark disabled:opacity-60 text-gold-light font-medium py-3 rounded-lg transition-colors"
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
                  borderTop: "20px solid #6b1e2e"
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
                    ctx.strokeStyle = "#faf3e8"
                    ctx.lineWidth = 2
                    ctx.stroke()

                    ctx.save()
                    ctx.translate(centerX, centerY)
                    ctx.rotate(startAngle + arc / 2)
                    ctx.textAlign = "right"
                    ctx.fillStyle = "#faf3e8"
                    ctx.font = "bold 12px sans-serif"
                    ctx.fillText(reward.label, radius - 10, 5)
                    ctx.restore()
                  })

                  ctx.beginPath()
                  ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI)
                  ctx.fillStyle = "#6b1e2e"
                  ctx.fill()
                  ctx.strokeStyle = "#c9962c"
                  ctx.lineWidth = 3
                  ctx.stroke()
                }}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 4000ms cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                  borderRadius: "50%",
                  boxShadow: "0 4px 20px rgba(107,30,46,0.2)"
                }}
              />
            </div>
            <p className="text-ink/55 text-sm">{spinning ? "La roue tourne... 🎡" : "Regardez le résultat !"}</p>
          </div>
        )}

        {step === "win" && result && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-display font-semibold text-ink mb-2">Félicitations !</h2>
            <p className="text-ink/55 mb-6">Vous avez gagné :</p>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 mb-6">
              <p className="text-xl font-display font-semibold text-wine-dark">{result.label}</p>
            </div>
            <p className="text-sm text-ink/55 mb-5">Un email avec votre récompense vient de vous être envoyé. Montrez-le au comptoir pour en profiter !</p>

            <GoogleReviewButton slug={slug} onClick={() => setAvisClique(true)} onUrlChecked={setAvisExiste} />
            {dejaVenu && avisExiste && !avisClique && (
              <button
                onClick={() => setAvisClique(true)}
                className="mt-2 text-xs text-ink/45 hover:text-wine underline"
              >
                J'ai déjà laissé un avis
              </button>
            )}

            {estPremium && (avisClique || !avisExiste) && (
              <a
                href={`/carte/${slug}`}
                className="mt-3 block w-full border border-wine/20 text-ink font-medium text-sm py-3 rounded-lg hover:bg-wine/5 transition-colors"
              >
                🍽️ Voir le menu et ma carte de fidélité
              </a>
            )}
          </div>
        )}

        {step === "lose" && (
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-display font-semibold text-ink mb-2">Pas de chance !</h2>
            <p className="text-ink/55 mb-6">Vous n'avez rien gagné cette fois...</p>
            <div className="bg-secondary/50 border border-wine/10 rounded-xl p-6 mb-5">
              <p className="text-sm text-ink/65">Revenez nous voir bientôt pour retenter votre chance ! 🍀</p>
            </div>

            <GoogleReviewButton slug={slug} onClick={() => setAvisClique(true)} onUrlChecked={setAvisExiste} />
            {dejaVenu && avisExiste && !avisClique && (
              <button
                onClick={() => setAvisClique(true)}
                className="mt-2 text-xs text-ink/45 hover:text-wine underline"
              >
                J'ai déjà laissé un avis
              </button>
            )}

            {estPremium && (avisClique || !avisExiste) && (
              <a
                href={`/carte/${slug}`}
                className="mt-3 block w-full border border-wine/20 text-ink font-medium text-sm py-3 rounded-lg hover:bg-wine/5 transition-colors"
              >
                🍽️ Voir le menu et ma carte de fidélité
              </a>
            )}
          </div>
        )}

        {step === "already_played" && (
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-display font-semibold text-ink mb-2">Déjà joué !</h2>
            <p className="text-ink/55 mb-6">Vous avez déjà participé avec cet email aujourd'hui.</p>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
              <p className="text-sm text-wine-dark font-medium">Revenez dans 24h pour retenter votre chance ! 🍀</p>
            </div>
          </div>
        )}

      </div>

      <div className="flex items-center gap-1.5 mt-6 text-ink/35">
        <UtensilsCrossed className="w-3 h-3" />
        <p className="text-xs font-display tracking-wide">
          Propulsé par <span className="font-semibold text-wine/50">FidèleResto</span>
        </p>
      </div>
    </div>
  )
}

function GoogleReviewButton({ slug, onClick, onUrlChecked }: { slug: string; onClick?: () => void; onUrlChecked?: (hasUrl: boolean) => void }) {
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)

  React.useEffect(() => {
    supabase
      .from("restaurants")
      .select("google_avis_url")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.google_avis_url) {
          setGoogleUrl(data.google_avis_url)
        }
        onUrlChecked?.(!!data?.google_avis_url)
      })
  }, [slug])

  if (!googleUrl) return null

  return (
    <a
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full bg-wine text-gold-light text-base font-semibold px-4 py-3.5 rounded-lg shadow-md shadow-wine/20 hover:bg-wine-dark transition-colors"
    >
      ⭐ Laisser un avis Google
    </a>
  )
}
