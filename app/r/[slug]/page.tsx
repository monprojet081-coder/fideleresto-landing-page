"use client"

// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { UtensilsCrossed } from "lucide-react"
import { quandRejouer, DUREE_VALIDITE_JOURS } from "@/lib/recompenses"
import { RoueChance, LegendeLots } from "@/components/roue-chance"
import { REWARDS_PAR_DEFAUT, LABEL_PERDU, DUREE_ROTATION_MS, PAUSE_FIN_MS, PAUSE_AVANT_ROTATION_MS, type Lot } from "@/lib/roue"

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
  const [rewards, setRewards] = useState<Lot[]>([])
  const [estPremium, setEstPremium] = useState(false)
  const [avisClique, setAvisClique] = useState(false)
  const [avisExiste, setAvisExiste] = useState(true)
  const [dejaVenu, setDejaVenu] = useState(false)
  // Ce client (meme email) a deja clique sur "Laisser un avis Google" lors d'une visite precedente
  const [dejaAvis, setDejaAvis] = useState(false)
  const [clientRowId, setClientRowId] = useState<string | null>(null)
  const [frequenceJours, setFrequenceJours] = useState(1)
  const [emailStatut, setEmailStatut] = useState<"ok" | "echec" | null>(null)
  const [recompenseRowId, setRecompenseRowId] = useState<string | null>(null)
  // Alerte insatisfaction (Premium) : on capte une note avant d'envoyer vers Google
  const [noteAvis, setNoteAvis] = useState(0)
  const [commentaireAvis, setCommentaireAvis] = useState("")
  const [avisEtape, setAvisEtape] = useState<"note" | "negatif" | "positif" | "envoye">("note")
  const [nomRestaurant, setNomRestaurant] = useState("")
  // Carte de fidélité + menu digital : réservés au plan Complet (standard)
  const [aCarte, setACarte] = useState(false)

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
        // Le filtre d'avis (anciennement reserve au Premium) est desormais inclus
        // dans les deux plans payants, essentiel comme standard
        setEstPremium(data.plan === "essentiel" || data.plan === "standard")
        setNomRestaurant(data.nom_restaurant || "")
        setACarte(data.plan === "standard")
        // Charge les lots tout de suite : le client voit la roue et ce qu'il peut gagner
        // AVANT de remplir le formulaire, au lieu de la decouvrir lancee a pleine vitesse
        supabase
          .from("roue_config")
          .select("label, probabilite, couleur")
          .filter("restaurant_id", "like", `${slug}%`)
          .then(({ data: lots }) => setRewards(lots && lots.length > 0 ? lots : REWARDS_PAR_DEFAUT))
        // Le scan ne compte que si le restaurant existe réellement
        fetch("/api/send-reward-email/track-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        })
      })
  }, [slug])

  // Si l'email n'a pas pu partir, on affiche le QR de la recompense directement a l'ecran
  // pour que le client reparte quand meme avec son gain (capture d'ecran).
  React.useEffect(() => {
    if (step === "win" && emailStatut === "echec" && recompenseRowId) {
      import("qrcode").then((QRCode) => {
        const canvas = document.getElementById("qr-recompense-canvas") as HTMLCanvasElement | null
        if (canvas) {
          QRCode.toCanvas(canvas, `fideleresto:recompense:${recompenseRowId}`, {
            width: 180, margin: 1, color: { dark: "#241914", light: "#ffffff" },
          }, () => {})
        }
      })
    }
  }, [step, emailStatut, recompenseRowId])

  // Le tirage au sort de la recompense se fait desormais cote serveur (/api/roue/jouer),
  // impossible a manipuler depuis la console du navigateur.

  // Calcule l'angle pour que la flèche (en haut) pointe sur la bonne case
  const getTargetRotation = (
    rewardsList: { label: string; probabilite: number; couleur: string }[],
    wonReward: { label: string; probabilite: number; couleur: string }
  ) => {
    const index = rewardsList.findIndex(r => r.label === wonReward.label)
    const arcDeg = 360 / rewardsList.length
    const caseCenterDeg = index * arcDeg + arcDeg / 2
    const randomOffset = (Math.random() - 0.5) * (arcDeg * 0.6)
    const extraSpins = 6 * 360
    return extraSpins + (360 - caseCenterDeg + randomOffset)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/roue/jouer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, prenom, email, consentementMarketing }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue, réessayez.")
      setLoading(false)
      return
    }

    if (data.dejaJoue) {
      setFrequenceJours(data.frequenceJours || 1)
      setStep("already_played")
      setLoading(false)
      return
    }

    setDejaVenu(data.dejaVenu)
    setDejaAvis(!!data.dejaAvis)
    setClientRowId(data.clientRowId || null)
    setFrequenceJours(data.frequenceJours || 1)
    const reward = data.reward

    // On garde la roue deja affichee (meme ordre des cases) tant qu'elle contient le lot gagne ;
    // sinon (configuration modifiee entre-temps) on bascule sur la liste du serveur.
    const listeAffichee: Lot[] = rewards.some(r => r.label === reward.label) ? rewards : data.rewardsList
    if (listeAffichee !== rewards) setRewards(listeAffichee)

    if (reward.label !== LABEL_PERDU) {
      setRecompenseRowId(data.clientRowId || null)
      // Envoi de l'email en parallele : on n'attend plus sa reponse pour lancer la roue.
      // Le resultat est connu bien avant la fin du tour (8 s).
      fetch("/api/send-reward-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email, recompense: reward.label, restaurantNom: nomRestaurant, slug, clientRowId: data.clientRowId }),
      })
        .then(async (resEmail) => {
          if (resEmail.ok) {
            setEmailStatut("ok")
          } else {
            const detail = await resEmail.json().catch(() => null)
            console.error("Envoi de l'email de recompense impossible :", detail)
            setEmailStatut("echec")
          }
        })
        .catch((err) => {
          console.error("Envoi de l'email de recompense impossible :", err)
          setEmailStatut("echec")
        })
    }

    setResult(reward)
    setLoading(false)
    setStep("wheel")

    setTimeout(() => {
      setSpinning(true)
      setRotation(getTargetRotation(listeAffichee, reward))

      // Une fois arretee, on laisse voir sur quoi la roue s'est posee avant d'afficher le resultat
      setTimeout(() => {
        setSpinning(false)
        setStep(reward.label === LABEL_PERDU ? "lose" : "win")
      }, DUREE_ROTATION_MS + PAUSE_FIN_MS)
    }, PAUSE_AVANT_ROTATION_MS)
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
          <p className="text-ink/75 text-base">Ce lien ne correspond à aucun restaurant. Vérifiez le QR code ou le lien utilisé.</p>
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
          <p className="text-ink/75 text-base">Ce restaurant n&apos;a pas (ou plus) d&apos;abonnement actif.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-sm border border-wine/10 w-full max-w-md p-8">

        {step === "form" && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-semibold text-ink">Tentez votre chance !</h1>
            <p className="text-ink/75 text-base mt-2">Voici ce que vous pouvez gagner. Remplissez vos infos puis lancez la roue.</p>
          </div>
        )}

        {step === "form" && rewards.length > 0 && (
          <div className="mb-8">
            <RoueChance rewards={rewards} rotation={0} spinning={false} />
            <LegendeLots rewards={rewards} />
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
            <RoueChance rewards={rewards} rotation={rotation} spinning={spinning} />
            <p className="mt-7 text-ink/80 text-lg font-medium">
              {spinning ? "La roue tourne... 🎡" : rotation === 0 ? "C'est parti !" : "Et le résultat est..."}
            </p>
          </div>
        )}

        {step === "win" && result && (
          <div className="text-center">
            <div className="text-7xl mb-3">🎉</div>
            <h2 className="text-3xl font-display font-semibold text-ink mb-2">Félicitations !</h2>
            <p className="text-lg text-ink/80 mb-5">Vous avez gagné :</p>
            <div className="bg-gold/15 border-2 border-gold/50 rounded-2xl p-7 mb-6">
              <p className="text-3xl font-display font-semibold text-wine-dark leading-tight">{result.label}</p>
            </div>

            {emailStatut === "echec" ? (
              <div className="mb-5 rounded-2xl border-2 border-gold/50 bg-gold/10 p-5 text-left">
                <p className="text-lg font-semibold text-wine-dark mb-2">L&apos;email n&apos;a pas pu partir</p>
                <p className="text-base text-ink/80 mb-4">
                  Pas d&apos;inquiétude, votre gain est bien enregistré. <strong>Faites une capture d&apos;écran de ce code</strong>{" "}
                  et présentez-la au comptoir au moment de payer.
                </p>
                <canvas id="qr-recompense-canvas" width={180} height={180} className="mx-auto max-w-full rounded-lg bg-white p-2 shadow-sm" />
                <p className="mt-3 text-center text-sm text-ink/70">
                  Valable {DUREE_VALIDITE_JOURS} jours, utilisable une seule fois.
                </p>
              </div>
            ) : (
              <div className="mb-5 rounded-2xl bg-wine p-5 text-left text-ivory">
                <p className="font-display text-xl font-semibold text-gold-light mb-2">Pour récupérer votre cadeau</p>
                <p className="text-base leading-relaxed">
                  Au moment de payer, <strong>présentez au comptoir l&apos;email de votre récompense</strong> (avec son QR code).
                </p>
                <p className="mt-3 rounded-lg bg-gold px-3 py-2.5 text-base font-semibold text-wine-dark">
                  📬 Pas d&apos;email ? Regardez dans vos spams (courriers indésirables).
                </p>
                <p className="mt-3 text-sm text-ivory/85">
                  Valable {DUREE_VALIDITE_JOURS} jours, utilisable une seule fois.
                </p>
              </div>
            )}

            <div className="mb-6 rounded-2xl border-2 border-wine/25 bg-ivory p-4">
              <p className="text-lg font-semibold text-wine-dark">
                🎡 Revenez {quandRejouer(frequenceJours)} pour retenter votre chance !
              </p>
            </div>

            <AvisSection
              slug={slug}
              estPremium={estPremium}
              aCarte={aCarte}
              dejaAvis={dejaAvis}
              clientRowId={clientRowId}
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
            <div className="text-7xl mb-3">😢</div>
            <h2 className="text-3xl font-display font-semibold text-ink mb-2">Pas de chance !</h2>
            <p className="text-lg text-ink/80 mb-6">Vous n&apos;avez rien gagné cette fois...</p>
            <div className="mb-6 rounded-2xl border-2 border-wine/25 bg-ivory p-5">
              <p className="text-lg font-semibold text-wine-dark">
                🍀 Revenez {quandRejouer(frequenceJours)} pour retenter votre chance !
              </p>
            </div>

            <AvisSection
              slug={slug}
              estPremium={estPremium}
              aCarte={aCarte}
              dejaAvis={dejaAvis}
              clientRowId={clientRowId}
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
            <div className="text-7xl mb-3">⏳</div>
            <h2 className="text-3xl font-display font-semibold text-ink mb-2">Déjà joué !</h2>
            <p className="text-lg text-ink/80 mb-6">
              Vous avez déjà participé{frequenceJours === 1 ? " aujourd'hui" : ""}.
            </p>
            <div className="mb-4 rounded-2xl border-2 border-wine/25 bg-ivory p-5">
              <p className="text-lg font-semibold text-wine-dark">
                🎡 Revenez {quandRejouer(frequenceJours)} pour retenter votre chance !
              </p>
            </div>
            {aCarte && (
              <a
                href={`/carte/${slug}`}
                className="block w-full border border-wine/20 text-ink font-medium text-base py-3.5 rounded-lg hover:bg-wine/5 transition-colors text-center"
              >
                🍽️ Voir le menu et ma carte de fidélité
              </a>
            )}
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
  slug, estPremium, aCarte, dejaAvis, clientRowId, prenom, email, dejaVenu,
  avisClique, setAvisClique, avisExiste, setAvisExiste,
  noteAvis, setNoteAvis, commentaireAvis, setCommentaireAvis, avisEtape, setAvisEtape,
}: {
  slug: string
  estPremium: boolean
  aCarte: boolean
  dejaAvis: boolean
  clientRowId: string | null
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

  // Lien carte + menu, toujours sous le bouton Google. Il n'est JAMAIS conditionne a un avis
  // (regles Google : aucun avantage en echange d'un avis).
  const lienCarte = !aCarte ? null : (
    <a
      href={`/carte/${slug}`}
      className="mt-3 block w-full border border-wine/20 text-ink font-medium text-base py-3.5 rounded-lg hover:bg-wine/5 transition-colors text-center"
    >
      🍽️ Voir le menu et ma carte de fidélité
    </a>
  )

  const trackClicGoogle = () => {
    setAvisClique(true)
    fetch("/api/track-avis-clic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, clientRowId }),
    }).catch(() => {})
  }

  const boutonGoogle = (texte = "⭐ Laisser un avis Google") => (
    <a
      href={googleUrl ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClicGoogle}
      className="flex items-center justify-center gap-2 w-full bg-wine text-gold-light text-base font-semibold px-4 py-3.5 rounded-lg shadow-md shadow-wine/20 hover:bg-wine-dark transition-colors"
    >
      {texte}
    </a>
  )

  // Version discrete : apres un retour prive, ou pour un client qui a deja laisse son avis
  const lienGoogleDiscret = (texte: string) => (
    <p className="mt-4 text-center text-sm text-ink/60">
      <a
        href={googleUrl ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackClicGoogle}
        className="underline underline-offset-2 hover:text-wine"
      >
        {texte}
      </a>
    </p>
  )

  // Aucune fiche Google configuree : on montre seulement la carte/menu
  if (!googleUrl) {
    return lienCarte
  }

  // Client qui a deja clique sur "Laisser un avis" lors d'une visite precedente (meme email) :
  // on ne le relance pas, le lien reste dispo en petit en bas
  if (dejaAvis && !avisClique) {
    return (
      <>
        {lienCarte}
        {lienGoogleDiscret("Pas encore laissé d'avis ? Laisser un avis Google")}
      </>
    )
  }

  // Sans tri des avis : bouton Google direct, carte/menu en dessous
  if (!estPremium) {
    return (
      <>
        {boutonGoogle()}
        {lienCarte}
      </>
    )
  }

  // Tri des avis : on demande d'abord une note

  // Etape 1 : on demande la note
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

  // Etape 2a : bonne note → bouton Google en evidence
  if (avisEtape === "positif") {
    return (
      <div className="text-center">
        <p className="text-sm text-ink/70 mb-3">Super, merci ! Partagez votre avis sur Google, ça nous aide énormément 🙏</p>
        {boutonGoogle()}
        {lienCarte}
      </div>
    )
  }

  // Etape 2b : note mitigee/mauvaise → retour prive propose au restaurant, MAIS le lien Google
  // reste disponible : le client publie l'avis qu'il veut (interdit par Google de le masquer)
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
        {lienGoogleDiscret("Vous pouvez aussi laisser un avis public sur Google")}
        {lienCarte}
      </div>
    )
  }

  // Etape 3 : retour prive envoye
  return (
    <div className="text-center">
      <p className="text-sm text-ink/70 mb-1">Merci beaucoup 🙏</p>
      <p className="text-sm text-ink/75 mb-2">Votre retour a bien été transmis au restaurant.</p>
      {lienCarte}
      {lienGoogleDiscret("Vous pouvez aussi laisser un avis public sur Google")}
    </div>
  )
}
