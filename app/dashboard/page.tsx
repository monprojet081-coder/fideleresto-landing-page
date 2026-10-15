"use client"

// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { QrCode, Users, Star, Gift, LogOut, LayoutDashboard, Settings, Sliders, UtensilsCrossed, Download, ArrowRight, CreditCard, Check, BookOpen, Award, Trash2, Search, Image as ImageIcon, FileText, Mail, ShieldCheck, Menu, X, Inbox, ArrowLeft, Lock, ScanLine } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MODELES_FLYER, ModeleFlyer } from "@/lib/flyerTemplates"
import { plans, prixPour, OPTION_SITE, libelleMaintenanceSite } from "@/lib/pricing"
import { REWARDS_PAR_DEFAUT, MODELES_ROUE, lotsPourTypeCuisine, modelePourTypeCuisine } from "@/lib/roue"
import { insererLotsRoue } from "@/lib/roue-config"
import { RoueChance, LegendeLots } from "@/components/roue-chance"
import { CarteFideliteVisuelle } from "@/components/carte-fidelite-visuelle"
import { VideoYoutube } from "@/components/video-youtube"
import { type LotEco, estPerdu, tauxGain, unClientSur, coutParPartie, coutMaxParJour, verdict, ajusterPourRentabilite, SEUIL_RENTABLE, SEUIL_RISQUE, CIBLE_AJUSTEMENT } from "@/lib/rentabilite"
import { statutRecompense, regrouperParClient, normaliserRecherche, DUREE_VALIDITE_JOURS } from "@/lib/recompenses"

