import type { Metadata, Viewport } from "next"
import QRCode from "qrcode"
import { CARTE, NOM_COMPLET } from "@/lib/carte-contact"
import { CarteVisite } from "@/components/carte-visite"

const titre = `${NOM_COMPLET} · ${CARTE.titre} de ${CARTE.entreprise}`

export const metadata: Metadata = {
  title: { absolute: titre },
  description: `Carte de visite de ${NOM_COMPLET}, ${CARTE.titre.toLowerCase()} de FidèleResto. ${CARTE.accroche}`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: titre,
    description: "Enregistrez mes coordonnées en un geste.",
    url: CARTE.url,
    type: "profile",
    images: [{ url: "/assets/carte-contact-og.jpg", width: 1200, height: 630, alt: `Carte de visite de ${NOM_COMPLET}` }],
  },
  twitter: { card: "summary_large_image", title: titre, images: ["/assets/carte-contact-og.jpg"] },
}

export const viewport: Viewport = { themeColor: "#2a0b13" }

export default async function ContactPage() {
  const qrSvg = await QRCode.toString(CARTE.url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#431320", light: "#00000000" },
  })

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#2a0b13] px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,#6b1e2e_0%,#2a0b13_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <CarteVisite qrSvg={qrSvg} />
    </main>
  )
}
