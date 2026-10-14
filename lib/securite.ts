// Outils anti-triche et anti-abus, utilises cote serveur uniquement.
import { createHash, createHmac, timingSafeEqual } from "crypto"

/** Echappe un texte avant de l'inserer dans un email HTML (prenom, commentaire...). */
export function echapperHtml(texte: unknown): string {
  return String(texte ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export const EMAIL_VALIDE = /^[^\s@<>()[\]\\,;:"]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i

/**
 * Forme "canonique" d'un email, pour qu'un meme client ne puisse pas rejouer en boucle avec
 * des variantes de SA propre adresse : chez Gmail, jean.dupont@ = jeandupont@ = jeandupont+2@.
 * Les emails sont envoyes a cette forme : ils arrivent dans la meme boite.
 */
export function emailCanonique(email: string): string {
  const e = email.trim().toLowerCase()
  const at = e.lastIndexOf("@")
  if (at < 1) return e
  let local = e.slice(0, at)
  let domaine = e.slice(at + 1)
  if (domaine === "googlemail.com") domaine = "gmail.com"
  if (domaine === "gmail.com") local = local.split("+")[0].replace(/\./g, "")
  else if (/^(outlook|hotmail|live|msn)\.[a-z.]+$/.test(domaine) || ["icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com", "pm.me", "fastmail.com"].includes(domaine))
    local = local.split("+")[0]
  return `${local}@${domaine}`
}

/** Adresses jetables (creees en 1 clic, sans inscription) : refusees pour jouer */
const DOMAINES_JETABLES = new Set([
  "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com", "sharklasers.com", "grr.la", "pokemail.net", "spam4.me",
  "10minutemail.com", "10minutemail.net", "temp-mail.org", "tempmail.com", "tempmail.net", "tempmailo.com", "tempr.email", "temp-mail.io", "tmpmail.org", "tmpmail.net",
  "trashmail.com", "trashmail.fr", "trashmail.de", "throwawaymail.com", "getnada.com", "nada.email", "dispostable.com", "maildrop.cc", "mailnesia.com", "mintemail.com",
  "mohmal.com", "emailondeck.com", "fakeinbox.com", "mailcatch.com", "spamgourmet.com", "jetable.org", "mail-temporaire.fr", "mail-temporaire.com", "crazymailing.com",
  "mytemp.email", "burnermail.io", "inboxkitten.com", "emailfake.com", "fakemail.net", "minuteinbox.com", "discard.email", "mailpoof.com", "tempinbox.com", "byom.de",
  "33mail.com", "anonaddy.me", "linshiyouxiang.net", "harakirimail.com", "mailsac.com", "moakt.com", "tempail.com", "luxusmail.org", "zeroe.ml", "trbvm.com",
])
export function estEmailJetable(email: string): boolean {
  const domaine = email.trim().toLowerCase().split("@")[1] || ""
  return DOMAINES_JETABLES.has(domaine) || [...DOMAINES_JETABLES].some((d) => domaine.endsWith("." + d))
}

/** Adresse IP du visiteur, hachee (on ne stocke jamais l'IP en clair) */
export function hashIp(headers: Headers): string | null {
  const ip = (headers.get("x-forwarded-for") || "").split(",")[0].trim() || headers.get("x-real-ip") || ""
  if (!ip) return null
  return createHash("sha256").update(`${secret()}|ip|${ip}`).digest("hex").slice(0, 32)
}

function secret(): string {
  return process.env.QR_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "fideleresto-dev"
}

/**
 * Signature du QR code d'une recompense : sans elle, n'importe qui connaissant l'identifiant
 * d'une partie pourrait fabriquer lui-meme le QR code (sans recevoir l'email).
 */
export function signerRecompense(id: string): string {
  return createHmac("sha256", secret()).update(`recompense:${id}`).digest("base64url").slice(0, 16)
}
export function verifierSignatureRecompense(id: string, signature: string | null | undefined): boolean {
  if (!signature) return false
  const attendu = Buffer.from(signerRecompense(id))
  const recu = Buffer.from(String(signature))
  return attendu.length === recu.length && timingSafeEqual(attendu, recu)
}
/** Contenu du QR code envoye par email */
export const contenuQrRecompense = (id: string) => `fideleresto:recompense:${id}:${signerRecompense(id)}`
/** Les QR codes emis avant cette date n'etaient pas signes : on les accepte jusqu'a leur expiration */
export const DEBUT_QR_SIGNES = new Date("2026-10-14T16:00:00Z")
