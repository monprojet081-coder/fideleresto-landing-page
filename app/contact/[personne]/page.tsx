import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import QRCode from "qrcode"
import { CARTES, ENTREPRISE, carteParSlug, nomComplet, urlCarte } from "@/lib/carte-contact"
import { CarteVisite } from "@/components/carte-visite"
import { FondCarte } from "@/components/fond-carte"

type Props = { params: Promise<{ personne: string }> }

export const dynamicParams = false
export function generateStaticParams() {
  return CARTES.map((c) => ({ personne: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const carte = carteParSlug((await params).personne)
  if (!carte) return {}
  const titre = `${nomComplet(carte)} · ${carte.titre} de ${ENTREPRISE.nom}`
  const image = `/assets/carte-contact-${carte.slug}-og.jpg`
  return {
    title: { absolute: titre },
    description: `Carte de visite de ${nomComplet(carte)}, ${carte.titre.toLowerCase()} de FidèleResto. ${ENTREPRISE.accroche}`,
    alternates: { canonical: `/contact/${carte.slug}` },
    openGraph: {
      title: titre,
      description: "Enregistrez mes coordonnées en un geste.",
      url: urlCarte(carte),
      type: "profile",
      images: [{ url: image, width: 1200, height: 630, alt: `Carte de visite de ${nomComplet(carte)}` }],
    },
    twitter: { card: "summary_large_image", title: titre, images: [image] },
  }
}

export const viewport: Viewport = { themeColor: "#2a0b13" }

export default async function CartePersonnePage({ params }: Props) {
  const carte = carteParSlug((await params).personne)
  if (!carte) notFound()

  const qrSvg = await QRCode.toString(urlCarte(carte), {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#431320", light: "#00000000" },
  })

  return (
    <FondCarte>
      <CarteVisite carte={carte} qrSvg={qrSvg} />
    </FondCarte>
  )
}