function EtapeNumerotee({ n, titre, children }: { n: number; titre: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wine font-display text-sm font-semibold text-gold-light">{n}</span>
        <h2 className="font-display text-lg font-semibold text-ink">{titre}</h2>
      </div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "succes" | "erreur" } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const afficherToast = (message: string, type: "succes" | "erreur" = "succes") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const demanderConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmModal({ message, onConfirm })
  }
  const [activeSection, setActiveSection] = useState("accueil")
  const [lienCopie, setLienCopie] = useState(false)
  const [rewards, setRewards] = useState<LotEco[]>(REWARDS_PAR_DEFAUT.map((r) => ({ ...r, max_par_jour: null })))
  // Calculateur de rentabilite de la roue
  const [panierMoyen, setPanierMoyen] = useState(15)
  const [partiesJour, setPartiesJour] = useState(30)
  const [newLabel, setNewLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [rechercheClient, setRechercheClient] = useState("")
  const [clientSelectionne, setClientSelectionne] = useState<string | null>(null)
  const [validationHistoriqueId, setValidationHistoriqueId] = useState<string | null>(null)
  const [messageHistorique, setMessageHistorique] = useState<{ ok: boolean; texte: string } | null>(null)
  const [clientsLoading, setClientsLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [nomRestaurantInput, setNomRestaurantInput] = useState("")
  const [googleAvisUrl, setGoogleAvisUrl] = useState("")
  const [savingParams, setSavingParams] = useState(false)
  const [relanceActive, setRelanceActive] = useState(false)
  const [relanceJours, setRelanceJours] = useState(10)
  const [relancePourcentage, setRelancePourcentage] = useState(10)
  const [billingPeriod, setBillingPeriod] = useState<"mensuel" | "semestriel" | "annuel">("mensuel")
  const [avecCreationSite, setAvecCreationSite] = useState(false)

  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [abonnementMessage, setAbonnementMessage] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Etapes de mise en route deja faites (memorisees sur cet appareil)
  const [etapesFaites, setEtapesFaites] = useState<Record<string, boolean>>({})
  useEffect(() => {
    try { setEtapesFaites(JSON.parse(localStorage.getItem("fr_etapes") || "{}")) } catch {}
  }, [])
  const marquerEtape = (cle: string) => {
    setEtapesFaites((prev) => {
      const suivant = { ...prev, [cle]: true }
      try { localStorage.setItem("fr_etapes", JSON.stringify(suivant)) } catch {}
      return suivant
    })
  }
  const [avisPrives, setAvisPrives] = useState<{ id: string; note: number; commentaire: string | null; prenom: string | null; email: string | null; created_at: string }[]>([])
  const [loadingAvisPrives, setLoadingAvisPrives] = useState(false)

  // Menu digital
  const [uploadingMenu, setUploadingMenu] = useState(false)
  const [menuUploadError, setMenuUploadError] = useState("")
  const [menuUploadSuccess, setMenuUploadSuccess] = useState(false)

  // Flyer
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState("")
  const [selectedModele, setSelectedModele] = useState<ModeleFlyer | null>(MODELES_FLYER[0] ?? null)
  const [flyerAffichage, setFlyerAffichage] = useState<"nom" | "logo">("nom")
  const [generatingFlyer, setGeneratingFlyer] = useState(false)

  // Carte de fidélité
  const [tamponsRequis, setTamponsRequis] = useState(8)
  const [montantMin, setMontantMin] = useState(1)
  const [recompenseFidelite, setRecompenseFidelite] = useState("Un plat offert")
  const [savingFidelite, setSavingFidelite] = useState(false)
  const [rechercheEmail, setRechercheEmail] = useState("")
  const [clientTrouve, setClientTrouve] = useState<any>(null)
  const [filtreClients, setFiltreClients] = useState<"tous" | "a_utiliser" | "semaine" | "habitues">("tous")
  const [roueFrequenceJours, setRoueFrequenceJours] = useState(1)
  const [clientsFidelite, setClientsFidelite] = useState<{ client_id: string; prenom: string | null; tampons: number; updated_at: string }[]>([])
  const [chargementClientsFidelite, setChargementClientsFidelite] = useState(false)
  const [rechercheLoading, setRechercheLoading] = useState(false)
  const [rechercheError, setRechercheError] = useState("")
  const [montantPassage, setMontantPassage] = useState("")
  const [validationLoading, setValidationLoading] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [recompenseScanResult, setRecompenseScanResult] = useState<{ success: boolean; prenom?: string; recompense?: string; error?: string } | null>(null)
  const [rechercheRecompenseEmail, setRechercheRecompenseEmail] = useState("")
  const [recompensesTrouvees, setRecompensesTrouvees] = useState<any[]>([])
  const [rechercheRecompenseLoading, setRechercheRecompenseLoading] = useState(false)
  const [rechercheRecompenseError, setRechercheRecompenseError] = useState("")
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scanCanvasRef = useRef<HTMLCanvasElement>(null)
  const scanFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/inscription")
      } else {
        setUser(user)
        const slug = user.id.slice(0, 8)

        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) {
            fetch("/api/admin/check", {
              headers: { Authorization: `Bearer ${session.access_token}` },
            })
              .then((res) => res.json())
              .then((d) => setIsAdmin(!!d.isAdmin))
              .catch(() => {})
          }
        })

        const { data } = await supabase
          .from("roue_config")
          .select("*")
          .eq("restaurant_id", slug)
        if (data && data.length > 0) {
          setRewards(data.map((r: any) => ({
            label: r.label,
            probabilite: r.probabilite,
            couleur: r.couleur,
            cout: r.cout ?? null,
            max_par_jour: r.max_par_jour ?? null,
            garanti_apres_visites: r.garanti_apres_visites ?? null,
          })))
        } else if (data) {
          // Aucune roue reglee : on l'initialise avec le modele de son type de cuisine
          // (choisi a l'inscription), pour que ses clients jouent tout de suite a une roue adaptee
          const depart = lotsPourTypeCuisine(user.user_metadata?.type_cuisine)
          setRewards(depart.map((l) => ({ ...l, max_par_jour: l.max_par_jour ?? null, garanti_apres_visites: l.garanti_apres_visites ?? null })))
          insererLotsRoue(supabase, slug, depart).then(({ error }) => {
            if (error) console.warn("Roue de depart non creee :", error.message)
          })
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
          setNomRestaurantInput(restoData.nom_restaurant || "")
          setRoueFrequenceJours(restoData.roue_frequence_jours || 1)
          if (restoData.panier_moyen) setPanierMoyen(Number(restoData.panier_moyen))
          if (restoData.parties_estimees_jour) setPartiesJour(Number(restoData.parties_estimees_jour))
          setRelanceActive(restoData.relance_active || false)
          setRelanceJours(restoData.relance_jours_inactivite || 10)
          setRelancePourcentage(restoData.relance_pourcentage || 10)
        } else {
          const { data: newResto, error: erreurInsert } = await supabase
            .from("restaurants")
            .insert([{
              user_id: user.id,
              slug,
              nom_restaurant: user.user_metadata?.nom_restaurant || "Mon Restaurant",
              google_avis_url: user.user_metadata?.google_avis_url || null,
              telephone: user.user_metadata?.telephone || null,
              ville: user.user_metadata?.ville || null,
              parrain: user.user_metadata?.parrain || null,
              scan_qr: 0,
            }])
            .select()
            .single()
          if (erreurInsert) {
            console.error("Erreur création restaurant (dashboard fallback):", erreurInsert.message)
          }
          if (newResto) {
            setRestaurant(newResto)
            setGoogleAvisUrl(newResto.google_avis_url || "")
            setNomRestaurantInput(newResto.nom_restaurant || "")
          }
        }
      }
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    const compteVerrouille = restaurant && (!restaurant.plan || !["actif", "essai"].includes(restaurant.statut_abonnement))
    if (compteVerrouille && activeSection !== "abonnement") {
      setActiveSection("abonnement")
    }
  }, [restaurant, activeSection])

  useEffect(() => {
    const chargerAvisPrives = async () => {
      if (activeSection !== "retours" || !user) return
      setLoadingAvisPrives(true)
      const slug = user.id.slice(0, 8)
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/avis-prives?slug=${slug}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const data = await res.json()
      setAvisPrives(data.avis || [])
      setLoadingAvisPrives(false)
    }
    chargerAvisPrives()
  }, [activeSection, user])

  useEffect(() => {
    if (activeSection === "qrcode" && user) {
      import('qrcode').then(QRCode => {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
        if (canvas) {
          QRCode.toCanvas(
            canvas,
            `${process.env.NEXT_PUBLIC_SITE_URL || "https://fideleresto-landing-page-9dhz.vercel.app"}/r/${user.id.slice(0, 8)}`,
            { width: 200, margin: 2, color: { dark: "#241914", light: "#faf3e8" } },
            () => {}
          )
        }
      })
    }

    if (activeSection === "fidelite" && restaurant) {
      setTamponsRequis(restaurant.fidelite_tampons_requis ?? 8)
      setMontantMin(restaurant.fidelite_montant_min ?? 1)
      setRecompenseFidelite(restaurant.fidelite_recompense ?? "Un plat offert")

      setChargementClientsFidelite(true)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        try {
          const slug = user.id.slice(0, 8)
          const res = await fetch(`/api/fidelite/liste-clients?slug=${slug}`, {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
          const data = await res.json()
          setClientsFidelite(data.clients || [])
        } finally {
          setChargementClientsFidelite(false)
        }
      })
    }

    if (activeSection !== "scanner" && streamRef.current) {
      arreterScan()
    }
  }, [activeSection, user, restaurant])

  useEffect(() => {
    const statut = searchParams.get("abonnement")
    if (statut === "succes") {
      setAbonnementMessage("Paiement confirmé, merci ! Votre abonnement est en cours d'activation (quelques secondes).")
      setActiveSection("abonnement")
    } else if (statut === "annule") {
      setAbonnementMessage("Le paiement a été annulé, aucun montant n'a été prélevé.")
      setActiveSection("abonnement")
    }
  }, [searchParams])

  // Recharge la liste des clients : sans ca, un gain valide au scanner (autre onglet)
  // s'afficherait encore "a utiliser" ici.
  const rechargerClients = async () => {
    if (!user) return
    const slug = user.id.slice(0, 8)
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("restaurant_slug", slug)
      .order("created_at", { ascending: false })
    if (data) setClients(data)
  }

  useEffect(() => {
    if (activeSection === "clients" && user) {
      rechargerClients()
    }
    if (activeSection !== "clients") {
      setClientSelectionne(null)
      setMessageHistorique(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, user])

  const validerDepuisHistorique = async (clientRowId: string) => {
    setValidationHistoriqueId(clientRowId)
    setMessageHistorique(null)
    const slug = user.id.slice(0, 8)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch("/api/roue/valider-recompense", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ slug, clientRowId }),
    })
    const result = await res.json()
    if (result.success) {
      setClients(prev => prev.map(c => c.id === clientRowId
        ? { ...c, recompense_utilisee: true, recompense_utilisee_le: new Date().toISOString() }
        : c))
      setMessageHistorique({ ok: true, texte: `Récompense validée : ${result.recompense}` })
    } else {
      setMessageHistorique({ ok: false, texte: result.error || "Erreur lors de la validation" })
      rechargerClients()
    }
    setValidationHistoriqueId(null)
  }

  const handleSubscribe = async (planKey: string) => {
    setSubscribing(planKey)
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          plan: planKey,
          avecCreationSite,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        afficherToast("Erreur : " + (data.error || "impossible de démarrer le paiement"), "erreur")
        setSubscribing(null)
      }
    } catch (err) {
      afficherToast("Erreur lors de la connexion au paiement", "erreur")
      setSubscribing(null)
    }
  }

  const handleCancelSubscription = () => {
    demanderConfirmation(
      "Résilier votre abonnement ? Il restera actif jusqu'à la fin de la période en cours (ou de votre essai gratuit), puis s'arrêtera automatiquement sans prélèvement.",
      executerResiliation
    )
  }

  const executerResiliation = async () => {
    setCancelling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const data = await res.json()
      if (data.success) {
        setRestaurant({ ...restaurant, resiliation_prevue: true, fin_periode_actuelle: data.finPeriode })
        setAbonnementMessage("Résiliation programmée. Votre abonnement reste actif jusqu'à la fin de la période en cours.")
      } else {
        afficherToast("Erreur : " + (data.error || "impossible de résilier"), "erreur")
      }
    } catch {
      afficherToast("Erreur lors de la résiliation", "erreur")
    }
    setCancelling(false)
  }

  const handleReactivateSubscription = async () => {
    setCancelling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/reactivate-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const data = await res.json()
      if (data.success) {
        setRestaurant({ ...restaurant, resiliation_prevue: false })
        setAbonnementMessage("Résiliation annulée, votre abonnement continue normalement.")
      } else {
        afficherToast("Erreur : " + (data.error || "impossible d'annuler la résiliation"), "erreur")
      }
    } catch {
      afficherToast("Erreur lors de l'annulation de la résiliation", "erreur")
    }
    setCancelling(false)
  }

  const handleSupprimerAvisPrive = (id: string) => {
    demanderConfirmation("Supprimer ce retour client ? Cette action est définitive.", async () => {
      const slug = user.id.slice(0, 8)
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/avis-prives?slug=${slug}&id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAvisPrives(avisPrives.filter((a) => a.id !== id))
        afficherToast("Retour supprimé")
      } else {
        afficherToast("Erreur : " + (data.error || "impossible de supprimer"), "erreur")
      }
    })
  }

  const saveRewards = async () => {
    setSaving(true)
    const slug = user.id.slice(0, 8)
    const { error: deleteError } = await supabase
      .from("roue_config")
      .delete()
      .eq("restaurant_id", slug)
    if (deleteError) {
      console.error("Erreur delete:", deleteError)
      afficherToast("Erreur lors de la sauvegarde : " + deleteError.message, "erreur")
      setSaving(false)
      return
    }
    // Insertion tolerante : marche meme si la base n'a pas encore les nouvelles colonnes
    const { error: insertError, arrondi } = await insererLotsRoue(supabase, slug, rewards)
    if (arrondi) afficherToast("Pourcentages arrondis : demandez la mise à jour de la base pour les décimales.", "erreur")
    if (insertError) {
      console.error("Erreur insert:", insertError)
      afficherToast("Erreur lors de la sauvegarde : " + insertError.message, "erreur")
      setSaving(false)
      return
    }
    const { error: freqError } = await supabase
      .from("restaurants")
      .update({ roue_frequence_jours: roueFrequenceJours })
      .eq("slug", slug)
    if (freqError) {
      console.error("Erreur frequence:", freqError)
    } else {
      setRestaurant({ ...restaurant, roue_frequence_jours: roueFrequenceJours })
    }
    // Panier moyen et parties/jour du calculateur (non bloquant si les colonnes n'existent pas)
    await supabase
      .from("restaurants")
      .update({ panier_moyen: panierMoyen, parties_estimees_jour: partiesJour })
      .eq("slug", slug)
      .then(({ error }) => { if (error) console.warn("Calculateur non sauvegarde :", error.message) })
    setSaving(false)
    afficherToast("Roue sauvegardée !")
  }

  const handleMenuUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMenu(true)
    setMenuUploadError("")
    setMenuUploadSuccess(false)

    const { data: { session } } = await supabase.auth.getSession()
    const formData = new FormData()
    formData.append("file", file)
    formData.append("token", session?.access_token || "")

    try {
      const res = await fetch("/api/menu/upload", { method: "POST", body: formData })
      const result = await res.json()
      if (result.error) {
        setMenuUploadError(result.error)
      } else {
        setMenuUploadSuccess(true)
        setRestaurant({ ...restaurant, menu_type: result.menuType, menu_url: result.menuUrl })
      }
    } catch (err) {
      setMenuUploadError("Erreur lors de l'envoi du fichier.")
    }
    setUploadingMenu(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setLogoUploadError("")

    const { data: { session } } = await supabase.auth.getSession()
    const formData = new FormData()
    formData.append("file", file)
    formData.append("token", session?.access_token || "")

    try {
      const res = await fetch("/api/logo/upload", { method: "POST", body: formData })
      const result = await res.json()
      if (result.error) {
        setLogoUploadError(result.error)
      } else {
        setRestaurant({ ...restaurant, logo_url: result.logoUrl })
      }
    } catch (err) {
      setLogoUploadError("Erreur lors de l'envoi du logo.")
    }
    setUploadingLogo(false)
  }

  const chargerImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  const generateFlyer = async () => {
    if (!selectedModele) return
    setGeneratingFlyer(true)
    marquerEtape("qr")
    try {
      const { jsPDF } = await import("jspdf")
      const QRCode = await import("qrcode")

      const nomRestaurant = restaurant?.nom_restaurant || "Notre restaurant"
      const slug = user.id.slice(0, 8)
      const urlRoue = `${process.env.NEXT_PUBLIC_SITE_URL || "https://fideleresto-landing-page-9dhz.vercel.app"}/r/${slug}`

      const ink = "#241914"
      const ivory = "#faf3e8"

      // Le PDF garde les proportions exactes de l'image du modèle choisi
      const pageW = 148 // mm, référence A5
      const pageH = pageW * (selectedModele.hauteurPx / selectedModele.largeurPx)

      const doc = new jsPDF({ unit: "mm", format: [pageW, pageH], orientation: "portrait" })

      // Police Fraunces (identité FidèleResto) intégrée au PDF, à la place des polices génériques
      const fontResp = await fetch("/fonts/fraunces-bold.ttf")
      const fontBuffer = await fontResp.arrayBuffer()
      let fontBinaire = ""
      new Uint8Array(fontBuffer).forEach((b) => (fontBinaire += String.fromCharCode(b)))
      const fontBase64 = btoa(fontBinaire)
      doc.addFileToVFS("fraunces-bold.ttf", fontBase64)
      doc.addFont("fraunces-bold.ttf", "Fraunces", "bold")

      // Fond = l'image du modèle en pleine page
      const fondImg = await chargerImage(selectedModele.fichierPng)
      doc.addImage(fondImg, "PNG", 0, 0, pageW, pageH)

      // Zone bannière (nom OU logo) — on rétrécit un peu la zone mesurée pour
      // rester à l'écart des décorations du cadre (feuilles, coins arrondis du ticket)
      const b = selectedModele.banniere
      const bx = (b.xPct / 100) * pageW + (b.wPct / 100) * pageW * 0.03
      const by = (b.yPct / 100) * pageH + (b.hPct / 100) * pageH * 0.06
      const bw = (b.wPct / 100) * pageW * 0.94
      const bh = (b.hPct / 100) * pageH * 0.88
      const couleurTexte = selectedModele.interieurClair ? ink : ivory

      const afficherLogo = flyerAffichage === "logo" && !!restaurant?.logo_url

      if (afficherLogo) {
        // Logo seul, en grand, centré dans la bannière
        const logoImg = await chargerImage(restaurant.logo_url)
        const ratio = logoImg.height / logoImg.width
        let logoH = bh * 0.98
        let logoW = logoH / ratio
        if (logoW > bw * 0.96) {
          logoW = bw * 0.96
          logoH = logoW * ratio
        }
        doc.addImage(logoImg, "PNG", bx + (bw - logoW) / 2, by + (bh - logoH) / 2, logoW, logoH)
      } else {
        // Nom du restaurant seul, centré, en Fraunces
        doc.setFont("Fraunces", "bold")
        let tailleTexte = Math.min(30, Math.max(12, bh * 3.6))
        doc.setFontSize(tailleTexte)
        while (doc.getTextWidth(nomRestaurant) > bw * 0.94 && tailleTexte > 9) {
          tailleTexte -= 0.5
          doc.setFontSize(tailleTexte)
        }
        doc.setTextColor(couleurTexte)
        doc.text(
          nomRestaurant,
          bx + bw / 2,
          by + bh / 2,
          { align: "center", baseline: "middle" }
        )
      }

      // Zone QR code — on garde une marge intérieure pour ne pas toucher le cadre
      const q = selectedModele.qr
      const qx = (q.xPct / 100) * pageW
      const qy = (q.yPct / 100) * pageH
      const qw = (q.wPct / 100) * pageW
      const qh = (q.hPct / 100) * pageH
      const qrTaille = Math.min(qw, qh) * 0.86

      const qrDataUrl: string = await QRCode.toDataURL(urlRoue, {
        width: 400,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })
      doc.addImage(
        qrDataUrl, "PNG",
        qx + (qw - qrTaille) / 2,
        qy + (qh - qrTaille) / 2,
        qrTaille, qrTaille
      )

      doc.save(`flyer-${selectedModele.id}-${slug}.pdf`)
    } catch (err) {
      afficherToast("Erreur lors de la génération du flyer.", "erreur")
      console.error(err)
    }
    setGeneratingFlyer(false)
  }

  const saveFideliteConfig = async () => {
    setSavingFidelite(true)
    const slug = user.id.slice(0, 8)
    const { error } = await supabase
      .from("restaurants")
      .update({
        fidelite_tampons_requis: tamponsRequis,
        fidelite_montant_min: montantMin,
        fidelite_recompense: recompenseFidelite,
      })
      .eq("slug", slug)

    if (error) {
      afficherToast("Erreur : " + error.message, "erreur")
    } else {
      setRestaurant({ ...restaurant, fidelite_tampons_requis: tamponsRequis, fidelite_montant_min: montantMin, fidelite_recompense: recompenseFidelite })
      afficherToast("Réglages sauvegardés !")
    }
    setSavingFidelite(false)
  }

  const rechercherClientParId = async (clientId: string) => {
    setRechercheError("")
    setClientTrouve(null)
    setValidationMessage("")
    setRechercheLoading(true)
    const slug = user.id.slice(0, 8)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/fidelite/rechercher-client-id", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ clientId, restaurantSlug: slug }),
    })
    const result = await res.json()

    if (result.error) {
      setRechercheError(result.error)
    } else {
      setClientTrouve(result)
    }
    setRechercheLoading(false)
  }

  const arreterScan = () => {
    if (scanFrameRef.current) cancelAnimationFrame(scanFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  const demarrerScan = async () => {
    setRechercheError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream
      setScanning(true)

      // On attend que le <video> soit bien monté dans le DOM avant d'y attacher le flux
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          boucleScan()
        }
      }, 50)
    } catch (err) {
      setRechercheError("Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur.")
    }
  }

  const boucleScan = async () => {
    const jsQR = (await import("jsqr")).default
    const tick = () => {
      const video = videoRef.current
      const canvas = scanCanvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code && code.data.startsWith("fideleresto:client:") && !estComplet) {
            arreterScan()
            setClientTrouve(null)
            setRecompenseScanResult({ success: false, error: "Ce QR est une carte de fidélité : la carte de fidélité est incluse dans le plan Complet." })
            return
          }
          if (code && code.data.startsWith("fideleresto:client:")) {
            const clientId = code.data.replace("fideleresto:client:", "")
            arreterScan()
            setRecompenseScanResult(null)
            rechercherClientParId(clientId)
            return
          }
          if (code && code.data.startsWith("fideleresto:recompense:")) {
            const [clientRowId, signature] = code.data.replace("fideleresto:recompense:", "").split(":")
            arreterScan()
            setClientTrouve(null)
            validerRecompenseParId(clientRowId, signature || "")
            return
          }
        }
      }
      scanFrameRef.current = requestAnimationFrame(tick)
    }
    scanFrameRef.current = requestAnimationFrame(tick)
  }

  const rechercherClient = async () => {
    setRechercheError("")
    setClientTrouve(null)
    setValidationMessage("")
    if (!rechercheEmail.trim()) return
    setRechercheLoading(true)

    const slug = user.id.slice(0, 8)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/fidelite/rechercher-client", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ email: rechercheEmail, restaurantSlug: slug }),
    })
    const result = await res.json()

    if (result.error) {
      setRechercheError(result.error)
    } else {
      setClientTrouve(result)
    }
    setRechercheLoading(false)
  }

  // signature : presente quand on scanne le QR de l'email ; null quand le restaurateur
  // choisit lui-meme la recompense apres une recherche par email
  const validerRecompenseParId = async (clientRowId: string, signature: string | null = null) => {
    const slug = user.id.slice(0, 8)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch("/api/roue/valider-recompense", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ slug, clientRowId, signature, depuisQr: signature !== null }),
    })
    const result = await res.json()
    setRecompenseScanResult(result)
  }

  const rechercherRecompense = async () => {
    setRechercheRecompenseError("")
    setRecompensesTrouvees([])
    if (!rechercheRecompenseEmail.trim()) return
    setRechercheRecompenseLoading(true)
    const slug = user.id.slice(0, 8)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/roue/rechercher-recompense?slug=${slug}&email=${encodeURIComponent(rechercheRecompenseEmail.trim())}`, {
      headers: { "Authorization": `Bearer ${session?.access_token}` },
    })
    const result = await res.json()
    if (result.error) {
      setRechercheRecompenseError(result.error)
    } else {
      setRecompensesTrouvees(result.recompenses || [])
      if ((result.recompenses || []).length === 0) {
        setRechercheRecompenseError("Aucune récompense trouvée pour cet email")
      }
    }
    setRechercheRecompenseLoading(false)
  }

  const validerPassage = async () => {
    const montant = parseFloat(montantPassage)
    if (!montant || montant <= 0) {
      setValidationMessage("Entrez un montant valide.")
      return
    }
    setValidationLoading(true)
    const slug = user.id.slice(0, 8)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch("/api/fidelite/valider-passage", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ email: rechercheEmail, restaurantSlug: slug, montant }),
    })
    const result = await res.json()

    if (result.error) {
      setValidationMessage(result.error)
    } else {
      setClientTrouve({ ...clientTrouve, tampons: result.tampons })
      setMontantPassage("")
      setValidationMessage(
        result.recompenseDebloquee
          ? `🎉 Récompense débloquée : ${restaurant?.fidelite_recompense} ! Compteur remis à zéro.`
          : "Tampon ajouté !"
      )
    }
    setValidationLoading(false)
  }

  const saveParametres = async () => {
    setSavingParams(true)
    const slug = user.id.slice(0, 8)
    const { error } = await supabase
      .from("restaurants")
      .update({
        google_avis_url: googleAvisUrl,
        nom_restaurant: nomRestaurantInput,
        relance_active: relanceActive,
        relance_jours_inactivite: relanceJours,
        relance_pourcentage: relancePourcentage,
      })
      .eq("slug", slug)
    if (error) {
      afficherToast("Erreur lors de la sauvegarde : " + error.message, "erreur")
    } else {
      setRestaurant({
        ...restaurant,
        nom_restaurant: nomRestaurantInput,
        google_avis_url: googleAvisUrl,
        relance_active: relanceActive,
        relance_jours_inactivite: relanceJours,
        relance_pourcentage: relancePourcentage,
      })
      afficherToast("Paramètres sauvegardés !")
    }
    setSavingParams(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-wine border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-ink/70 text-sm">Chargement...</p>
      </div>
    </div>
  )

  const nomResto = restaurant?.nom_restaurant || "Mon Restaurant"
  const totalProba = Math.round(rewards.reduce((a, r) => a + (Number(r.probabilite) || 0), 0) * 10) / 10
  const totalOk = Math.abs(totalProba - 100) < 0.05

  const kpis = [
    { label: "Scans du QR code", aide: "Clients qui ont ouvert la roue", value: restaurant?.scan_qr?.toString() || "0", icon: QrCode, color: "bg-wine/8 text-wine" },
    { label: "Parties jouées", aide: "Clients qui ont donné leur email", value: clients.length.toString(), icon: Users, color: "bg-sage/10 text-sage" },
    { label: "Récompenses gagnées", aide: "Lots offerts par la roue", value: clients.filter((c) => c.a_gagne).length.toString(), icon: Gift, color: "bg-gold/12 text-wine-dark" },
    { label: "Clics vers Google", aide: "Clients partis laisser un avis", value: restaurant?.avis_google_clics?.toString() || "0", icon: Star, color: "bg-wine/8 text-wine" },
  ]

  // Clients collectés par jour, sur les 14 derniers jours
  const clientsParJour = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    const jourStr = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    const debutJour = new Date(date.setHours(0, 0, 0, 0))
    const finJour = new Date(date.setHours(23, 59, 59, 999))
    const count = clients.filter((c) => {
      const d = new Date(c.created_at)
      return d >= debutJour && d <= finJour
    }).length
    return { jour: jourStr, clients: count }
  })

  // Taux de victoire
  const nbGagne = clients.filter((c) => c.a_gagne).length
  const nbPerdu = clients.length - nbGagne
  const dataVictoire = [
    { name: "Gagné", value: nbGagne },
    { name: "Perdu", value: nbPerdu },
  ]

  // Récompenses les plus données (parmi les gagnants)
  const recompensesCount: Record<string, number> = {}
  clients.filter((c) => c.a_gagne).forEach((c) => {
    recompensesCount[c.recompense] = (recompensesCount[c.recompense] || 0) + 1
  })
  const dataRecompenses = Object.entries(recompensesCount)
    .map(([nom, count]) => ({ nom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // === Statistiques avancées (Premium) ===
  // Les statistiques avancees restent une fonctionnalite du plan standard (Complet) uniquement
  const estPremiumStats = restaurant?.plan === "standard"
  // Carte fidélité, menu digital et relances : réservés au plan Complet (standard)
  const estComplet = restaurant?.plan === "standard"

  // Comparaison mois en cours vs mois précédent (nombre de clients / passages)
  const maintenant = new Date()
  const debutMoisEnCours = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
  const debutMoisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1)
  const clientsMoisEnCours = clients.filter((c) => new Date(c.created_at) >= debutMoisEnCours).length
  const clientsMoisPrecedent = clients.filter((c) => {
    const d = new Date(c.created_at)
    return d >= debutMoisPrecedent && d < debutMoisEnCours
  }).length
  const evolutionMois = clientsMoisPrecedent === 0
    ? (clientsMoisEnCours > 0 ? 100 : 0)
    : Math.round(((clientsMoisEnCours - clientsMoisPrecedent) / clientsMoisPrecedent) * 100)

  // Répartition par heure de la journée (0-23h) pour repérer les heures de pointe
  const parHeure = Array.from({ length: 24 }).map((_, h) => ({
    heure: `${h}h`,
    passages: clients.filter((c) => new Date(c.created_at).getHours() === h).length,
  }))
  const heurePointe = parHeure.reduce((max, cur) => (cur.passages > max.passages ? cur : max), parHeure[0])

  // Répartition par jour de la semaine
  const nomsJours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const parJourSemaine = [1, 2, 3, 4, 5, 6, 0].map((jourIndex) => ({
    jour: nomsJours[jourIndex],
    passages: clients.filter((c) => new Date(c.created_at).getDay() === jourIndex).length,
  }))
  const jourPointe = parJourSemaine.reduce((max, cur) => (cur.passages > max.passages ? cur : max), parJourSemaine[0])

  // Compte verrouillé : abonnement résilié (arrivé à sa date de fin), impayé, ou jamais souscrit.
  // On ne coupe pas l'accès pendant une résiliation programmée (resiliation_prevue) tant que
  // la période en cours n'est pas terminée — seulement une fois que Stripe a réellement mis fin
  // à l'abonnement (statut_abonnement passe à "annule" via le webhook customer.subscription.deleted).
  // Même logique que la page roue (/r/[slug]) : tout statut qui n'est pas "actif" ou "essai" verrouille.
  const compteVerrouille = !restaurant?.plan || !["actif", "essai"].includes(restaurant?.statut_abonnement)

  type ItemNav = { id: string; label: string; icon: any; verrou?: boolean }
  // Menu regroupe par usage, pour que le restaurateur trouve tout de suite ce qu'il cherche
  const groupesNav: { titre: string; items: ItemNav[] }[] = compteVerrouille
    ? [{ titre: "Mon compte", items: [{ id: "abonnement", label: "Abonnement", icon: CreditCard }] }]
    : [
        {
          titre: "Au quotidien",
          items: [
            { id: "accueil", label: "Accueil", icon: LayoutDashboard },
            { id: "clients", label: "Mes clients", icon: Users },
            ...(restaurant?.plan === "essentiel" || restaurant?.plan === "standard" ? [{ id: "retours", label: "Retours clients", icon: Inbox }] : []),
          ],
        },
        {
          titre: "Ma roue et mes outils",
          items: [
            { id: "roue", label: "Ma roue", icon: Sliders },
            { id: "qrcode", label: "QR code et flyers", icon: QrCode },
            { id: "fidelite", label: "Carte de fidélité", icon: Award, verrou: !estComplet },
            { id: "menu", label: "Menu digital", icon: BookOpen, verrou: !estComplet },
            { id: "relance", label: "Relances email", icon: Mail, verrou: !estComplet },
          ],
        },
        {
          titre: "Mon compte",
          items: [
            { id: "abonnement", label: "Abonnement", icon: CreditCard },
            { id: "parametres", label: "Paramètres", icon: Settings },
          ],
        },
      ]
  const allerA = (id: string) => {
    if (id === "roue") marquerEtape("roue")
    setActiveSection(id)
    setSidebarOpen(false)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-screen bg-secondary/40 flex">

      {/* Barre supérieure mobile avec bouton menu */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-wine flex items-center justify-between px-4 h-14">
        <button onClick={() => setSidebarOpen(true)} className="text-gold-light p-1" aria-label="Ouvrir le menu">
          <Menu className="w-6 h-6" />
        </button>
        <a href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-gold-light/15 text-gold-light">
            <UtensilsCrossed className="w-3.5 h-3.5" />
          </span>
          <span className="text-sm font-display font-semibold text-gold-light">FidèleResto</span>
        </a>
      </div>

      {/* Voile sombre derrière la sidebar sur mobile */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside className={`w-64 bg-wine flex flex-col fixed h-full z-50 transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 py-5 border-b border-gold-light/15 flex items-center gap-2.5">
          <a href="/dashboard" className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex size-8 items-center justify-center rounded-full bg-gold-light/15 text-gold-light flex-shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-base font-display font-semibold text-gold-light block leading-tight">FidèleResto</span>
              <p className="text-xs text-ivory/75 truncate leading-tight">{nomResto}</p>
            </div>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-ivory/80 p-1" aria-label="Fermer le menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action principale au comptoir : toujours a portee de main */}
        {!compteVerrouille && (
          <div className="px-3 pt-4">
            <button
              onClick={() => allerA("scanner")}
              className={`w-full flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition-colors ${
                activeSection === "scanner" ? "bg-ivory text-wine-dark" : "bg-gold text-wine-dark hover:bg-gold-light"
              }`}
            >
              <ScanLine className="w-4.5 h-4.5" />
              Scanner un client
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groupesNav.map((groupe) => (
            <div key={groupe.titre}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-light/60">{groupe.titre}</p>
              <div className="space-y-0.5">
                {groupe.items.map((item) => {
                  const Icon = item.icon
                  const actif = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => allerA(item.id)}
                      aria-current={actif ? "page" : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        actif ? "bg-ivory/12 text-ivory shadow-[inset_3px_0_0_#c9962c]" : "text-ivory/85 hover:bg-white/5 hover:text-ivory"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${actif ? "text-gold-light" : ""}`} />
                      {item.label}
                      {item.verrou && <Lock className="w-3.5 h-3.5 ml-auto opacity-60" aria-label="Plan Complet" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gold-light/15">
          {isAdmin && (
            <a
              href="/admin"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ivory/80 hover:bg-white/5 hover:text-ivory transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Espace admin
            </a>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push("/inscription")
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ivory/80 hover:bg-white/5 hover:text-ivory transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Barre d'onglets mobile : les 3 actions du quotidien + le menu complet */}
      {!compteVerrouille && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-wine/10 bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]" aria-label="Navigation rapide">
          <div className="grid grid-cols-4 items-end">
            {[
              { id: "accueil", label: "Accueil", icon: LayoutDashboard },
              { id: "scanner", label: "Scanner", icon: ScanLine, principal: true },
              { id: "clients", label: "Clients", icon: Users },
              { id: "menu-complet", label: "Plus", icon: Menu },
            ].map((o) => {
              const Icon = o.icon
              const actif = activeSection === o.id
              if (o.principal)
                return (
                  <button key={o.id} onClick={() => allerA(o.id)} className="flex flex-col items-center gap-1 pb-2 -mt-5">
                    <span className={`flex size-14 items-center justify-center rounded-full shadow-lg shadow-wine/30 ring-4 ring-ivory ${actif ? "bg-wine-dark text-gold-light" : "bg-wine text-gold-light"}`}>
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-[11px] font-semibold text-wine">{o.label}</span>
                  </button>
                )
              return (
                <button
                  key={o.id}
                  onClick={() => (o.id === "menu-complet" ? setSidebarOpen(true) : allerA(o.id))}
                  className={`flex flex-col items-center gap-1 py-2.5 ${actif ? "text-wine" : "text-ink/70"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{o.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <main className="md:ml-64 flex-1 min-w-0 p-4 sm:p-8 pt-18 md:pt-8 pb-28 md:pb-10 w-full">

        {activeSection === "accueil" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">Bonjour, {nomResto} 👋</h1>
              <p className="text-ink/75 mt-1">Voici où en est votre restaurant aujourd&apos;hui.</p>
            </div>

            {/* Mise en route : disparait une fois tout fait */}
            {(() => {
              const etapes = [
                { cle: "roue", titre: "Vérifiez votre roue", texte: "Lots, chances de gagner et rentabilité : tout est déjà réglé, jetez un œil.", fait: !!etapesFaites.roue, cta: "Voir ma roue", vers: "roue" },
                { cle: "google", titre: "Ajoutez votre lien d'avis Google", texte: "Pour que vos clients puissent vous laisser un avis en un clic.", fait: !!restaurant?.google_avis_url, cta: "Ajouter le lien", vers: "parametres" },
                { cle: "qr", titre: "Imprimez votre QR code ou un flyer", texte: "Posez-le sur vos tables, le comptoir ou l'addition.", fait: !!etapesFaites.qr || (restaurant?.scan_qr || 0) > 0, cta: "Imprimer", vers: "qrcode" },
                { cle: "client", titre: "Votre premier client joue", texte: "Dès qu'un client scanne et tourne la roue, il apparaît ici.", fait: clients.length > 0, cta: null, vers: null },
              ]
              const faites = etapes.filter((e) => e.fait).length
              if (faites === etapes.length) return null
              const prochaine = etapes.find((e) => !e.fait)
              return (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-wine to-wine-dark px-5 py-4">
                    <div>
                      <p className="font-display text-lg font-semibold text-ivory">Mise en route</p>
                      <p className="text-sm text-gold-light/90">{faites} étape{faites > 1 ? "s" : ""} sur {etapes.length} : encore {etapes.length - faites} et c&apos;est parti !</p>
                    </div>
                    <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${(faites / etapes.length) * 100}%` }} />
                    </div>
                  </div>
                  <ol className="divide-y divide-wine/8">
                    {etapes.map((e, i) => (
                      <li key={e.cle} className={`flex items-center gap-4 px-5 py-4 ${e === prochaine ? "bg-gold/8" : ""}`}>
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            e.fait ? "bg-sage text-white" : e === prochaine ? "bg-wine text-gold-light" : "bg-secondary text-ink/70"
                          }`}
                        >
                          {e.fait ? <Check className="size-4" /> : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${e.fait ? "text-ink/65 line-through" : "text-ink"}`}>{e.titre}</p>
                          {!e.fait && <p className="mt-0.5 text-xs text-ink/70">{e.texte}</p>}
                        </div>
                        {!e.fait && e.cta && e.vers && (
                          <button
                            onClick={() => allerA(e.vers!)}
                            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
                              e === prochaine ? "bg-wine text-gold-light hover:bg-wine-dark" : "text-wine hover:bg-wine/5"
                            }`}
                          >
                            {e.cta}
                          </button>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )
            })()}

            {/* Actions rapides */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {[
                { id: "scanner", titre: "Scanner un client", texte: "Valider une récompense ou un passage", icon: ScanLine, fort: true },
                { id: "clients", titre: "Mes clients", texte: `${clients.length} client${clients.length > 1 ? "s" : ""} et leurs récompenses`, icon: Users },
                { id: "roue", titre: "Ma roue", texte: "Lots, chances et rentabilité", icon: Sliders },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.id}
                    onClick={() => allerA(a.id)}
                    className={`group flex items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                      a.fort ? "border-wine bg-wine text-ivory hover:bg-wine-dark" : "border-wine/10 bg-card hover:border-wine/30"
                    }`}
                  >
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${a.fort ? "bg-gold text-wine-dark" : "bg-secondary text-wine"}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold ${a.fort ? "text-ivory" : "text-ink"}`}>{a.titre}</span>
                      <span className={`block text-xs ${a.fort ? "text-ivory/85" : "text-ink/70"}`}>{a.texte}</span>
                    </span>
                    <ArrowRight className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${a.fort ? "text-gold-light" : "text-ink/30"}`} />
                  </button>
                )
              })}
            </div>

            {/* Tutoriel video */}
            <div className="mb-8 grid items-center gap-5 rounded-2xl border border-wine/10 bg-card p-4 shadow-sm sm:p-5 md:grid-cols-[minmax(0,1.15fr)_1fr]">
              <VideoYoutube id="PYdBxJs02oQ" poster="/assets/video-tutoriel-poster.webp" titre="Tutoriel FidèleResto : prise en main" duree="1:44" sizes="(min-width: 768px) 520px, 100vw" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wine">Tutoriel vidéo</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">Prise en main en 2 minutes</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  Régler votre roue, ajouter votre lien Google, imprimer votre QR code et valider une récompense au comptoir : tout est montré pas à pas.
                </p>
              </div>
            </div>

            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Vos chiffres</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div key={kpi.label} className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-display font-semibold text-ink">{kpi.value}</p>
                    <p className="text-sm font-medium text-ink/85 mt-1">{kpi.label}</p>
                    <p className="text-xs text-ink/65 mt-0.5">{kpi.aide}</p>
                  </div>
                )
              })}
            </div>
            {clients.length === 0 ? null : (
              <div className="grid gap-4 lg:grid-cols-3 mb-8">
                <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                  <p className="text-sm font-medium text-ink mb-4">Clients collectés (14 derniers jours)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={clientsParJour}>
                      <XAxis dataKey="jour" tick={{ fontSize: 11, fill: "#241914aa" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#241914aa" }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #6b1e2e20", fontSize: 13 }} />
                      <Bar dataKey="clients" fill="#6b1e2e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                  <p className="text-sm font-medium text-ink mb-4">Gagnants et perdants</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={dataVictoire} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                        <Cell fill="#c9962c" />
                        <Cell fill="#e7d9c3" />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #6b1e2e20", fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-xs text-ink/75 -mt-2">
                    <span><span className="inline-block size-2 rounded-full bg-gold mr-1" />Gagné ({nbGagne})</span>
                    <span><span className="inline-block size-2 rounded-full bg-[#e7d9c3] mr-1" />Perdu ({nbPerdu})</span>
                  </div>
                </div>

                {dataRecompenses.length > 0 && (
                  <div className="lg:col-span-3 bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <p className="text-sm font-medium text-ink mb-4">Récompenses les plus données</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dataRecompenses} layout="vertical" margin={{ left: 10 }}>
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#241914aa" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="nom" width={140} tick={{ fontSize: 12, fill: "#241914" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #6b1e2e20", fontSize: 13 }} />
                        <Bar dataKey="count" fill="#3f6b4f" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {estPremiumStats && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="font-display font-semibold text-ink">Statistiques avancées</h2>
                  <span className="text-[11px] font-medium bg-gold/15 text-wine-dark px-2 py-0.5 rounded-full">Complet</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <p className="text-sm text-ink/70">Ce mois-ci vs mois dernier</p>
                    <p className={`text-2xl font-display font-semibold mt-1 ${evolutionMois >= 0 ? "text-sage" : "text-wine"}`}>
                      {evolutionMois >= 0 ? "+" : ""}{evolutionMois}%
                    </p>
                    <p className="text-xs text-ink/65 mt-1">{clientsMoisEnCours} passages ce mois ({clientsMoisPrecedent} le mois dernier)</p>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <p className="text-sm text-ink/70">Heure de pointe</p>
                    <p className="text-2xl font-display font-semibold text-ink mt-1">{heurePointe.passages > 0 ? heurePointe.heure : "—"}</p>
                    <p className="text-xs text-ink/65 mt-1">{heurePointe.passages > 0 ? `${heurePointe.passages} passages à cette heure` : "Pas encore de données"}</p>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <p className="text-sm text-ink/70">Jour le plus actif</p>
                    <p className="text-2xl font-display font-semibold text-ink mt-1">{jourPointe.passages > 0 ? jourPointe.jour : "—"}</p>
                    <p className="text-xs text-ink/65 mt-1">{jourPointe.passages > 0 ? `${jourPointe.passages} passages ce jour-là` : "Pas encore de données"}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <h3 className="text-sm font-medium text-ink/90 mb-3">Affluence par heure</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={parHeure.filter((_, i) => i >= 8 && i <= 23)}>
                        <XAxis dataKey="heure" fontSize={10} interval={1} />
                        <YAxis allowDecimals={false} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="passages" fill="#6b1e2e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-wine/10 shadow-sm">
                    <h3 className="text-sm font-medium text-ink/90 mb-3">Affluence par jour de la semaine</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={parJourSemaine}>
                        <XAxis dataKey="jour" fontSize={10} />
                        <YAxis allowDecimals={false} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="passages" fill="#c9962c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {activeSection === "qrcode" && (() => {
          const urlRoue = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://fideleresto-landing-page-9dhz.vercel.app").replace(/\/$/, "")}/r/${user?.id?.slice(0, 8)}`
          return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">QR code et flyers</h1>
              <p className="mt-1 max-w-2xl text-ink/80">
                Vos clients scannent ce QR code pour tourner la roue. Le plus simple : téléchargez un flyer prêt à poser
                sur vos tables, il contient déjà votre QR code.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
              {/* Flyer : le parcours recommande */}
              <div className="space-y-5">
                <EtapeNumerotee n={1} titre="Choisissez un modèle de flyer">
                  <div className="grid grid-cols-3 gap-3">
                    {MODELES_FLYER.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModele(m)}
                        className={`relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                          selectedModele?.id === m.id ? "border-wine shadow-md shadow-wine/15" : "border-transparent hover:border-wine/30"
                        }`}
                      >
                        <img src={m.fichierThumb} alt={m.nom} className="aspect-[3/4] w-full object-cover" />
                        <p className={`py-2 text-center text-xs font-medium ${selectedModele?.id === m.id ? "bg-wine text-gold-light" : "bg-secondary/40 text-ink/85"}`}>{m.nom}</p>
                        {selectedModele?.id === m.id && (
                          <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-wine text-gold-light shadow">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </EtapeNumerotee>

                <EtapeNumerotee n={2} titre="Votre nom ou votre logo">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFlyerAffichage("nom")}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                        flyerAffichage === "nom" ? "border-wine bg-wine/5 text-wine" : "border-wine/15 text-ink/80 hover:border-wine/30"
                      }`}
                    >
                      Nom du restaurant
                      <span className="mt-0.5 block truncate text-xs font-normal text-ink/70">{restaurant?.nom_restaurant || "—"}</span>
                    </button>
                    <button
                      onClick={() => restaurant?.logo_url && setFlyerAffichage("logo")}
                      disabled={!restaurant?.logo_url}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                        flyerAffichage === "logo" ? "border-wine bg-wine/5 text-wine" : "border-wine/15 text-ink/80 hover:border-wine/30"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Mon logo
                      <span className="mt-0.5 block text-xs font-normal text-ink/70">{restaurant?.logo_url ? "Ajouté" : "Aucun logo pour l'instant"}</span>
                    </button>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-wine/20 px-4 py-3 transition-colors hover:border-gold/60">
                    {restaurant?.logo_url ? (
                      <img src={restaurant.logo_url} alt="Logo" className="size-10 rounded object-contain" />
                    ) : (
                      <ImageIcon className="size-6 shrink-0 text-wine/60" />
                    )}
                    <span className="text-sm text-ink/85">
                      {uploadingLogo ? "Envoi en cours..." : restaurant?.logo_url ? "Changer mon logo" : "Ajouter mon logo (facultatif)"}
                      <span className="block text-xs text-ink/65">JPG, PNG ou WEBP</span>
                    </span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" disabled={uploadingLogo} onChange={handleLogoUpload} />
                  </label>
                  {logoUploadError && <p className="mt-3 text-sm text-wine">{logoUploadError}</p>}
                </EtapeNumerotee>

                <EtapeNumerotee n={3} titre="Téléchargez et imprimez">
                  <button
                    onClick={generateFlyer}
                    disabled={generatingFlyer || !selectedModele}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine py-3.5 text-base font-semibold text-gold-light shadow-lg shadow-wine/20 transition-colors hover:bg-wine-dark disabled:opacity-60"
                  >
                    <Download className="size-5" />
                    {generatingFlyer ? "Création du flyer..." : !selectedModele ? "Choisissez d'abord un modèle" : "Télécharger mon flyer (PDF)"}
                  </button>
                  <p className="mt-3 text-center text-sm text-ink/75">
                    Format A5, à imprimer chez vous ou chez un imprimeur. Votre QR code est déjà dessus.
                  </p>
                </EtapeNumerotee>
              </div>

              {/* QR code seul + conseils */}
              <div className="space-y-5 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm">
                  <h2 className="font-display text-lg font-semibold text-ink">Le QR code seul</h2>
                  <p className="mt-1 text-sm text-ink/75">Pour l'ajouter vous-même sur un menu, une addition ou une vitrine.</p>
                  <div className="my-4 flex justify-center rounded-xl border border-dashed border-wine/20 bg-ivory p-4">
                    <canvas id="qr-canvas" className="rounded-lg" />
                  </div>
                  <button
                    onClick={() => {
                      const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement
                      if (canvas) {
                        const link = document.createElement("a")
                        marquerEtape("qr")
                        link.download = "qrcode-fideleresto.png"
                        link.href = canvas.toDataURL()
                        link.click()
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-wine py-2.5 text-sm font-semibold text-wine transition-colors hover:bg-wine hover:text-gold-light"
                  >
                    <Download className="size-4" />
                    Télécharger le QR code (PNG)
                  </button>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(urlRoue); setLienCopie(true); setTimeout(() => setLienCopie(false), 2000) }}
                    className="mt-2 w-full rounded-xl py-2 text-sm text-ink/80 underline decoration-wine/30 underline-offset-4 hover:text-wine"
                  >
                    {lienCopie ? "Lien copié ✓" : "Copier le lien de ma roue"}
                  </button>
                </div>

                <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
                  <p className="font-display font-semibold text-ink">💡 Où le poser ?</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink/85">
                    <li>• Sur chaque table, bien en vue</li>
                    <li>• Au comptoir, à côté de la caisse</li>
                    <li>• Glissé avec l'addition ou le ticket</li>
                    <li>• Sur les sacs et boîtes à emporter</li>
                  </ul>
                  <p className="mt-3 text-sm text-ink/80">Et dites-le à voix haute : « Scannez, vous pouvez gagner un cadeau ! » Ça double les scans.</p>
                </div>
              </div>
            </div>
          </div>
          )
        })()}

        {activeSection === "clients" && (() => {
          const clientsRegroupes = regrouperParClient(clients)
          const terme = normaliserRecherche(rechercheClient)
          const ilYaUneSemaine = Date.now() - 7 * 86400000
          const filtres = {
            tous: { label: "Tous", test: () => true },
            a_utiliser: { label: "Récompense à utiliser", test: (c: typeof clientsRegroupes[number]) => c.aUtiliser > 0 },
            semaine: { label: "Venus cette semaine", test: (c: typeof clientsRegroupes[number]) => new Date(c.derniereVisite).getTime() >= ilYaUneSemaine },
            habitues: { label: "Habitués (3 visites et +)", test: (c: typeof clientsRegroupes[number]) => c.parties.length >= 3 },
          } as const
          const clientsFiltres = clientsRegroupes
            .filter(filtres[filtreClients].test)
            .filter(c => !terme || normaliserRecherche(c.prenom).includes(terme) || normaliserRecherche(c.email).includes(terme))
          const depuis = (d: string) => {
            const j = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
            return j <= 0 ? "aujourd'hui" : j === 1 ? "hier" : `il y a ${j} jours`
          }
          const clientDetail = clientSelectionne
            ? clientsRegroupes.find(c => c.email === clientSelectionne) || null
            : null

          const formatDate = (d: Date | string) =>
            new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          const formatDateHeure = (d: Date | string) =>
            new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })

          // ===== Page d'un client : historique de ses gains =====
          if (clientDetail) {
            const gagnees = clientDetail.parties.filter(p => p.a_gagne)
            const utilisees = gagnees.filter(p => statutRecompense(p).type === "utilisee")
            return (
              <div>
                <button
                  onClick={() => { setClientSelectionne(null); setMessageHistorique(null) }}
                  className="mb-6 flex items-center gap-1.5 text-sm text-wine font-medium hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux clients
                </button>

                <div className="mb-6 flex items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-wine font-display text-2xl font-semibold text-gold-light">
                    {(clientDetail.prenom || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-2xl font-display font-semibold text-ink">{clientDetail.prenom}</h1>
                    <p className="text-ink/75 break-all">{clientDetail.email}</p>
                  </div>
                </div>
                <div className="mb-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { n: clientDetail.parties.length, l: clientDetail.parties.length > 1 ? "visites" : "visite" },
                    { n: gagnees.length, l: gagnees.length > 1 ? "gains" : "gain" },
                    { n: utilisees.length, l: "utilisés" },
                    { n: clientDetail.aUtiliser, l: "à utiliser", fort: clientDetail.aUtiliser > 0 },
                  ].map((x) => (
                    <div key={x.l} className={`rounded-xl border px-4 py-3 ${x.fort ? "border-gold bg-gold/15" : "border-wine/10 bg-card"}`}>
                      <p className="font-display text-2xl font-semibold text-ink">{x.n}</p>
                      <p className="text-xs text-ink/70">{x.l}</p>
                    </div>
                  ))}
                </div>

                {messageHistorique && (
                  <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${messageHistorique.ok ? "bg-sage/10 text-sage" : "bg-wine/5 text-wine"}`}>
                    {messageHistorique.ok ? "✓ " : ""}{messageHistorique.texte}
                  </div>
                )}

                <div className="bg-card rounded-xl border border-wine/10 shadow-sm divide-y divide-wine/10 max-w-3xl">
                  {clientDetail.parties.map((partie) => {
                    const statut = statutRecompense(partie)
                    return (
                      <div key={partie.id} className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {statut.type === "perdu" ? "Pas de gain" : partie.recompense}
                          </p>
                          <p className="text-xs text-ink/70 mt-0.5">
                            Jouée le {formatDateHeure(partie.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {statut.type === "perdu" && (
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-ink/70">Perdu</span>
                          )}
                          {statut.type === "utilisee" && (
                            <span className="rounded-full bg-sage/15 px-2.5 py-1 text-xs font-medium text-sage text-right">
                              ✓ Validée{statut.le ? ` le ${formatDateHeure(statut.le)}` : ""}
                            </span>
                          )}
                          {statut.type === "expiree" && (
                            <span className="rounded-full bg-wine/10 px-2.5 py-1 text-xs font-medium text-wine">
                              Expirée le {formatDate(statut.depuis)}
                            </span>
                          )}
                          {statut.type === "a_utiliser" && (
                            <>
                              <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-medium text-wine-dark text-right">
                                À utiliser avant le {formatDate(statut.jusquau)}
                              </span>
                              <button
                                onClick={() => validerDepuisHistorique(partie.id)}
                                disabled={validationHistoriqueId === partie.id}
                                className="bg-wine hover:bg-wine-dark disabled:opacity-50 text-gold-light font-medium px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                              >
                                {validationHistoriqueId === partie.id ? "..." : "Valider"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-ink/65 mt-3 max-w-3xl">
                  Une récompense est valable {DUREE_VALIDITE_JOURS} jours après le gain et ne peut être validée qu&apos;une seule fois.
                </p>
              </div>
            )
          }

          // ===== Liste des clients avec recherche =====
          return (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">Mes clients</h1>
                <p className="text-ink/75 mt-1">Tous les clients qui ont joué à votre roue. Touchez un client pour voir ses gains et valider une récompense.</p>
              </div>

              {clients.length > 0 && (
                <>
                  <div className="mb-5 grid grid-cols-3 gap-3 max-w-2xl">
                    {[
                      { n: clientsRegroupes.length, l: "clients" },
                      { n: clientsRegroupes.filter(filtres.a_utiliser.test).length, l: "récompenses à utiliser" },
                      { n: clientsRegroupes.filter(filtres.semaine.test).length, l: "venus cette semaine" },
                    ].map((x) => (
                      <div key={x.l} className="rounded-xl border border-wine/10 bg-card px-4 py-3 shadow-sm">
                        <p className="font-display text-2xl font-semibold text-ink">{x.n}</p>
                        <p className="text-xs text-ink/70">{x.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/65" aria-hidden="true" />
                      <input
                        type="search"
                        value={rechercheClient}
                        onChange={e => setRechercheClient(e.target.value)}
                        placeholder="Prénom ou email"
                        className="w-full rounded-lg border border-wine/15 bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(filtres) as (keyof typeof filtres)[]).map((k) => (
                        <button
                          key={k}
                          onClick={() => setFiltreClients(k)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            filtreClients === k ? "bg-wine text-gold-light" : "border border-wine/15 bg-card text-ink/80 hover:border-wine/40"
                          }`}
                        >
                          {filtres[k].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

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
                    <p className="text-sm text-ink/75 max-w-sm">
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
                ) : clientsFiltres.length === 0 ? (
                  <p className="p-8 text-center text-sm text-ink/70">Aucun client ne correspond{rechercheClient ? <> à « {rechercheClient} »</> : " à ce filtre"}.</p>
                ) : (
                  <div className="divide-y divide-wine/10">
                    {clientsFiltres.map((c) => (
                      <button
                        key={c.email}
                        onClick={() => setClientSelectionne(c.email)}
                        className="flex w-full items-center justify-between gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wine/10 font-display text-base font-semibold text-wine">
                            {(c.prenom || c.email || "?").trim().charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{c.prenom}</p>
                            <p className="text-xs text-ink/70 truncate">
                              {c.parties.length} visite{c.parties.length > 1 ? "s" : ""} · dernière {depuis(c.derniereVisite)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {c.aUtiliser > 0 && (
                            <span className="rounded-full bg-gold/25 px-2.5 py-1 text-xs font-semibold text-wine-dark">
                              🎁 {c.aUtiliser} à utiliser
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-ink/30" aria-hidden="true" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {activeSection === "roue" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Ma roue</h1>
              <p className="text-ink/70 mt-1">Choisissez ce que vos clients peuvent gagner et leurs chances. L&apos;aperçu se met à jour en direct.</p>
            </div>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Apercu en direct, tel que le client le verra */}
            <aside className="order-first xl:order-last xl:sticky xl:top-6">
              <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm">
                <p className="mb-7 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Aperçu client</p>
                <div className="mx-auto max-w-[220px] sm:max-w-[300px]">
                  <RoueChance rewards={rewards.filter((r) => r.probabilite > 0 && r.label.trim())} rotation={0} spinning={false} />
                </div>
                <div className="hidden xl:block">
                  <LegendeLots rewards={rewards.filter((r) => r.label.trim())} />
                </div>
              </div>
            </aside>
            <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm min-w-0">
              <div className="mb-6 rounded-xl bg-gold/10 p-4">
                <p className="text-sm font-semibold text-ink">Partir d&apos;un modèle adapté à votre restaurant</p>
                <p className="mt-1 text-xs text-ink/70">Des réglages rentables prêts à l&apos;emploi, que vous pouvez ensuite modifier.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MODELES_ROUE.map((m) => (
                    <button
                      key={m.id}
                      title={modelePourTypeCuisine(user?.user_metadata?.type_cuisine)?.id === m.id ? "Recommandé pour votre type de cuisine" : undefined}
                      type="button"
                      onClick={() => {
                        setRewards(m.lots.map((l) => ({ ...l, max_par_jour: l.max_par_jour ?? null, garanti_apres_visites: l.garanti_apres_visites ?? null })))
                        afficherToast(`Modèle « ${m.nom} » appliqué. Ajustez si besoin puis sauvegardez.`)
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium hover:border-wine hover:text-wine ${
                        modelePourTypeCuisine(user?.user_metadata?.type_cuisine)?.id === m.id ? "border-gold bg-gold/20 text-wine-dark" : "border-wine/20 bg-card text-ink"
                      }`}
                    >
                      {m.nom}
                      {modelePourTypeCuisine(user?.user_metadata?.type_cuisine)?.id === m.id && <span className="ml-1.5 text-xs">★ pour vous</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 mb-6">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 p-4 bg-secondary/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: reward.couleur }} />
                      <input
                        type="text"
                        value={reward.label}
                        onChange={e => {
                          const updated = [...rewards]
                          updated[index].label = e.target.value
                          setRewards(updated)
                        }}
                        className="flex-1 min-w-0 border border-wine/15 bg-card rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 sm:w-40 sm:flex-none min-w-0">
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
                          className="flex-1 min-w-0 accent-wine"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          inputMode="decimal"
                          value={reward.probabilite}
                          onChange={e => {
                            const brut = Math.round(parseFloat(e.target.value) * 10) / 10
                            const clamp = isNaN(brut) ? 0 : Math.min(100, Math.max(0, brut))
                            const updated = [...rewards]
                            updated[index].probabilite = clamp
                            setRewards(updated)
                          }}
                          className="text-sm font-medium text-ink/80 w-14 text-right flex-shrink-0 bg-transparent border border-transparent rounded px-1 py-0.5 focus:border-wine/30 focus:outline-none focus:bg-card"
                        />
                        <span className="text-sm font-medium text-ink/80 flex-shrink-0">%</span>
                      </div>
                      <input
                        type="color"
                        value={reward.couleur}
                        onChange={e => {
                          const updated = [...rewards]
                          updated[index].couleur = e.target.value
                          setRewards(updated)
                        }}
                        className="w-8 h-8 rounded cursor-pointer border-0 flex-shrink-0"
                      />
                      {rewards.length > 2 && (
                        <button
                          onClick={() => setRewards(rewards.filter((_, i) => i !== index))}
                          className="text-wine/40 hover:text-wine text-xl font-bold flex-shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {!estPerdu(reward) && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:basis-full text-xs text-ink/75">
                        <label className="flex items-center gap-1.5">
                          Vous coûte
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            inputMode="decimal"
                            placeholder="0,50"
                            value={reward.cout ?? ""}
                            onChange={e => {
                              const updated = [...rewards]
                              updated[index] = { ...updated[index], cout: e.target.value === "" ? null : parseFloat(e.target.value) }
                              setRewards(updated)
                            }}
                            className="w-16 border border-wine/15 bg-card rounded-md px-2 py-1 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                          €
                        </label>
                        <label className="flex items-center gap-1.5">
                          Maximum
                          <input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            placeholder="illimité"
                            value={reward.max_par_jour ?? ""}
                            onChange={e => {
                              const updated = [...rewards]
                              updated[index] = { ...updated[index], max_par_jour: e.target.value === "" ? null : parseInt(e.target.value) }
                              setRewards(updated)
                            }}
                            className="w-20 border border-wine/15 bg-card rounded-md px-2 py-1 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                          par jour
                        </label>
                        <label className="flex items-center gap-1.5">
                          Offert à coup sûr tous les
                          <input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="numeric"
                            placeholder="—"
                            value={reward.garanti_apres_visites ?? ""}
                            onChange={e => {
                              const updated = [...rewards]
                              updated[index] = { ...updated[index], garanti_apres_visites: e.target.value === "" ? null : parseInt(e.target.value) }
                              setRewards(updated)
                            }}
                            className="w-16 border border-wine/15 bg-card rounded-md px-2 py-1 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                          passages
                        </label>
                      </div>
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
                    setRewards([...rewards, { label: newLabel, probabilite: 5, couleur: "#c9962c", cout: null, max_par_jour: null }])
                    setNewLabel("")
                  }}
                  className="bg-secondary hover:bg-secondary/70 text-ink font-medium px-4 py-2 rounded-lg text-sm"
                >
                  + Ajouter
                </button>
              </div>

              <div className="p-4 bg-secondary/40 rounded-lg mb-6">
                <label className="block text-sm font-medium text-ink/90 mb-2">
                  Un client peut retenter sa chance...
                </label>
                <select
                  value={roueFrequenceJours}
                  onChange={e => setRoueFrequenceJours(parseInt(e.target.value))}
                  className="w-full border border-wine/15 bg-card rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value={1}>Tous les jours</option>
                  <option value={2}>Tous les 2 jours</option>
                  <option value={3}>Tous les 3 jours</option>
                  <option value={7}>Toutes les semaines</option>
                  <option value={14}>Toutes les 2 semaines</option>
                  <option value={30}>Une fois par mois</option>
                </select>
                <p className="text-xs text-ink/65 mt-2">
                  Utile si vous préférez limiter le nombre de récompenses offertes chaque jour.
                </p>
              </div>

              {/* Calculateur de rentabilite */}
              {(() => {
                const v = verdict(rewards, panierMoyen)
                const cout = coutParPartie(rewards)
                const parJour = cout * partiesJour
                const maxJour = coutMaxParJour(rewards)
                const couleurs = {
                  rentable: "border-sage/40 bg-sage/10 text-sage",
                  surveiller: "border-gold/50 bg-gold/10 text-[#8a6213]",
                  risque: "border-wine/40 bg-wine/8 text-wine",
                  inconnu: "border-wine/10 bg-secondary/40 text-ink/75",
                }[v.niveau]
                const titre = {
                  rentable: "✓ Roue rentable",
                  surveiller: "⚠ À surveiller",
                  risque: "✕ Roue trop généreuse : vous risquez de perdre de l'argent",
                  inconnu: "Indiquez ce que coûte chaque lot pour voir la rentabilité",
                }[v.niveau]
                const fmt = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: n < 10 ? 2 : 0 })
                return (
                  <div className="mb-6 rounded-xl border border-wine/10 p-4">
                    <p className="text-sm font-semibold text-ink">Rentabilité de ma roue</p>
                    <p className="mt-1 text-xs text-ink/70">
                      « Vous coûte » = ce que le lot vous coûte vraiment (prix d&apos;achat), pas son prix de vente. Une boisson vendue 2,50 € vous coûte souvent autour de 0,50 €.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="text-xs text-ink/75">
                        Panier moyen d&apos;un client
                        <div className="mt-1 flex items-center gap-1.5">
                          <input type="number" min={1} step="0.5" value={panierMoyen} onChange={e => setPanierMoyen(parseFloat(e.target.value) || 0)} className="w-full border border-wine/15 bg-card rounded-md px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold" />€
                        </div>
                      </label>
                      <label className="text-xs text-ink/75">
                        Parties estimées par jour
                        <input type="number" min={0} step="1" value={partiesJour} onChange={e => setPartiesJour(parseInt(e.target.value) || 0)} className="mt-1 w-full border border-wine/15 bg-card rounded-md px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold" />
                      </label>
                    </div>
                    <div className={`mt-4 rounded-lg border p-3 ${couleurs}`}>
                      <p className="text-sm font-semibold">{titre}</p>
                      <ul className="mt-2 space-y-1 text-sm text-ink/90">
                        <li>🎯 <strong>{unClientSur(rewards)}</strong> gagne quelque chose ({tauxGain(rewards)} %)</li>
                        {v.niveau !== "inconnu" && (
                          <>
                            <li>💶 Coût moyen par partie : <strong>{fmt(cout)}</strong>, soit <strong>{v.pourcent.toFixed(1).replace(".", ",")} %</strong> du panier moyen (conseillé : moins de {SEUIL_RENTABLE} %)</li>
                            <li>📅 Pour {partiesJour} parties par jour : environ <strong>{fmt(parJour)} / jour</strong>, soit {fmt(parJour * 30)} / mois</li>
                            {maxJour !== null && <li>🛡️ Grâce à vos maximums par jour, la roue ne vous coûtera jamais plus de <strong>{fmt(maxJour)} / jour</strong></li>}
                          </>
                        )}
                      </ul>
                      {(v.niveau === "risque" || v.niveau === "surveiller") && (
                        <button
                          type="button"
                          onClick={() => {
                            setRewards(ajusterPourRentabilite(rewards, panierMoyen))
                            afficherToast(`Chances ajustées pour viser ${CIBLE_AJUSTEMENT} % du panier moyen. Pensez à sauvegarder.`)
                          }}
                          className="mt-3 w-full rounded-lg bg-wine px-4 py-2 text-sm font-medium text-gold-light hover:bg-wine-dark"
                        >
                          Rendre ma roue rentable automatiquement
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-ink/65">
                      Au-delà de {SEUIL_RISQUE} % du panier moyen, la roue devient risquée. Astuce : un « maximum par jour » sur les lots les plus chers vous protège même les jours de grosse affluence.
                    </p>
                  </div>
                )
              })()}

              <div className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg mb-6">
                <span className="text-sm text-ink/75">Total des probabilités :</span>
                <span className={`text-sm font-bold ${totalOk ? "text-sage" : "text-wine"}`}>
                  {totalProba.toLocaleString("fr-FR")}% {totalOk ? "✓" : "(doit être égal à 100%)"}
                </span>
              </div>

              <button
                onClick={saveRewards}
                disabled={saving || !totalOk}
                className="w-full bg-wine hover:bg-wine-dark disabled:opacity-50 text-gold-light font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder ma roue"}
              </button>
            </div>
            </div>
          </div>
        )}

        {!estComplet && ["menu", "fidelite", "relance"].includes(activeSection) && (
          <div className="max-w-xl mx-auto mt-10 bg-card rounded-xl border border-wine/10 shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gold/15 text-wine flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-semibold text-ink">Inclus dans le plan Complet</h1>
            <p className="text-ink/75 mt-2">
              {activeSection === "menu" && "Le menu digital est réservé au plan Complet."}
              {activeSection === "fidelite" && "La carte de fidélité digitale est réservée au plan Complet."}
              {activeSection === "relance" && "Les emails de relance automatiques sont réservés au plan Complet."}
            </p>
            <button
              onClick={() => setActiveSection("abonnement")}
              className="mt-6 inline-flex items-center gap-2 bg-wine text-ivory px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-wine-dark transition-colors"
            >
              Voir les plans <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeSection === "menu" && estComplet && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Menu digital</h1>
              <p className="mt-1 max-w-2xl text-ink/80">
                Envoyez votre menu une seule fois : vos clients le consultent depuis leur téléphone, juste sous leur carte
                de fidélité. Pas besoin de le refaire, une photo de votre menu papier suffit.
              </p>
            </div>

            <div className="max-w-2xl space-y-5">
              <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 p-5 ${restaurant?.menu_type ? "border-sage/50 bg-sage/10" : "border-wine/10 bg-card"}`}>
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {restaurant?.menu_type ? <>Votre menu est en ligne <span className="text-sage">✓</span></> : "Aucun menu pour l'instant"}
                  </p>
                  <p className="text-sm text-ink/80">
                    {restaurant?.menu_type ? <>Fichier actuel : <span className="uppercase">{restaurant.menu_type}</span>. Pour le changer, envoyez-en un nouveau ci-dessous.</> : "Vos clients verront un bouton « Voir le menu » dès que vous l'aurez ajouté."}
                  </p>
                </div>
                {restaurant?.menu_url && (
                  <a href={restaurant.menu_url} target="_blank" rel="noreferrer" className="rounded-xl border-2 border-wine px-4 py-2 text-sm font-semibold text-wine hover:bg-wine hover:text-gold-light">
                    Voir mon menu
                  </a>
                )}
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-wine/25 bg-card px-4 py-12 text-center transition-colors hover:border-gold hover:bg-gold/5">
                <span className="flex size-14 items-center justify-center rounded-full bg-wine/10">
                  <BookOpen className="size-7 text-wine" />
                </span>
                <p className="mt-1 font-display text-lg font-semibold text-ink">
                  {uploadingMenu ? "Envoi en cours..." : restaurant?.menu_type ? "Remplacer mon menu" : "Ajouter mon menu"}
                </p>
                <p className="text-sm text-ink/75">Cliquez ici et choisissez le fichier, ou prenez votre menu en photo</p>
                <p className="text-xs text-ink/70">PDF, JPG, PNG, Word (.docx) ou Excel (.xlsx)</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.xls"
                  className="hidden"
                  disabled={uploadingMenu}
                  onChange={handleMenuUpload}
                />
              </label>

              {menuUploadError && <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine">{menuUploadError}</p>}
              {menuUploadSuccess && <p className="rounded-xl bg-sage/15 px-4 py-3 text-sm font-medium text-sage">✓ Menu importé ! Vos clients le voient déjà.</p>}

              <p className="rounded-xl bg-gold/10 px-4 py-3 text-sm text-ink/85">
                💡 Une photo nette, prise à la lumière du jour et bien droite, suffit. Si votre menu fait plusieurs pages, un PDF est plus pratique.
              </p>
            </div>
          </div>
        )}

        {activeSection === "scanner" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">Scanner un client</h1>
              <p className="text-ink/75 mt-1">
                Le client vous montre son QR code : celui de l&apos;email de sa récompense
                {estComplet ? ", ou celui de sa carte de fidélité" : ""}.
              </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4 min-w-0">
                {/* Resultat d'une recompense de roue : tres visible, lisible de loin au comptoir */}
                {recompenseScanResult && (
                  recompenseScanResult.success ? (
                    <div className="rounded-2xl bg-sage p-6 text-white shadow-lg shadow-sage/20">
                      <div className="flex items-center gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20">
                          <Check className="size-8" strokeWidth={3} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-2xl font-semibold">Récompense validée !</p>
                          <p className="mt-0.5 text-white/90">
                            <span className="font-semibold">{recompenseScanResult.prenom}</span> : {recompenseScanResult.recompense}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-white/85">Vous pouvez lui offrir sa récompense. Elle ne pourra plus être réutilisée.</p>
                      <button
                        onClick={() => { setRecompenseScanResult(null); setClientTrouve(null); demarrerScan() }}
                        className="mt-5 w-full rounded-xl bg-white py-3 text-sm font-semibold text-sage hover:bg-white/90"
                      >
                        Scanner un autre client
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-wine/30 bg-wine/5 p-6">
                      <div className="flex items-center gap-4">
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-wine text-gold-light">
                          <X className="size-8" strokeWidth={3} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-xl font-semibold text-wine">Récompense refusée</p>
                          <p className="mt-0.5 text-ink/85">{recompenseScanResult.error}</p>
                          {recompenseScanResult.prenom && (
                            <p className="mt-1 text-sm text-ink/70">{recompenseScanResult.prenom} : {recompenseScanResult.recompense}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => { setRecompenseScanResult(null); demarrerScan() }}
                        className="mt-5 w-full rounded-xl bg-wine py-3 text-sm font-semibold text-gold-light hover:bg-wine-dark"
                      >
                        Scanner à nouveau
                      </button>
                    </div>
                  )
                )}

                {/* Carte de fidelite trouvee : ajouter un tampon */}
                {clientTrouve && (
                  <div className="rounded-2xl border border-gold/40 bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">Carte de fidélité</p>
                    <p className="mt-1 font-display text-xl font-semibold text-ink break-all">{clientTrouve.prenom || clientTrouve.email}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex flex-1 gap-1" aria-hidden="true">
                        {Array.from({ length: tamponsRequis }).map((_, i) => (
                          <span key={i} className={`h-2.5 flex-1 rounded-full ${i < clientTrouve.tampons ? "bg-wine" : "bg-wine/10"}`} />
                        ))}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-wine">{clientTrouve.tampons} / {tamponsRequis}</span>
                    </div>
                    <label className="mt-5 block text-sm font-medium text-ink/85">Montant de l&apos;addition</label>
                    <div className="mt-1.5 flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="0,00"
                          value={montantPassage}
                          onChange={e => setMontantPassage(e.target.value)}
                          className="w-full rounded-xl border border-wine/20 px-4 py-3 pr-9 text-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/65">€</span>
                      </div>
                      <button
                        onClick={validerPassage}
                        disabled={validationLoading}
                        className="shrink-0 rounded-xl bg-wine px-5 text-sm font-semibold text-gold-light hover:bg-wine-dark disabled:opacity-60"
                      >
                        {validationLoading ? "..." : "Ajouter un tampon"}
                      </button>
                    </div>
                    {validationMessage && <p className="mt-3 rounded-lg bg-sage/10 px-3 py-2 text-sm font-medium text-sage">{validationMessage}</p>}
                    <button
                      onClick={() => { setClientTrouve(null); setValidationMessage(""); demarrerScan() }}
                      className="mt-4 w-full text-sm font-medium text-wine hover:underline"
                    >
                      Scanner un autre client
                    </button>
                  </div>
                )}

                {/* Camera */}
                <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm sm:p-6">
                  {scanning ? (
                    <div>
                      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-ink">
                        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                        <div className="pointer-events-none absolute inset-[12%]">
                          {["left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl"].map((c) => (
                            <span key={c} className={`absolute size-12 border-gold ${c}`} />
                          ))}
                          <span className="fr-ligne-scan absolute inset-x-2 h-1 rounded-full bg-gold shadow-[0_0_16px_4px_rgba(235,198,119,0.8)]" />
                        </div>
                        <p className="absolute inset-x-0 bottom-3 text-center text-sm font-medium text-ivory/90">Placez le QR code dans le cadre</p>
                      </div>
                      <canvas ref={scanCanvasRef} className="hidden" />
                      <button onClick={arreterScan} className="mt-4 w-full rounded-xl border border-wine/20 py-3 text-sm font-medium text-ink/85 hover:bg-secondary/50">
                        Fermer la caméra
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-wine/15 px-4 py-8 text-center">
                      <span className="flex size-16 items-center justify-center rounded-2xl bg-wine/8 text-wine">
                        <ScanLine className="size-8" />
                      </span>
                      <p className="mt-4 font-display text-lg font-semibold text-ink">Scannez le QR code du client</p>
                      <p className="mt-1 max-w-sm text-sm text-ink/75">
                        {estComplet ? "Récompense de la roue ou carte de fidélité : le bon écran s'ouvre tout seul." : "Celui de l'email de récompense reçu après la roue."}
                      </p>
                      <button
                        onClick={() => { setRecompenseScanResult(null); setClientTrouve(null); demarrerScan() }}
                        className="mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-wine py-4 text-base font-semibold text-gold-light shadow-lg shadow-wine/20 hover:bg-wine-dark"
                      >
                        <ScanLine className="size-5" />
                        Ouvrir la caméra
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sans QR code : recherche par email */}
              <aside className="space-y-4">
                <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm">
                  <p className="font-display text-base font-semibold text-ink">Le client n&apos;a pas son QR code ?</p>
                  <p className="mt-1 text-sm text-ink/75">Retrouvez-le avec son adresse email.</p>

                  <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Récompense de la roue</label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="email"
                      placeholder="email@client.fr"
                      value={rechercheRecompenseEmail}
                      onChange={e => setRechercheRecompenseEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") rechercherRecompense() }}
                      className="min-w-0 flex-1 rounded-lg border border-wine/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <button onClick={rechercherRecompense} disabled={rechercheRecompenseLoading} className="shrink-0 rounded-lg bg-secondary px-3 text-ink hover:bg-secondary/70" aria-label="Rechercher la récompense">
                      <Search className="size-4" />
                    </button>
                  </div>
                  {rechercheRecompenseError && <p className="mt-2 text-sm text-wine">{rechercheRecompenseError}</p>}
                  {recompensesTrouvees.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {recompensesTrouvees.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{r.recompense}</p>
                            <p className="text-xs text-ink/70">
                              Gagnée le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                              {r.recompense_utilisee && " · déjà utilisée"}
                            </p>
                          </div>
                          <button
                            onClick={() => validerRecompenseParId(r.id)}
                            disabled={r.recompense_utilisee}
                            className="shrink-0 rounded-lg bg-wine px-3 py-1.5 text-xs font-semibold text-gold-light hover:bg-wine-dark disabled:opacity-40"
                          >
                            Valider
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {estComplet && (
                    <>
                      <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Carte de fidélité</label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          type="email"
                          placeholder="email@client.fr"
                          value={rechercheEmail}
                          onChange={e => setRechercheEmail(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") rechercherClient() }}
                          className="min-w-0 flex-1 rounded-lg border border-wine/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <button onClick={rechercherClient} disabled={rechercheLoading} className="shrink-0 rounded-lg bg-secondary px-3 text-ink hover:bg-secondary/70" aria-label="Rechercher la carte">
                          <Search className="size-4" />
                        </button>
                      </div>
                      {rechercheError && <p className="mt-2 text-sm text-wine">{rechercheError}</p>}
                    </>
                  )}
                </div>

                <div className="rounded-2xl bg-gold/12 p-5 text-sm text-ink/85">
                  <p className="font-semibold text-ink">💡 Bon à savoir</p>
                  <ul className="mt-2 space-y-1.5">
                    <li>Le QR code de la récompense est dans l&apos;email reçu par le client (pensez à ses spams).</li>
                    <li>Une récompense est valable {DUREE_VALIDITE_JOURS} jours et ne peut être utilisée qu&apos;une fois.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        )}

        {activeSection === "fidelite" && estComplet && (() => {
          const tries = [...clientsFidelite].sort((a, b) => (b.tampons || 0) - (a.tampons || 0))
          return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Carte de fidélité</h1>
              <p className="mt-1 max-w-2xl text-ink/80">
                Chaque visite = un tampon sur la carte du client, dans son téléphone. Quand la carte est pleine, il reçoit
                la récompense que vous choisissez ici. Pour ajouter un tampon, utilisez le bouton « Scanner un client ».
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <div className="space-y-5">
                <EtapeNumerotee n={1} titre="Combien de visites pour la récompense ?">
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={6}
                      max={15}
                      value={tamponsRequis}
                      onChange={e => setTamponsRequis(parseInt(e.target.value))}
                      className="h-2 flex-1 accent-wine"
                      aria-label="Nombre de tampons requis"
                    />
                    <span className="w-24 shrink-0 rounded-xl bg-wine px-3 py-2 text-center font-display text-lg font-semibold text-gold-light">{tamponsRequis} visites</span>
                  </div>
                  <p className="mt-3 rounded-lg bg-ivory px-3 py-2 text-sm text-ink/80">
                    💡 <strong>8 à 10 visites</strong> marche bien : assez proche pour motiver, assez loin pour rester rentable.
                  </p>
                </EtapeNumerotee>

                <EtapeNumerotee n={2} titre="Quelle récompense quand la carte est pleine ?">
                  <input
                    type="text"
                    value={recompenseFidelite}
                    onChange={e => setRecompenseFidelite(e.target.value)}
                    placeholder="Ex : Un menu offert"
                    className="w-full rounded-xl border border-wine/20 px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Un menu offert", "Un plat offert", "Une pizza offerte", "-50 % sur l'addition"].map((idee) => (
                      <button key={idee} onClick={() => setRecompenseFidelite(idee)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${recompenseFidelite === idee ? "border-wine bg-wine text-gold-light" : "border-wine/20 text-ink/85 hover:border-wine/50"}`}>
                        {idee}
                      </button>
                    ))}
                  </div>
                </EtapeNumerotee>

                <EtapeNumerotee n={3} titre="À partir de combien d'euros on donne un tampon ?">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={montantMin}
                      onChange={e => setMontantMin(parseFloat(e.target.value))}
                      className="w-28 rounded-xl border border-wine/20 px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                      aria-label="Montant minimum en euros"
                    />
                    <span className="text-base text-ink/85">€ dépensés minimum</span>
                  </div>
                  <p className="mt-3 rounded-lg bg-ivory px-3 py-2 text-sm text-ink/80">
                    💡 Évite qu&apos;un client prenne un tampon pour une simple canette. Mettez à peu près le prix d&apos;un menu.
                  </p>
                </EtapeNumerotee>

                <button
                  onClick={saveFideliteConfig}
                  disabled={savingFidelite}
                  className="w-full rounded-xl bg-wine px-8 py-3.5 text-base font-semibold text-gold-light shadow-lg shadow-wine/20 transition-colors hover:bg-wine-dark disabled:opacity-60 sm:w-auto"
                >
                  {savingFidelite ? "Enregistrement..." : "Enregistrer ma carte"}
                </button>
              </div>

              <div className="space-y-4 lg:sticky lg:top-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-ink/75">Ce que voit votre client</p>
                <div className="mx-auto max-w-[340px]">
                  <CarteFideliteVisuelle
                    nomRestaurant={restaurant?.nom_restaurant || "Votre restaurant"}
                    tampons={Math.min(3, tamponsRequis)}
                    requis={tamponsRequis}
                    recompense={recompenseFidelite || "Votre récompense"}
                  />
                </div>
                <button
                  onClick={() => allerA("scanner")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-base font-semibold text-wine-dark shadow transition-colors hover:bg-gold-light"
                >
                  <ScanLine className="size-5" />
                  Ajouter un tampon à un client
                </button>
              </div>
            </div>

            {/* Clients et progression */}
            <div className="mt-8 rounded-2xl border border-wine/10 bg-card p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-semibold text-ink">
                Cartes de vos clients <span className="text-ink/70">({clientsFidelite.length})</span>
              </h2>
              {chargementClientsFidelite ? (
                <p className="mt-3 text-sm text-ink/75">Chargement...</p>
              ) : clientsFidelite.length === 0 ? (
                <p className="mt-3 text-sm text-ink/75">
                  Aucun client n&apos;a encore de carte. Elle se crée toute seule quand un client joue à la roue puis ouvre sa carte.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-wine/10">
                  {tries.map((c) => {
                    const pct = Math.min(100, Math.round(((c.tampons || 0) / tamponsRequis) * 100))
                    const reste = Math.max(0, tamponsRequis - (c.tampons || 0))
                    return (
                      <li key={c.client_id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wine/10 font-display font-semibold text-wine">
                          {(c.prenom || "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-[120px] flex-1">
                          <p className="font-medium text-ink">{c.prenom || "Client anonyme"}</p>
                          <div className="mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-wine/10">
                            <div className={`h-full rounded-full ${reste === 0 ? "bg-gold" : "bg-wine"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <p className="font-display text-lg font-semibold text-ink">{c.tampons || 0}<span className="text-sm text-ink/70"> / {tamponsRequis}</span></p>
                        {reste === 0 ? (
                          <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-semibold text-wine">🎁 Récompense à donner</span>
                        ) : reste <= 2 ? (
                          <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage">Plus que {reste}</span>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
          )
        })()}

        {activeSection === "retours" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Retours clients</h1>
              <p className="mt-1 max-w-2xl text-ink/80">
                Les messages que vos clients déçus vous ont écrits en privé. Répondez-leur vite : un client à qui l&apos;on
                répond revient souvent. Vous recevez aussi chaque retour par email.
              </p>
            </div>

            {loadingAvisPrives ? (
              <p className="text-sm text-ink/75">Chargement...</p>
            ) : avisPrives.length === 0 ? (
              <div className="max-w-lg rounded-2xl border border-wine/10 bg-card p-8 text-center shadow-sm">
                <div className="mb-3 text-4xl">📭</div>
                <p className="font-display text-lg font-semibold text-ink">Aucun retour pour le moment</p>
                <p className="mt-1 text-sm text-ink/80">C&apos;est plutôt bon signe ! Les messages privés de vos clients apparaîtront ici.</p>
              </div>
            ) : (
              <div className="max-w-2xl space-y-3">
                {avisPrives.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wine/10 font-display font-semibold text-wine">
                          {(a.prenom || "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-ink">{a.prenom || "Client"}</p>
                          <p className="text-sm text-ink/75">
                            <span className="text-gold">{"★".repeat(a.note)}</span><span className="text-ink/25">{"★".repeat(Math.max(0, 5 - a.note))}</span>
                            {" · "}{new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSupprimerAvisPrive(a.id)}
                        className="rounded-lg p-2 text-ink/65 transition-colors hover:bg-wine/10 hover:text-wine"
                        aria-label="Supprimer ce retour"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {a.commentaire && (
                      <p className="mt-3 rounded-xl bg-ivory px-4 py-3 text-base leading-relaxed text-ink">{a.commentaire}</p>
                    )}
                    {a.email && (
                      <a
                        href={`mailto:${a.email}?subject=${encodeURIComponent(`Votre passage chez ${restaurant?.nom_restaurant || "nous"}`)}`}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-wine px-4 py-2 text-sm font-semibold text-wine transition-colors hover:bg-wine hover:text-gold-light"
                      >
                        <Mail className="size-4" />
                        Répondre à {a.prenom || "ce client"}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "abonnement" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Abonnement</h1>
              <p className="text-ink/70 mt-1">Choisissez le plan adapté à votre restaurant</p>
            </div>

            {compteVerrouille && (
              <div className="mb-6 max-w-2xl rounded-lg border border-wine/20 bg-wine/5 px-4 py-3 text-sm text-wine">
                {restaurant?.stripe_subscription_id
                  ? <>Votre abonnement est terminé, l&apos;accès aux fonctionnalités (roue, clients, flyer...) est suspendu. Choisissez un plan ci-dessous pour tout réactiver immédiatement.</>
                  : <>Bienvenue sur FidèleResto ! Choisissez un plan ci-dessous pour activer votre compte et accéder à toutes les fonctionnalités.</>
                }
              </div>
            )}

            {abonnementMessage && (
              <div className="mb-6 max-w-2xl rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-wine-dark">
                {abonnementMessage}
              </div>
            )}

            {restaurant?.plan && (
              <div className="mb-6 max-w-2xl flex items-center justify-between rounded-xl border border-wine/10 bg-card px-5 py-4 shadow-sm">
                <div>
                  <p className="text-sm text-ink/70">Votre plan actuel</p>
                  <p className="font-display text-lg font-semibold text-ink">{restaurant.plan === "standard" ? "Complet" : restaurant.plan === "essentiel" ? "Essentiel" : restaurant.plan}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  restaurant.statut_abonnement === "actif" ? "bg-sage/12 text-sage" :
                  restaurant.statut_abonnement === "essai" ? "bg-gold/15 text-wine-dark" :
                  restaurant.statut_abonnement === "impaye" ? "bg-wine/10 text-wine" :
                  "bg-secondary text-ink/70"
                }`}>
                  {restaurant.statut_abonnement === "actif" ? "Actif" :
                   restaurant.statut_abonnement === "essai" ? "Essai gratuit en cours" :
                   restaurant.statut_abonnement === "impaye" ? "Paiement en échec" :
                   "Annulé"}
                </span>
              </div>
            )}

            {restaurant?.plan && ["actif", "essai"].includes(restaurant?.statut_abonnement) && (
              <div className="mb-8 max-w-2xl rounded-xl border border-wine/10 bg-card px-5 py-4 shadow-sm">
                {restaurant?.resiliation_prevue ? (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-ink/80">
                      Résiliation programmée{restaurant?.fin_periode_actuelle && (
                        <> — actif jusqu&apos;au {new Date(restaurant.fin_periode_actuelle).toLocaleDateString("fr-FR")}</>
                      )}
                    </p>
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={cancelling}
                      className="text-sm font-medium text-wine hover:underline disabled:opacity-50 whitespace-nowrap"
                    >
                      Annuler la résiliation
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-ink/70">Vous pouvez résilier à tout moment, sans engagement.</p>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="text-sm font-medium text-wine hover:underline disabled:opacity-50 whitespace-nowrap"
                    >
                      {cancelling ? "..." : "Résilier mon abonnement"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bascule mensuel / annuel */}
            <div className="mb-8 inline-flex items-center rounded-full border border-wine/15 bg-card p-1">
              <button
                onClick={() => setBillingPeriod("mensuel")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "mensuel" ? "bg-wine text-gold-light" : "text-ink/75"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("semestriel")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "semestriel" ? "bg-wine text-gold-light" : "text-ink/75"
                }`}
              >
                Semestriel <span className="opacity-75">(-10%)</span>
              </button>
              <button
                onClick={() => setBillingPeriod("annuel")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "annuel" ? "bg-wine text-gold-light" : "text-ink/75"
                }`}
              >
                Annuel <span className="opacity-75">(-20%)</span>
              </button>
            </div>


            <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
              {plans.map((offre) => {
                const { periode: periodeEffective, prix: prixAffiche, barre: prixBarre, total: totalPeriode } = prixPour(offre, billingPeriod)
                const planKey = `${offre.key}_${periodeEffective}`
                const estPlanActuel = restaurant?.plan === offre.key && ["actif", "essai"].includes(restaurant?.statut_abonnement)
                return (
                  <div
                    key={offre.key}
                    className={`relative rounded-2xl border bg-card p-6 shadow-sm ${
                      offre.highlight ? "border-gold/50" : "border-wine/10"
                    }`}
                  >
                    {offre.highlight && (
                      <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-wine-dark">
                        Le plus complet
                      </span>
                    )}
                    <h3 className="font-display text-xl font-semibold text-ink">{offre.nom}</h3>
                    <div className="mt-2 flex items-end gap-1.5">
                      {prixBarre && (
                        <span className="mb-1 text-lg text-ink/65 line-through">{prixBarre}€</span>
                      )}
                      <span className="font-display text-3xl font-semibold text-wine">
                        {prixAffiche}€
                      </span>
                      <span className="text-sm text-ink/70 mb-1">/mois</span>
                    </div>
                    {prixBarre && (
                      <p className="mt-1 text-xs font-semibold text-gold-light bg-wine inline-block px-2 py-0.5 rounded-full">
                        Offre de lancement
                      </p>
                    )}
                    {totalPeriode && (
                      <p className="mt-1 text-sm text-ink/75">
                        soit {totalPeriode}€ facturés {
                          periodeEffective === "semestriel" ? "tous les 6 mois" :
                          "1x/an"
                        }
                      </p>
                    )}
                    {!offre.periodesDisponibles && (
                      <p className="mt-1 text-xs text-ink/65">Facturation mensuelle uniquement</p>
                    )}
                    {offre.essaiGratuit && (
                      <p className="mt-2 inline-flex items-center rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-wine-dark">
                        14 jours d&apos;essai gratuit
                      </p>
                    )}
                    <ul className="mt-5 space-y-2.5">
                      {offre.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-ink/85">
                          <Check className="size-4 mt-0.5 text-sage flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {!estPlanActuel && (
                      <div className="mt-4 space-y-2">
                        <label className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 text-sm text-ink/85 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={avecCreationSite}
                            onChange={(e) => setAvecCreationSite(e.target.checked)}
                            className="mt-0.5 accent-wine"
                          />
                          <span>
                            Je n&apos;ai pas encore de site, créez-moi en un
                            <span className="block text-xs text-ink/70">
                              {OPTION_SITE.offreLancementActive && <span className="line-through mr-1">{OPTION_SITE.fraisUniquesBarre}€</span>}
                              <span className="font-semibold text-wine">{OPTION_SITE.fraisUniques}€</span> de frais uniques
                              {OPTION_SITE.offreLancementActive && " (offre de lancement)"}, puis{" "}
                              {libelleMaintenanceSite(periodeEffective)} de maintenance
                            </span>
                          </span>
                        </label>
                      </div>
                    )}

                    <button
                      onClick={() => handleSubscribe(planKey)}
                      disabled={estPlanActuel || subscribing !== null}
                      className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                        offre.highlight
                          ? "bg-wine text-gold-light hover:bg-wine-dark"
                          : "bg-secondary text-ink hover:bg-secondary/70"
                      }`}
                    >
                      {estPlanActuel ? "Plan actuel" : subscribing === planKey ? "Redirection..." : "Choisir ce plan"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeSection === "relance" && estComplet && (() => {
          // Meme logique que le cron : dernier passage par email
          const derniers = new Map<string, any>()
          for (const c of clients) if (c.email && !derniers.has(c.email)) derniers.set(c.email, c)
          const seuil = Date.now() - (relanceJours || 10) * 86400000
          const liste = [...derniers.values()]
          const abonnes = liste.filter((c) => c.consentement_marketing).length
          const aRelancer = liste.filter((c) => c.consentement_marketing && !c.relance_envoyee && new Date(c.created_at).getTime() <= seuil).length
          const dejaRelances = liste.filter((c) => c.relance_envoyee).length
          const coutRelance = ((panierMoyen || 15) * (relancePourcentage || 0)) / 100
          const Puce = ({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) => (
            <button onClick={onClick} className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${actif ? "border-wine bg-wine text-gold-light" : "border-wine/15 bg-card text-ink/85 hover:border-wine/40"}`}>{children}</button>
          )
          return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Relances email</h1>
              <p className="mt-1 max-w-2xl text-ink/80">
                Quand un client n&apos;est pas revenu depuis un moment, FidèleResto lui envoie tout seul un email avec une
                petite réduction pour le faire revenir. Vous réglez une fois, ensuite vous n&apos;avez plus rien à faire.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <div className="space-y-5">
                {/* Interrupteur principal */}
                <div className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-5 sm:p-6 ${relanceActive ? "border-sage/50 bg-sage/10" : "border-wine/10 bg-card"}`}>
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      Relances automatiques : {relanceActive ? <span className="text-sage">activées</span> : <span className="text-ink/70">désactivées</span>}
                    </p>
                    <p className="mt-1 text-sm text-ink/80">
                      {relanceActive ? "Les emails partent chaque jour, automatiquement." : "Aucun email n'est envoyé. Activez pour faire revenir vos clients."}
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={relanceActive}
                    aria-label="Activer les relances automatiques"
                    onClick={() => setRelanceActive(!relanceActive)}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${relanceActive ? "bg-sage" : "bg-ink/25"}`}
                  >
                    <span className={`absolute left-1 top-1 size-6 rounded-full bg-white shadow transition-transform ${relanceActive ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className={`space-y-5 transition-opacity ${relanceActive ? "" : "pointer-events-none opacity-50"}`}>
                  <EtapeNumerotee n={1} titre="Quand envoyer l'email ?">
                    <p className="mb-3 text-sm text-ink/80">Après combien de jours <strong>sans visite</strong> le client reçoit-il l&apos;email :</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[7, 14, 21, 30].map((j) => (
                        <Puce key={j} actif={relanceJours === j} onClick={() => setRelanceJours(j)}>{j} jours</Puce>
                      ))}
                      <label className="flex items-center gap-2 text-sm text-ink/80">
                        ou
                        <input type="number" min={1} max={90} value={relanceJours} onChange={(e) => setRelanceJours(Number(e.target.value))}
                          className="w-20 rounded-lg border border-wine/20 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold" />
                        jours
                      </label>
                    </div>
                    <p className="mt-3 rounded-lg bg-ivory px-3 py-2 text-sm text-ink/80">
                      💡 <strong>14 jours</strong> pour un kebab, une pizzeria ou un fast-food (clients qui viennent souvent),
                      <strong> 30 jours</strong> pour un restaurant traditionnel.
                    </p>
                  </EtapeNumerotee>

                  <EtapeNumerotee n={2} titre="Quelle réduction offrir ?">
                    <p className="mb-3 text-sm text-ink/80">Le pourcentage de réduction écrit dans l&apos;email, valable sur sa prochaine visite :</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[5, 10, 15, 20].map((pct) => (
                        <Puce key={pct} actif={relancePourcentage === pct} onClick={() => setRelancePourcentage(pct)}>-{pct} %</Puce>
                      ))}
                      <label className="flex items-center gap-2 text-sm text-ink/80">
                        ou
                        <input type="number" min={5} max={50} value={relancePourcentage} onChange={(e) => setRelancePourcentage(Number(e.target.value))}
                          className="w-20 rounded-lg border border-wine/20 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold" />
                        %
                      </label>
                    </div>
                    <p className="mt-3 rounded-lg bg-ivory px-3 py-2 text-sm text-ink/80">
                      💡 <strong>-10 %</strong> suffit en général. Sur un panier de {(panierMoyen || 15).toLocaleString("fr-FR")} €, ça vous coûte
                      environ <strong>{coutRelance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</strong>, et seulement si le client revient.
                    </p>
                  </EtapeNumerotee>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={saveParametres}
                    disabled={savingParams}
                    className="rounded-xl bg-wine px-8 py-3 text-base font-semibold text-gold-light shadow-lg shadow-wine/20 transition-colors hover:bg-wine-dark disabled:opacity-50"
                  >
                    {savingParams ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <p className="text-sm text-ink/75">Un seul email par client, uniquement à ceux qui ont accepté de recevoir des offres.</p>
                </div>
              </div>

              <div className="space-y-5 lg:sticky lg:top-6">
                {/* Apercu de l'email */}
                <div className="overflow-hidden rounded-2xl border border-wine/10 bg-card shadow-sm">
                  <div className="border-b border-wine/10 bg-ivory px-4 py-2.5 text-xs text-ink/75">
                    <p><strong className="text-ink/90">De :</strong> FidèleResto</p>
                    <p className="truncate"><strong className="text-ink/90">Objet :</strong> Julie, on ne vous a pas vu depuis un moment 👋</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-balance font-display text-lg font-semibold text-wine">On vous attend chez {restaurant?.nom_restaurant || "votre restaurant"}&nbsp;!</p>
                    <p className="mt-2 text-sm text-ink/80">Pour vous donner envie de revenir, voici une réduction sur votre prochaine visite :</p>
                    <div className="mx-auto mt-4 rounded-xl border-2 border-dashed border-wine bg-ivory px-4 py-3">
                      <p className="font-display text-3xl font-bold text-wine">-{relancePourcentage || 0}%</p>
                      <p className="text-xs text-ink/75">Présentez cet email sur place</p>
                    </div>
                    <span className="mt-4 inline-block rounded-lg bg-wine px-5 py-2 text-sm font-semibold text-ivory">Rejouer à la roue</span>
                  </div>
                  <p className="border-t border-wine/10 px-4 py-2 text-center text-xs text-ink/70">Aperçu de l&apos;email reçu par vos clients</p>
                </div>

                {/* Chiffres */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { v: abonnes, l: "acceptent les offres" },
                    { v: relanceActive ? aRelancer : 0, l: "à relancer demain" },
                    { v: dejaRelances, l: "déjà relancés" },
                  ].map((t) => (
                    <div key={t.l} className="rounded-xl border border-wine/10 bg-card px-2 py-3">
                      <p className="font-display text-2xl font-semibold text-ink">{t.v}</p>
                      <p className="text-xs leading-tight text-ink/75">{t.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )
        })()}

        {activeSection === "parametres" && (() => {
          const lienGoogleOk = /^https?:\/\/(g\.page|maps\.app\.goo\.gl|goo\.gl|(www\.)?google\.[a-z.]+|search\.google\.com)\//i.test(googleAvisUrl.trim())
          return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Paramètres</h1>
              <p className="mt-1 text-ink/80">Les informations de votre restaurant. Pensez à enregistrer en bas de la page.</p>
            </div>
            <div className="max-w-2xl space-y-5">
              <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm sm:p-6">
                <h2 className="font-display text-lg font-semibold text-ink">Votre restaurant</h2>
                <label htmlFor="param-nom" className="mt-4 block text-sm font-semibold text-ink">Nom du restaurant</label>
                <p className="mb-2 text-sm text-ink/75">Affiché sur la roue, les emails envoyés à vos clients et vos flyers.</p>
                <input
                  id="param-nom"
                  type="text"
                  value={nomRestaurantInput}
                  onChange={e => setNomRestaurantInput(e.target.value)}
                  className="w-full rounded-xl border border-wine/20 px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-ink">Avis Google</h2>
                  {googleAvisUrl.trim() ? (
                    lienGoogleOk
                      ? <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage">✓ Lien valide</span>
                      : <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-wine">Lien à vérifier</span>
                  ) : <span className="rounded-full bg-wine/10 px-3 py-1 text-xs font-semibold text-wine">À remplir</span>}
                </div>
                <label htmlFor="param-google" className="mt-4 block text-sm font-semibold text-ink">Lien pour laisser un avis sur votre fiche Google</label>
                <p className="mb-2 text-sm text-ink/75">Après la roue, le bouton « Laisser un avis Google » envoie vos clients sur ce lien.</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="param-google"
                    type="url"
                    placeholder="https://g.page/r/XXXXXXXXXXXX/review"
                    value={googleAvisUrl}
                    onChange={e => setGoogleAvisUrl(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-wine/20 px-4 py-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  {googleAvisUrl.trim() && (
                    <a href={googleAvisUrl.trim()} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-xl border-2 border-wine px-4 py-2.5 text-sm font-semibold text-wine hover:bg-wine hover:text-gold-light">
                      Tester le lien
                    </a>
                  )}
                </div>
                <details className="mt-4 rounded-xl bg-ivory px-4 py-3 text-sm text-ink/85">
                  <summary className="cursor-pointer font-semibold text-ink">Où trouver ce lien ? (1 minute)</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    <li>Sur Google, cherchez le nom de votre restaurant, connecté au compte qui gère la fiche.</li>
                    <li>Dans le panneau de votre fiche, cliquez sur <strong>« Demander des avis »</strong>.</li>
                    <li>Copiez le lien affiché (il commence souvent par g.page/r/…) et collez-le ici.</li>
                  </ol>
                </details>
              </div>

              <div className="rounded-2xl border border-wine/10 bg-card p-5 shadow-sm sm:p-6">
                <h2 className="font-display text-lg font-semibold text-ink">Mon compte</h2>
                <label htmlFor="param-email" className="mt-4 block text-sm font-semibold text-ink">Email de connexion</label>
                <input
                  id="param-email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="mt-2 w-full rounded-xl border border-wine/10 bg-secondary/40 px-4 py-3 text-base text-ink/75"
                />
                <p className="mt-2 text-sm text-ink/75">
                  Pour changer d&apos;email, écrivez-nous à{" "}
                  <a href="mailto:contact@fideleresto.fr" className="text-wine underline underline-offset-2">contact@fideleresto.fr</a>.{" "}
                  Mot de passe oublié ?{" "}
                  <a href="/mot-de-passe-oublie" className="text-wine underline underline-offset-2">Le réinitialiser</a>
                </p>
              </div>

              <button
                onClick={saveParametres}
                disabled={savingParams}
                className="w-full rounded-xl bg-wine px-8 py-3.5 text-base font-semibold text-gold-light shadow-lg shadow-wine/20 transition-colors hover:bg-wine-dark disabled:opacity-50 sm:w-auto"
              >
                {savingParams ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
          )
        })()}

      </main>

      {/* Notification discrète en bas à droite, remplace les alert() natifs du navigateur */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === "erreur" ? "bg-wine" : "bg-sage"
          }`}
        >
          {toast.type === "erreur" ? "⚠️" : "✓"} {toast.message}
        </div>
      )}

      {/* Modal de confirmation, remplace les confirm() natifs du navigateur */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 border border-wine/10">
            <p className="text-sm text-ink/90 leading-relaxed">{confirmModal.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-ink/75 hover:bg-secondary/60 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm()
                  setConfirmModal(null)
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-wine text-gold-light hover:bg-wine-dark transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// force rebuild 1783868565
