// Flyers V2 : dessines entierement en code (SVG). Le QR code et le nom du restaurant
// sont toujours nets et bien places, sans image generee par IA.
// Format A5 portrait : viewBox 1480 x 2100 (1 unite = 0,1 mm).
import QRCode from "qrcode"

export type ModeleFlyerV2 = { id: string; nom: string; description: string }
export const MODELES_FLYER_V2: ModeleFlyerV2[] = [
  { id: "bordeaux", nom: "Bordeaux", description: "La carte rouge FidèleResto, sobre et chic" },
  { id: "ivoire", nom: "Ivoire", description: "Clair et élégant, avec la roue" },
  { id: "ardoise", nom: "Ardoise", description: "Esprit bistrot, fond noir" },
  { id: "street", nom: "Street", description: "Jaune et rouge, pour kebab, pizza, snack" },
]

export type OptionsFlyer = {
  url: string
  nom: string
  logo?: string | null // data URL, affiche a la place du nom si fourni
  polices?: { display: string; sans: string } // URL ou data URL des fichiers woff2
}

const W = 1480, H = 2100
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** QR code dessine en carres, dans un carre de cote `taille` place en (x, y) */
function qrSvg(url: string, x: number, y: number, taille: number, couleur: string) {
  const q = QRCode.create(url, { errorCorrectionLevel: "M" })
  const n = q.modules.size
  const m = taille / n
  let d = ""
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.modules.data[r * n + c]) d += `M${(x + c * m).toFixed(2)} ${(y + r * m).toFixed(2)}h${m.toFixed(2)}v${m.toFixed(2)}h-${m.toFixed(2)}z`
  return `<path d="${d}" fill="${couleur}" shape-rendering="crispEdges"/>`
}

/** Nom du restaurant (taille adaptee a la longueur) ou logo */
function enTete(o: OptionsFlyer, cy: number, couleur: string, police: string, max = 120) {
  if (o.logo) return `<image href="${o.logo}" x="${W / 2 - 230}" y="${cy - 150}" width="460" height="230" preserveAspectRatio="xMidYMid meet"/>`
  const nom = o.nom.trim() || "Notre restaurant"
  const taille = Math.max(56, Math.min(max, Math.floor(1700 / Math.max(nom.length, 8))))
  return `<text x="${W / 2}" y="${cy}" text-anchor="middle" font-family="${police}" font-weight="700" font-size="${taille}" fill="${couleur}">${esc(nom)}</text>`
}

const ICONE = (x: number, y: number, s: number, c: string) =>
  `<g transform="translate(${x} ${y}) scale(${s / 24})" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></g>`

