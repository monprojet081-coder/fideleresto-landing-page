"use client"

// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { UtensilsCrossed } from "lucide-react"

type Step = "checking" | "not_found" | "inactive" | "form" | "wheel" | "win" | "lose" | "already_played"

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
  // Alerte insatisfaction (Premium) : on capte une note avant d'envoyer vers Google
  const [noteAvis, setNoteAvis] = useState(0)
  const [commentaireAvis, setCommentaireAvis] = useState("")
  const [avisEtape, setAvisEtape] = useState<"note" | "negatif" | "positif" | "envoye">("note")
  const [nomRestaurant, setNomRestaurant] = useState("")

  // Vérifie que le restaurant existe vraiment avant d'afficher quoi que ce soit.
  // Empêche de contourner l'anti-fraude en modifiant le slug dans l'URL.
  React.useEffect(() => {
    supabase
      .from("restaurants")
      .select("id, plan, statut_abonnement, nom_restaurant")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setStep("not_found")
          return
        }
        // Si l'abonnement n'est plus actif (essai jamais converti, résilié, impayé...),
        // la roue s'arrête : sinon un restaurant qui ne paie plus continuerait à distribuer
        // des récompenses gratuitement via ses flyers/QR codes déjà imprimés
        if (!data.plan || !["actif", "essai"].includes(data.statut_abonnement)) {
          setStep("inactive")
          return
        }
        setStep("form")
        setEstPremium(data.plan === "premium")
        setNomRestaurant(data.nom_restaurant || "")
        // Le scan ne compte que si le restaurant existe réellement
        fetch("/api/send-reward-email/track-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        })
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

    // Reinitialisation au jour calendaire (minuit), pas une fenetre glissante de 24h :
    // sinon quelqu'un venu lundi 13h ne pourrait pas retenter sa chance mardi a 12h
    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)
    const since = debutJour.toISOString()
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
        body: JSON.stringify({ prenom, email, recompense: reward.label, restaurantNom: nomRestaurant, slug }),
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
      }, 5500)
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

  if (step === "inactive") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">⏸️</div>
          <h1 className="text-2xl font-display font-semibold text-ink mb-2">Roue temporairement indisponible</h1>
          <p className="text-ink/55 text-sm">Ce restaurant n&apos;a pas (ou plus) d&apos;abonnement actif.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8">

        {step === "form" && (
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎡</span>
            </div>
            <h1 className="text-2xl font-display font-semibold text-ink">Tentez votre chance !</h1>
            <p className="text-ink/55 text-sm mt-2">Remplissez vos infos et tournez la roue pour gagner une récompense</p>
          </div>
        )}

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
            <div className="relative mx-auto mb-6" style={{ width: 320, height: 320 }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
                <div className="w-0 h-0" style={{
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderTop: "18px solid #c9962c",
                  filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))"
                }} />
              </div>
              <canvas
                id="wheel-canvas"
                width={320}
                height={320}
                ref={(canvas) => {
                  if (!canvas || rewards.length === 0) return
                  const ctx = canvas.getContext("2d")
                  if (!ctx) return
                  const numSegments = rewards.length
                  const arc = (2 * Math.PI) / numSegments
                  const centerX = 160
                  const centerY = 160
                  const radius = 138

                  ctx.clearRect(0, 0, 320, 320)

                  // Anneau exterieur dore
                  ctx.beginPath()
                  ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI)
                  ctx.fillStyle = "#c9962c"
                  ctx.fill()

                  // Pastilles reparties sur l'anneau, comme la roue physique de la marque
                  const dotCount = 28
                  for (let d = 0; d < dotCount; d++) {
                    const dotAngle = (2 * Math.PI * d) / dotCount
                    const dx = centerX + (radius + 8) * Math.cos(dotAngle)
                    const dy = centerY + (radius + 8) * Math.sin(dotAngle)
                    ctx.beginPath()
                    ctx.arc(dx, dy, 2, 0, 2 * Math.PI)
                    ctx.fillStyle = "rgba(107,30,46,0.45)"
                    ctx.fill()
                  }

                  // Segments (couleurs personnalisables par le restaurateur, inchangees)
                  rewards.forEach((reward, i) => {
                    const startAngle = i * arc - Math.PI / 2
                    const endAngle = startAngle + arc
                    ctx.beginPath()
                    ctx.moveTo(centerX, centerY)
                    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
                    ctx.closePath()
                    ctx.fillStyle = reward.couleur
                    ctx.fill()
                    ctx.strokeStyle = "#c9962c"
                    ctx.lineWidth = 1.5
                    ctx.stroke()

                    ctx.save()
                    ctx.translate(centerX, centerY)
                    ctx.rotate(startAngle + arc / 2)
                    ctx.textAlign = "right"
                    ctx.fillStyle = "#faf3e8"
                    ctx.font = "bold 15px sans-serif"
                    ctx.fillText(reward.label, radius - 14, 5)
                    ctx.restore()
                  })

                  // Hub central : fourchette + couteau croises (logo de la marque)
                  ctx.beginPath()
                  ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
                  ctx.fillStyle = "#6b1e2e"
                  ctx.fill()
                  ctx.strokeStyle = "#c9962c"
                  ctx.lineWidth = 3
                  ctx.stroke()

                  ctx.strokeStyle = "#f4e4c1"
                  ctx.lineWidth = 2.5
                  ctx.lineCap = "round"
                  ctx.beginPath()
                  ctx.moveTo(centerX - 10, centerY - 10)
                  ctx.lineTo(centerX + 10, centerY + 10)
                  ctx.moveTo(centerX + 10, centerY - 10)
                  ctx.lineTo(centerX - 10, centerY + 10)
                  ctx.stroke()
                }}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 5500ms cubic-bezier(0.1, 0.65, 0.05, 1)" : "none",
                  borderRadius: "50%",
                  boxShadow: "0 4px 20px rgba(107,30,46,0.25)"
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

            <AvisSection
              slug={slug}
              estPremium={estPremium}
              prenom={prenom}
              email={email}
              dejaVenu={dejaVenu}
              avisClique={avisClique}
              setAvisClique={setAvisClique}
              avisExiste={avisExiste}
              setAvisExiste={setAvisExiste}
              noteAvis={noteAvis}
              setNoteAvis={setNoteAvis}
              commentaireAvis={commentaireAvis}
              setCommentaireAvis={setCommentaireAvis}
              avisEtape={avisEtape}
              setAvisEtape={setAvisEtape}
            />
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

            <AvisSection
              slug={slug}
              estPremium={estPremium}
              prenom={prenom}
              email={email}
              dejaVenu={dejaVenu}
              avisClique={avisClique}
              setAvisClique={setAvisClique}
              avisExiste={avisExiste}
              setAvisExiste={setAvisExiste}
              noteAvis={noteAvis}
              setNoteAvis={setNoteAvis}
              commentaireAvis={commentaireAvis}
              setCommentaireAvis={setCommentaireAvis}
              avisEtape={avisEtape}
              setAvisEtape={setAvisEtape}
            />
          </div>
        )}

        {step === "already_played" && (
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-display font-semibold text-ink mb-2">Déjà joué !</h2>
            <p className="text-ink/55 mb-6">Vous avez déjà participé avec cet email aujourd'hui.</p>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 mb-3">
              <p className="text-sm text-wine-dark font-medium">La roue se réinitialise chaque jour — revenez demain pour retenter votre chance ! 🍀</p>
            </div>
            <a
              href={`/carte/${slug}`}
              className="block w-full border border-wine/20 text-ink font-medium text-sm py-3 rounded-lg hover:bg-wine/5 transition-colors text-center"
            >
              🍽️ Voir le menu et ma carte de fidélité
            </a>
          </div>
        )}

      </div>

      <div className="flex items-center gap-2 mt-6 text-wine/60">
        <UtensilsCrossed className="w-4 h-4" />
        <p className="text-sm font-display font-medium tracking-wide">
          Propulsé par <span className="font-semibold text-wine">FidèleResto</span>
        </p>
      </div>
    </div>
  )
}

