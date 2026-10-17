import { CARTE, NOM_COMPLET } from "@/lib/carte-contact"
import { PHOTO_VCARD_JPEG_B64 } from "@/lib/vcard-photo"

export const dynamic = "force-static"

// Échappe les caractères réservés du format vCard
function esc(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1")
}

// Plie les lignes à 75 octets (RFC 6350), en ne coupant jamais un caractère UTF-8
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

export function GET() {
  const lignes = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(CARTE.nom)};${esc(CARTE.prenom)};;;`,
    `FN:${esc(NOM_COMPLET)}`,
    `ORG:${esc(CARTE.entreprise)}`,
    `TITLE:${esc(`${CARTE.titre} de ${CARTE.entreprise}`)}`,
    `TEL;TYPE=CELL,VOICE:${CARTE.telephone}`,
    `EMAIL;TYPE=INTERNET,WORK:${CARTE.email}`,
    `URL:${CARTE.site}`,
    `NOTE:${esc(CARTE.accroche)}`,
    `PHOTO;ENCODING=b;TYPE=JPEG:${PHOTO_VCARD_JPEG_B64}`,
    "END:VCARD",
  ]
  const corps = lignes.map(plier).join("\r\n") + "\r\n"

  return new Response(corps, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="Victor-Ehrenbogen-FideleResto.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