/** Petite roue decorative */
function roue(cx: number, cy: number, r: number, couleurs: string[], bord: string) {
  const n = couleurs.length
  let s = ""
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2
    s += `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z" fill="${couleurs[i]}"/>`
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${bord}" stroke-width="${r * 0.09}"/>`
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * Math.PI; s += `<circle cx="${cx + r * Math.cos(a)}" cy="${cy + r * Math.sin(a)}" r="${r * 0.025}" fill="#fff7dc"/>` }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="${bord}"/><path d="M${cx - r * 0.12} ${cy - r * 1.1} L${cx + r * 0.12} ${cy - r * 1.1} L${cx} ${cy - r * 0.86} Z" fill="${bord}"/>`
  return s
}

/** Les 3 etapes : Scannez, Tournez, Gagnez */
function etapes(y: number, couleurNum: string, fondNum: string, couleurTexte: string, police: string) {
  const items = ["Scannez", "Tournez la roue", "Gagnez"]
  return items.map((t, i) => {
    const x = W / 2 + (i - 1) * 430
    return `<circle cx="${x}" cy="${y}" r="40" fill="${fondNum}"/><text x="${x}" y="${y + 15}" text-anchor="middle" font-family="${police}" font-weight="800" font-size="44" fill="${couleurNum}">${i + 1}</text><text x="${x}" y="${y + 105}" text-anchor="middle" font-family="${police}" font-weight="600" font-size="42" fill="${couleurTexte}">${t}</text>`
  }).join("")
}

function defs(o: OptionsFlyer) {
  const p = o.polices
  if (!p) return ""
  return `<defs><style>@font-face{font-family:'FRDisplay';src:url(${p.display}) format('woff2');font-weight:100 900;font-style:normal}@font-face{font-family:'FRSans';src:url(${p.sans}) format('woff2');font-weight:100 900}</style></defs>`
}
const DISPLAY = "FRDisplay, Fraunces, Georgia, serif"
const SANS = "FRSans, Geist, Helvetica, Arial, sans-serif"

export function flyerSvg(modele: string, o: OptionsFlyer): string {
  const head = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(o)}`
  const pied = (c: string) => `<text x="${W / 2}" y="${H - 70}" text-anchor="middle" font-family="${SANS}" font-size="28" letter-spacing="3" fill="${c}">PROPULSÉ PAR FIDÈLERESTO</text>`
  const QR = 640, qx = (W - QR) / 2

  if (modele === "bordeaux") {
    const qy = 880
    return head + `
<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#8a2a3e"/><stop offset="0.6" stop-color="#6b1e2e"/><stop offset="1" stop-color="#3d0f1a"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="34" fill="none" stroke="#c9962c" stroke-width="5"/>
<rect x="84" y="84" width="${W - 168}" height="${H - 168}" rx="24" fill="none" stroke="#c9962c" stroke-opacity="0.45" stroke-width="2"/>
${ICONE(W / 2 - 55, 170, 110, "#ebc677")}
${enTete(o, 420, "#faf3e8", DISPLAY)}
<line x1="${W / 2 - 160}" y1="490" x2="${W / 2 + 160}" y2="490" stroke="#c9962c" stroke-width="4"/>
<text x="${W / 2}" y="640" text-anchor="middle" font-family="${DISPLAY}" font-style="italic" font-weight="600" font-size="92" fill="#ebc677">Tentez votre chance</text>
<text x="${W / 2}" y="740" text-anchor="middle" font-family="${SANS}" font-weight="500" font-size="48" fill="#faf3e8" fill-opacity="0.9">Un cadeau vous attend peut-être</text>
<rect x="${qx - 50}" y="${qy - 50}" width="${QR + 100}" height="${QR + 100}" rx="40" fill="#faf3e8" stroke="#c9962c" stroke-width="8"/>
${qrSvg(o.url, qx, qy, QR, "#241914")}
${etapes(1740, "#3d0f1a", "#c9962c", "#faf3e8", SANS)}
<text x="${W / 2}" y="1960" text-anchor="middle" font-family="${SANS}" font-size="36" fill="#ebc677">Sans application · 30 secondes</text>
` + `</svg>`
  }

  if (modele === "ivoire") {
    const qy = 1060
    return head + `
<rect width="${W}" height="${H}" fill="#faf3e8"/>
<rect x="0" y="0" width="${W}" height="24" fill="#6b1e2e"/><rect x="0" y="${H - 24}" width="${W}" height="24" fill="#6b1e2e"/>
${enTete(o, 230, "#6b1e2e", DISPLAY, 110)}
<text x="${W / 2}" y="300" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="34" letter-spacing="10" fill="#c9962c">FIDÉLITÉ · CADEAUX · SURPRISES</text>
${roue(W / 2, 600, 210, ["#6b1e2e", "#faf3e8", "#c9962c", "#f6e3b4", "#6b1e2e", "#faf3e8", "#c9962c", "#f6e3b4"], "#c9962c")}
<text x="${W / 2}" y="950" text-anchor="middle" font-family="${DISPLAY}" font-weight="800" font-size="104" fill="#24130f">Scannez, <tspan fill="#6b1e2e" font-style="italic">gagnez</tspan> !</text>
<rect x="${qx - 34}" y="${qy - 34}" width="${QR + 68}" height="${QR + 68}" rx="30" fill="#fff" stroke="#24130f" stroke-opacity="0.12" stroke-width="3"/>
${qrSvg(o.url, qx, qy, QR, "#24130f")}
${etapes(1860, "#faf3e8", "#6b1e2e", "#24130f", SANS)}
` + pied("#6b1e2e") + `</svg>`
  }

  if (modele === "ardoise") {
    const qy = 900
    return head + `
<defs><radialGradient id="a" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#3a3f42"/><stop offset="1" stop-color="#1c1f21"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#a)"/>
<rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="none" stroke="#b08a5a" stroke-width="22"/>
<rect x="70" y="70" width="${W - 140}" height="${H - 140}" fill="none" stroke="#f3eee4" stroke-opacity="0.25" stroke-width="3" stroke-dasharray="14 12"/>
${enTete(o, 300, "#f3eee4", DISPLAY)}
<text x="${W / 2}" y="470" text-anchor="middle" font-family="${DISPLAY}" font-style="italic" font-size="70" fill="#f3d58a">~ le jeu de la maison ~</text>
<text x="${W / 2}" y="660" text-anchor="middle" font-family="${DISPLAY}" font-weight="800" font-size="116" fill="#f3eee4">Tournez la roue</text>
<text x="${W / 2}" y="780" text-anchor="middle" font-family="${DISPLAY}" font-weight="600" font-size="72" fill="#f3eee4" fill-opacity="0.85">et repartez avec un cadeau</text>
<rect x="${qx - 40}" y="${qy - 40}" width="${QR + 80}" height="${QR + 80}" rx="18" fill="#f3eee4"/>
${qrSvg(o.url, qx, qy, QR, "#1c1f21")}
${etapes(1740, "#1c1f21", "#f3d58a", "#f3eee4", SANS)}
<text x="${W / 2}" y="1960" text-anchor="middle" font-family="${SANS}" font-size="36" fill="#f3eee4" fill-opacity="0.7">Sans application · 30 secondes</text>
` + `</svg>`
  }

  // street
  const qy = 960
  return head + `
<rect width="${W}" height="${H}" fill="#ffc531"/>
<path d="M0 0 H${W} V520 Q${W / 2} 640 0 520 Z" fill="#d7262e"/>
${o.logo ? enTete(o, 300, "#fff", SANS) : `<text x="${W / 2}" y="250" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="${Math.max(60, Math.min(120, Math.floor(1700 / Math.max(o.nom.length, 8))))}" fill="#fff">${esc((o.nom || "Notre restaurant").toUpperCase())}</text>`}
<text x="${W / 2}" y="430" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="140" fill="#ffc531" letter-spacing="-2">À GAGNER !</text>
<text x="${W / 2}" y="760" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="96" fill="#1a1a1a">SCANNE &amp; TOURNE</text>
<text x="${W / 2}" y="860" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="54" fill="#1a1a1a">la roue, c'est cadeau !</text>
<rect x="${qx - 44}" y="${qy - 44}" width="${QR + 88}" height="${QR + 88}" rx="44" fill="#fff" stroke="#1a1a1a" stroke-width="10"/>
${qrSvg(o.url, qx, qy, QR, "#1a1a1a")}
${etapes(1810, "#ffc531", "#1a1a1a", "#1a1a1a", SANS)}
` + pied("#1a1a1a") + `</svg>`
}
