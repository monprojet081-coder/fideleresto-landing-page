import { CARTES, ENTREPRISE, carteParSlug, fichierVcf, nomComplet } from "@/lib/carte-contact"
import { PHOTO_VCARD_JPEG_B64 } from "@/lib/vcard-photo"

export const dynamicParams = false
export function generateStaticParams() {
  return CARTES.map((c) => ({ personne: c.slug }))
}

// Échappe les caractères réservés du format vCard
function esc(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1")
}

// Plie les lignes à 75 octets (RFC 6350), sans couper un caractère UTF-8
function plier(ligne: string) {
  const enc = new TextEncoder()
  const morceaux: string[] = []
  let courant = ""
  let taille = 0
  for (const ch of ligne) {
    const n = enc.encode(ch).length
    const max = morceaux.length === 0 ? 75 : 74
    if (taille + n > max) {
      morceaux.push(courant)
      courant = ""
      taille = 0
    }
    courant += ch
    taille += n
  }
  morceaux.push(courant)
  return morceaux.join("\r\n ")
}

export async function GET(_req: Request, { params }: { params: Promise<{ personne: string }> }) {
  const carte = carteParSlug((await params).personne)
  if (!carte) return new Response("Introuvable", { status: 404 })

  const lignes = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(carte.nom)};${esc(carte.prenom)};;;`,
    `FN:${esc(nomComplet(carte))}`,
    `ORG:${esc(ENTREPRISE.nom)}`,
    `TITLE:${esc(`${carte.titre} de ${ENTREPRISE.nom}`)}`,
    `TEL;TYPE=CELL,VOICE:${carte.telephone}`,
    `EMAIL;TYPE=INTERNET,WORK:${ENTREPRISE.email}`,
    `URL:${ENTREPRISE.site}`,
    `NOTE:${esc(ENTREPRISE.accroche)}`,
    `PHOTO;ENCODING=b;TYPE=JPEG:${PHOTO_VCARD_JPEG_B64}`,
    "END:VCARD",
  ]

  return new Response(lignes.map(plier).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fichierVcf(carte)}"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