function AvisSection({
  slug, estPremium, prenom, email, dejaVenu,
  avisClique, setAvisClique, avisExiste, setAvisExiste,
  noteAvis, setNoteAvis, commentaireAvis, setCommentaireAvis, avisEtape, setAvisEtape,
}: {
  slug: string
  estPremium: boolean
  prenom: string
  email: string
  dejaVenu: boolean
  avisClique: boolean
  setAvisClique: (v: boolean) => void
  avisExiste: boolean
  setAvisExiste: (v: boolean) => void
  noteAvis: number
  setNoteAvis: (v: number) => void
  commentaireAvis: string
  setCommentaireAvis: (v: string) => void
  avisEtape: "note" | "negatif" | "positif" | "envoye"
  setAvisEtape: (v: "note" | "negatif" | "positif" | "envoye") => void
}) {
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  React.useEffect(() => {
    supabase
      .from("restaurants")
      .select("google_avis_url")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.google_avis_url) setGoogleUrl(data.google_avis_url)
        setAvisExiste(!!data?.google_avis_url)
      })
  }, [slug])

  const lienCarteNeutre = (
    <a
      href={`/carte/${slug}`}
      className="mt-3 block w-full border border-wine/20 text-ink font-medium text-sm py-3 rounded-lg hover:bg-wine/5 transition-colors text-center"
    >
      🍽️ Voir le menu et ma carte de fidélité
    </a>
  )

  // Tant que l'avis n'est pas laisse, on met le lien vers la carte/menu bien en evidence
  // (incitation claire), pour ne pas que cette fonctionnalite reste trop discrete
  const lienCarteIncitatif = (
    <div className="mt-4 rounded-xl border-2 border-gold/40 bg-gold/10 p-3.5 text-center">
      <p className="text-xs font-medium text-wine-dark mb-2.5">
        🔓 Une fois votre avis laissé, accédez à votre carte de fidélité et au menu du restaurant !
      </p>
      <a
        href={`/carte/${slug}`}
        className="block w-full bg-card border border-wine/20 text-ink font-medium text-sm py-2.5 rounded-lg hover:bg-wine/5 transition-colors text-center"
      >
        🍽️ Voir le menu et ma carte de fidélité
      </a>
    </div>
  )

  const lienCarte = avisClique ? lienCarteNeutre : lienCarteIncitatif

  const trackClicGoogle = () => {
    fetch("/api/track-avis-clic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
  }

  // Aucune fiche Google configurée : rien à "débloquer" via un avis, on montre direct le lien neutre
  if (!googleUrl) {
    return lienCarteNeutre
  }

  // Restaurant NON premium : comportement classique (bouton Google direct), sans gating
  if (!estPremium) {
    return (
      <>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setAvisClique(true); trackClicGoogle() }}
          className="flex items-center justify-center gap-2 w-full bg-wine text-gold-light text-base font-semibold px-4 py-3.5 rounded-lg shadow-md shadow-wine/20 hover:bg-wine-dark transition-colors"
        >
          ⭐ Laisser un avis Google
        </a>
        {avisClique && lienCarte}
      </>
    )
  }

  // Restaurant PREMIUM : on demande d'abord une note (alerte insatisfaction / redirection intelligente)

  // Étape 1 : on demande la note
  if (avisEtape === "note") {
    return (
      <div className="text-left">
        <p className="text-center text-sm font-medium text-ink/80 mb-3">Comment s&apos;est passée votre visite ?</p>
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => {
                setNoteAvis(n)
                setAvisEtape(n >= 4 ? "positif" : "negatif")
              }}
              className="text-3xl transition-transform hover:scale-110"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            >
              {n <= noteAvis ? "⭐" : "☆"}
            </button>
          ))}
        </div>
        {lienCarte}
      </div>
    )
  }

  // Étape 2a : bonne note → on invite à publier sur Google
  if (avisEtape === "positif") {
    return (
      <div className="text-center">
        <p className="text-sm text-ink/70 mb-3">Super, merci ! Partagez votre avis sur Google, ça nous aide énormément 🙏</p>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setAvisClique(true); trackClicGoogle() }}
          className="flex items-center justify-center gap-2 w-full bg-wine text-gold-light text-base font-semibold px-4 py-3.5 rounded-lg shadow-md shadow-wine/20 hover:bg-wine-dark transition-colors"
        >
          ⭐ Laisser un avis Google
        </a>
        {lienCarte}
      </div>
    )
  }

  // Étape 2b : note mitigée/mauvaise → retour privé, pas de redirection Google
  if (avisEtape === "negatif") {
    return (
      <div className="text-left">
        <p className="text-center text-sm text-ink/70 mb-3">Merci pour votre honnêteté. Qu&apos;est-ce qui n&apos;a pas été ? Votre retour va directement au restaurant.</p>
        <textarea
          value={commentaireAvis}
          onChange={(e) => setCommentaireAvis(e.target.value)}
          rows={3}
          placeholder="Votre commentaire (facultatif)"
          className="w-full border border-wine/15 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold mb-3"
        />
        <button
          onClick={async () => {
            setEnvoiEnCours(true)
            await fetch("/api/feedback-insatisfaction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, note: noteAvis, commentaire: commentaireAvis, prenom, email }),
            }).catch(() => {})
            setEnvoiEnCours(false)
            setAvisEtape("envoye")
          }}
          disabled={envoiEnCours}
          className="w-full bg-wine text-gold-light text-base font-semibold px-4 py-3 rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50"
        >
          {envoiEnCours ? "Envoi..." : "Envoyer mon retour"}
        </button>
        {lienCarte}
      </div>
    )
  }

  // Étape 3 : retour envoyé (avis laissé en privé, considéré comme complété)
  return (
    <div className="text-center">
      <p className="text-sm text-ink/70 mb-1">Merci beaucoup 🙏</p>
      <p className="text-xs text-ink/50 mb-2">Votre retour a bien été transmis au restaurant.</p>
      {lienCarteNeutre}
    </div>
  )
}
