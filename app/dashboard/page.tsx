"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { QrCode, Users, Star, Gift, LogOut, LayoutDashboard, Settings, Sliders, UtensilsCrossed, Download, ArrowRight, CreditCard, Check, BookOpen, Award, Trash2, Search, Image as ImageIcon, FileText, Mail, ShieldCheck } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MODELES_FLYER, ModeleFlyer } from "@/lib/flyerTemplates"

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
  const [nomRestaurantInput, setNomRestaurantInput] = useState("")
  const [googleAvisUrl, setGoogleAvisUrl] = useState("")
  const [savingParams, setSavingParams] = useState(false)
  const [relanceActive, setRelanceActive] = useState(false)
  const [relanceJours, setRelanceJours] = useState(10)
  const [relancePourcentage, setRelancePourcentage] = useState(10)
  const [billingPeriod, setBillingPeriod] = useState<"mensuel" | "trimestriel" | "annuel">("mensuel")
  const [avecCreationSite, setAvecCreationSite] = useState(false)
  const [avecReseaux, setAvecReseaux] = useState(false)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [abonnementMessage, setAbonnementMessage] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Menu digital
  const [uploadingMenu, setUploadingMenu] = useState(false)
  const [menuUploadError, setMenuUploadError] = useState("")
  const [menuUploadSuccess, setMenuUploadSuccess] = useState(false)

  // Flyer
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState("")
  const [selectedModele, setSelectedModele] = useState<ModeleFlyer | null>(null)
  const [flyerAffichage, setFlyerAffichage] = useState<"nom" | "logo">("nom")
  const [generatingFlyer, setGeneratingFlyer] = useState(false)

  // Carte de fidélité
  const [tamponsRequis, setTamponsRequis] = useState(8)
  const [montantMin, setMontantMin] = useState(1)
  const [recompenseFidelite, setRecompenseFidelite] = useState("Un plat offert")
  const [savingFidelite, setSavingFidelite] = useState(false)
  const [rechercheEmail, setRechercheEmail] = useState("")
  const [clientTrouve, setClientTrouve] = useState<any>(null)
  const [rechercheLoading, setRechercheLoading] = useState(false)
  const [rechercheError, setRechercheError] = useState("")
  const [montantPassage, setMontantPassage] = useState("")
  const [validationLoading, setValidationLoading] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
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
          setNomRestaurantInput(restoData.nom_restaurant || "")
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
    if (activeSection === "qrcode" && user && !qrGenerated.current) {
      qrGenerated.current = true
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
    }

    if (activeSection !== "fidelite" && streamRef.current) {
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

  const handleSubscribe = async (planKey: string) => {
    setSubscribing(planKey)
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          plan: planKey,
          avecCreationSite: planKey.startsWith("premium") ? avecCreationSite : false,
          avecReseaux: planKey.startsWith("premium") ? avecReseaux : false,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Erreur : " + (data.error || "impossible de démarrer le paiement"))
        setSubscribing(null)
      }
    } catch (err) {
      alert("Erreur lors de la connexion au paiement")
      setSubscribing(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Résilier votre abonnement ? Il restera actif jusqu'à la fin de la période en cours (ou de votre essai gratuit), puis s'arrêtera automatiquement sans prélèvement.")) return
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
        alert("Erreur : " + (data.error || "impossible de résilier"))
      }
    } catch {
      alert("Erreur lors de la résiliation")
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
        alert("Erreur : " + (data.error || "impossible d'annuler la résiliation"))
      }
    } catch {
      alert("Erreur lors de l'annulation de la résiliation")
    }
    setCancelling(false)
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
      alert("Erreur lors de la génération du flyer.")
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
      alert("Erreur : " + error.message)
    } else {
      setRestaurant({ ...restaurant, fidelite_tampons_requis: tamponsRequis, fidelite_montant_min: montantMin, fidelite_recompense: recompenseFidelite })
      alert("Réglages sauvegardés !")
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
          if (code && code.data.startsWith("fideleresto:client:")) {
            const clientId = code.data.replace("fideleresto:client:", "")
            arreterScan()
            rechercherClientParId(clientId)
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
      alert("Erreur lors de la sauvegarde : " + error.message)
    } else {
      setRestaurant({
        ...restaurant,
        nom_restaurant: nomRestaurantInput,
        google_avis_url: googleAvisUrl,
        relance_active: relanceActive,
        relance_jours_inactivite: relanceJours,
        relance_pourcentage: relancePourcentage,
      })
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

  const nomResto = restaurant?.nom_restaurant || "Mon Restaurant"
  const totalProba = rewards.reduce((a, r) => a + r.probabilite, 0)

  const kpis = [
    { label: "Scans QR", value: restaurant?.scan_qr?.toString() || "0", icon: QrCode, color: "bg-wine/8 text-wine" },
    { label: "Clients collectés", value: clients.length.toString(), icon: Users, color: "bg-sage/10 text-sage" },
    { label: "Récompenses distribuées", value: clients.filter((c) => c.a_gagne).length.toString(), icon: Gift, color: "bg-gold/12 text-wine-dark" },
    { label: "Avis Google", value: restaurant?.avis_google_clics?.toString() || "0", icon: Star, color: "bg-wine/8 text-wine" },
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

  // Compte verrouillé : abonnement résilié (arrivé à sa date de fin), impayé, ou jamais souscrit.
  // On ne coupe pas l'accès pendant une résiliation programmée (resiliation_prevue) tant que
  // la période en cours n'est pas terminée — seulement une fois que Stripe a réellement mis fin
  // à l'abonnement (statut_abonnement passe à "annule" via le webhook customer.subscription.deleted).
  // Même logique que la page roue (/r/[slug]) : tout statut qui n'est pas "actif" ou "essai" verrouille.
  const compteVerrouille = !restaurant?.plan || !["actif", "essai"].includes(restaurant?.statut_abonnement)

  const navItems = compteVerrouille
    ? [{ id: "abonnement", label: "Abonnement", icon: CreditCard }]
    : [
        { id: "accueil", label: "Tableau de bord", icon: LayoutDashboard },
        { id: "qrcode", label: "Mon QR code", icon: QrCode },
        { id: "flyer", label: "Mon flyer", icon: FileText },
        { id: "clients", label: "Mes clients", icon: Users },
        { id: "roue", label: "Ma roue", icon: Sliders },
        { id: "menu", label: "Menu digital", icon: BookOpen },
        { id: "fidelite", label: "Carte fidélité", icon: Award },
        { id: "abonnement", label: "Abonnement", icon: CreditCard },
        { id: "relance", label: "Relance", icon: Mail },
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
          {isAdmin && (
            <a
              href="/admin"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ivory/60 hover:bg-white/5 hover:text-ivory transition-colors"
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
                  <p className="text-sm font-medium text-ink mb-4">Taux de victoire</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={dataVictoire} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                        <Cell fill="#c9962c" />
                        <Cell fill="#e7d9c3" />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #6b1e2e20", fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-xs text-ink/60 -mt-2">
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
                URL : <span className="text-wine font-medium">{(process.env.NEXT_PUBLIC_SITE_URL || "fideleresto-landing-page-9dhz.vercel.app").replace(/^https?:\/\//, "")}/r/{user?.id?.slice(0, 8)}</span>
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

        {activeSection === "flyer" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Mon flyer</h1>
              <p className="text-ink/55 mt-1">Choisissez un modèle, votre nom et votre QR code s'ajoutent automatiquement</p>
            </div>

            <div className="max-w-2xl">
              <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm mb-6">
                <p className="text-sm font-medium text-ink mb-3">Votre logo (optionnel)</p>

                {restaurant?.logo_url && (
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/40 px-4 py-3 mb-4">
                    <img src={restaurant.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded" />
                    <p className="text-sm text-ink/70">Logo actuel</p>
                  </div>
                )}

                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-wine/20 rounded-xl py-6 cursor-pointer hover:border-gold/50 transition-colors">
                  <ImageIcon className="size-6 text-wine/40" />
                  <p className="text-sm text-ink/70">
                    {uploadingLogo ? "Envoi en cours..." : "Cliquez pour choisir votre logo"}
                  </p>
                  <p className="text-xs text-ink/40">JPG, PNG ou WEBP</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    disabled={uploadingLogo}
                    onChange={handleLogoUpload}
                  />
                </label>
                {logoUploadError && <p className="text-sm text-wine mt-3">{logoUploadError}</p>}
              </div>

              <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm mb-6">
                <p className="text-sm font-medium text-ink mb-3">Afficher sur le flyer</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFlyerAffichage("nom")}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      flyerAffichage === "nom" ? "border-wine bg-wine/5 text-wine" : "border-wine/15 text-ink/60 hover:border-wine/30"
                    }`}
                  >
                    Nom du restaurant
                  </button>
                  <button
                    onClick={() => restaurant?.logo_url && setFlyerAffichage("logo")}
                    disabled={!restaurant?.logo_url}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                      flyerAffichage === "logo" ? "border-wine bg-wine/5 text-wine" : "border-wine/15 text-ink/60 hover:border-wine/30"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Mon logo {!restaurant?.logo_url && "(ajoutez-en un ci-dessus)"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink/40">Un seul des deux s'affiche à la fois, en grand, pour un rendu plus propre.</p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm">
                <p className="text-sm font-medium text-ink mb-4">Choisissez votre modèle</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {MODELES_FLYER.filter((m) => m.plan === (restaurant?.plan === "premium" ? "premium" : "standard")).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModele(m)}
                      className={`rounded-lg overflow-hidden border-2 transition-colors text-left ${
                        selectedModele?.id === m.id ? "border-wine" : "border-transparent hover:border-wine/30"
                      }`}
                    >
                      <img src={m.fichierThumb} alt={m.nom} className="w-full aspect-[3/4] object-cover" />
                      <p className="text-xs text-center py-1.5 bg-secondary/40 text-ink/70">{m.nom}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateFlyer}
                  disabled={generatingFlyer || !selectedModele}
                  className="w-full bg-wine hover:bg-wine-dark text-gold-light font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                  {generatingFlyer ? "Génération en cours..." : "Télécharger le flyer (PDF)"}
                </button>
                <p className="text-xs text-ink/40 mt-3 text-center">
                  Le flyer reprend automatiquement le nom de votre restaurant, votre QR code et, si ajouté, votre logo.
                </p>
              </div>
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

        {activeSection === "menu" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Menu digital</h1>
              <p className="text-ink/55 mt-1">Importez votre menu existant, visible par vos clients sur leur carte de fidélité</p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm max-w-2xl">
              {restaurant?.menu_type && (
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3 mb-5">
                  <p className="text-sm text-ink/70">
                    Menu actuel : <span className="font-medium text-ink capitalize">{restaurant.menu_type}</span>
                  </p>
                  <a href={restaurant.menu_url} target="_blank" rel="noreferrer" className="text-sm text-wine font-medium hover:underline">
                    Voir le fichier →
                  </a>
                </div>
              )}

              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-wine/20 rounded-xl py-10 cursor-pointer hover:border-gold/50 transition-colors">
                <BookOpen className="size-8 text-wine/40" />
                <p className="text-sm text-ink/70">
                  {uploadingMenu ? "Envoi en cours..." : "Cliquez pour choisir votre fichier"}
                </p>
                <p className="text-xs text-ink/40">PDF, JPG, PNG, Word (.docx) ou Excel (.xlsx)</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.xls"
                  className="hidden"
                  disabled={uploadingMenu}
                  onChange={handleMenuUpload}
                />
              </label>

              {menuUploadError && <p className="text-sm text-wine mt-4">{menuUploadError}</p>}
              {menuUploadSuccess && <p className="text-sm text-sage mt-4">Menu importé avec succès !</p>}
            </div>
          </div>
        )}

        {activeSection === "fidelite" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Carte fidélité</h1>
              <p className="text-ink/55 mt-1">Réglez votre carte et validez les passages de vos clients</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
              {/* Réglages */}
              <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm">
                <p className="text-sm font-medium text-ink mb-4">Réglages de la carte</p>

                <label className="block text-sm text-ink/70 mb-1">
                  Nombre de tampons requis : <span className="font-semibold text-wine">{tamponsRequis}</span>
                </label>
                <input
                  type="range"
                  min={6}
                  max={15}
                  value={tamponsRequis}
                  onChange={e => setTamponsRequis(parseInt(e.target.value))}
                  className="w-full accent-wine mb-4"
                />

                <label className="block text-sm text-ink/70 mb-1">Montant minimum pour valider un tampon (€)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={montantMin}
                  onChange={e => setMontantMin(parseFloat(e.target.value))}
                  className="w-full border border-wine/15 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <label className="block text-sm text-ink/70 mb-1">Récompense offerte</label>
                <input
                  type="text"
                  value={recompenseFidelite}
                  onChange={e => setRecompenseFidelite(e.target.value)}
                  className="w-full border border-wine/15 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gold"
                />

                <button
                  onClick={saveFideliteConfig}
                  disabled={savingFidelite}
                  className="w-full bg-wine hover:bg-wine-dark disabled:opacity-60 text-gold-light font-medium py-2.5 rounded-lg text-sm"
                >
                  {savingFidelite ? "Sauvegarde..." : "Sauvegarder les réglages"}
                </button>
              </div>

              {/* Validation d'un passage */}
              <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm">
                <p className="text-sm font-medium text-ink mb-4">Valider un passage client</p>

                {scanning ? (
                  <div className="mb-4">
                    <div className="relative rounded-lg overflow-hidden bg-ink aspect-square max-w-xs mx-auto">
                      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-6 border-2 border-gold rounded-lg pointer-events-none" />
                    </div>
                    <canvas ref={scanCanvasRef} className="hidden" />
                    <button
                      onClick={arreterScan}
                      className="mt-3 w-full text-sm text-ink/60 hover:text-wine"
                    >
                      Annuler le scan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={demarrerScan}
                    className="w-full flex items-center justify-center gap-2 bg-wine hover:bg-wine-dark text-gold-light font-medium py-3 rounded-lg text-sm mb-4"
                  >
                    <QrCode className="size-4" />
                    Scanner la carte du client
                  </button>
                )}

                <details className="mb-2">
                  <summary className="text-xs text-ink/50 cursor-pointer hover:text-ink/70">
                    Ou rechercher par email
                  </summary>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="email"
                      placeholder="Email du client"
                      value={rechercheEmail}
                      onChange={e => setRechercheEmail(e.target.value)}
                      className="flex-1 border border-wine/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <button
                      onClick={rechercherClient}
                      disabled={rechercheLoading}
                      className="bg-secondary hover:bg-secondary/70 text-ink px-3 rounded-lg"
                    >
                      <Search className="size-4" />
                    </button>
                  </div>
                </details>

                {rechercheError && <p className="text-sm text-wine mt-3 mb-2">{rechercheError}</p>}

                {clientTrouve && (
                  <div className="rounded-lg bg-secondary/40 p-4 mt-4">
                    <p className="text-sm text-ink mb-3">
                      <span className="font-medium">{clientTrouve.email}</span> — {clientTrouve.tampons}/{tamponsRequis} tampons
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Montant dépensé (€)"
                        value={montantPassage}
                        onChange={e => setMontantPassage(e.target.value)}
                        className="flex-1 border border-wine/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                      <button
                        onClick={validerPassage}
                        disabled={validationLoading}
                        className="bg-wine hover:bg-wine-dark disabled:opacity-60 text-gold-light font-medium px-4 rounded-lg text-sm whitespace-nowrap"
                      >
                        Valider
                      </button>
                    </div>
                    {validationMessage && <p className="text-sm text-sage mt-3">{validationMessage}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "abonnement" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Abonnement</h1>
              <p className="text-ink/55 mt-1">Choisissez le plan adapté à votre restaurant</p>
            </div>

            {compteVerrouille && (
              <div className="mb-6 max-w-2xl rounded-lg border border-wine/20 bg-wine/5 px-4 py-3 text-sm text-wine">
                Votre abonnement est terminé, l&apos;accès aux fonctionnalités (roue, clients, flyer...) est suspendu.
                Choisissez un plan ci-dessous pour tout réactiver immédiatement.
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
                  <p className="text-sm text-ink/55">Votre plan actuel</p>
                  <p className="font-display text-lg font-semibold text-ink capitalize">{restaurant.plan}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  restaurant.statut_abonnement === "actif" ? "bg-sage/12 text-sage" :
                  restaurant.statut_abonnement === "essai" ? "bg-gold/15 text-wine-dark" :
                  restaurant.statut_abonnement === "impaye" ? "bg-wine/10 text-wine" :
                  "bg-secondary text-ink/50"
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
                    <p className="text-sm text-ink/70">
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
                    <p className="text-sm text-ink/55">Vous pouvez résilier à tout moment, sans engagement.</p>
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
                  billingPeriod === "mensuel" ? "bg-wine text-gold-light" : "text-ink/60"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("trimestriel")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "trimestriel" ? "bg-wine text-gold-light" : "text-ink/60"
                }`}
              >
                Trimestriel <span className="opacity-75">(-10%)</span>
              </button>
              <button
                onClick={() => setBillingPeriod("annuel")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "annuel" ? "bg-wine text-gold-light" : "text-ink/60"
                }`}
              >
                Annuel <span className="opacity-75">(-20%)</span>
              </button>
            </div>


            <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
              {[
                {
                  key: "standard",
                  nom: "Standard",
                  prixMensuel: 180,
                  prixTrimestriel: 162,
                  prixAnnuel: 144,
                  totalTrimestriel: 486,
                  totalAnnuel: 1728,
                  features: [
                    "Roue de la fidélité + boost avis Google",
                    "3 modèles de flyers prêts à imprimer",
                    "Emails de relance automatiques",
                    "Menu digital",
                    "Carte de fidélité digitale",
                    "Tableau de bord complet",
                  ],
                },
                {
                  key: "premium",
                  nom: "Premium",
                  prixMensuel: 280,
                  prixTrimestriel: 252,
                  prixAnnuel: 224,
                  totalTrimestriel: 756,
                  totalAnnuel: 2688,
                  features: [
                    "Tout ce qui est inclus dans Standard",
                    "Accompagnement prioritaire",
                    "Flyers fournis et traduits sur demande",
                    "Traduction de l'application sur demande",
                    "Option création de site (mensuel uniquement)",
                    "Option gestion réseaux sociaux (mensuel uniquement)",
                  ],
                },
              ].map((offre) => {
                const planKey = `${offre.key}_${billingPeriod}`
                const prixAffiche =
                  billingPeriod === "mensuel" ? offre.prixMensuel :
                  billingPeriod === "trimestriel" ? offre.prixTrimestriel :
                  offre.prixAnnuel
                const totalPeriode =
                  billingPeriod === "trimestriel" ? offre.totalTrimestriel :
                  billingPeriod === "annuel" ? offre.totalAnnuel :
                  null
                const estPlanActuel = restaurant?.plan === offre.key && ["actif", "essai"].includes(restaurant?.statut_abonnement)
                return (
                  <div
                    key={offre.key}
                    className={`relative rounded-2xl border bg-card p-6 shadow-sm ${
                      offre.key === "premium" ? "border-gold/50" : "border-wine/10"
                    }`}
                  >
                    {offre.key === "premium" && (
                      <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-wine-dark">
                        Le plus complet
                      </span>
                    )}
                    <h3 className="font-display text-xl font-semibold text-ink">{offre.nom}</h3>
                    <div className="mt-2 flex items-end gap-1">
                      <span className="font-display text-3xl font-semibold text-wine">
                        {prixAffiche}€
                      </span>
                      <span className="text-sm text-ink/50 mb-1">/mois</span>
                    </div>
                    {totalPeriode && (
                      <p className="mt-1 text-sm text-ink/60">
                        soit {totalPeriode}€ facturés {billingPeriod === "trimestriel" ? "tous les 3 mois" : "1x/an"}
                      </p>
                    )}
                    {offre.key === "standard" && (
                      <p className="mt-2 inline-flex items-center rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-wine-dark">
                        14 jours d&apos;essai gratuit
                      </p>
                    )}
                    <ul className="mt-5 space-y-2.5">
                      {offre.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-ink/75">
                          <Check className="size-4 mt-0.5 text-sage flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {offre.key === "premium" && !estPlanActuel && (
                      <div className="mt-4 space-y-2">
                        <label className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 text-sm text-ink/75 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={avecCreationSite}
                            onChange={(e) => setAvecCreationSite(e.target.checked)}
                            className="mt-0.5 accent-wine"
                          />
                          <span>
                            Je n&apos;ai pas encore de site, créez-moi en un
                            <span className="block text-xs text-ink/50">
                              600€ de frais uniques, puis {" "}
                              {billingPeriod === "mensuel" ? "100€/mois" : billingPeriod === "trimestriel" ? "300€/trimestre" : "1200€/an"} de maintenance
                            </span>
                          </span>
                        </label>
                        <label className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-3 text-sm text-ink/75 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={avecReseaux}
                            onChange={(e) => setAvecReseaux(e.target.checked)}
                            className="mt-0.5 accent-wine"
                          />
                          <span>
                            Gérez-moi mes réseaux sociaux
                            <span className="block text-xs text-ink/50">
                              400€ de frais uniques, puis {" "}
                              {billingPeriod === "mensuel" ? "200€/mois" : billingPeriod === "trimestriel" ? "600€/trimestre" : "2400€/an"} de gestion
                            </span>
                          </span>
                        </label>
                      </div>
                    )}

                    <button
                      onClick={() => handleSubscribe(planKey)}
                      disabled={estPlanActuel || subscribing !== null}
                      className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                        offre.key === "premium"
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

        {activeSection === "relance" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-semibold text-ink">Relance</h1>
              <p className="text-ink/55 mt-1">Emails automatiques pour faire revenir vos clients inactifs</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-wine/10 shadow-sm max-w-lg">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-ink/80">Emails de relance automatiques</label>
                <button
                  onClick={() => setRelanceActive(!relanceActive)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${relanceActive ? "bg-wine" : "bg-secondary"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform ${relanceActive ? "translate-x-4.5" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-ink/45 mb-3">
                Envoie un email automatique avec une petite réduction aux clients qui ne sont pas revenus depuis un moment (uniquement à ceux ayant accepté de recevoir des offres).
              </p>
              {relanceActive && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink/60 mb-1">Après combien de jours d'inactivité</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={relanceJours}
                      onChange={e => setRelanceJours(Number(e.target.value))}
                      className="w-full border border-wine/15 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/60 mb-1">% de réduction offert</label>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={relancePourcentage}
                      onChange={e => setRelancePourcentage(Number(e.target.value))}
                      className="w-full border border-wine/15 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={saveParametres}
                disabled={savingParams}
                className="mt-5 bg-wine hover:bg-wine-dark disabled:opacity-50 text-gold-light font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
              >
                {savingParams ? "Sauvegarde..." : "Sauvegarder"}
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
                    value={nomRestaurantInput}
                    onChange={e => setNomRestaurantInput(e.target.value)}
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
// force rebuild 1783868565
