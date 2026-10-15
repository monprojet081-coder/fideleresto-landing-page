// Flyers V2 : dessines entierement en code (SVG), inspires des imprimes de restaurant
// (affiche de fete foraine, ticket de tombola, sceau de bistrot, carte de visite).
// Format A5 portrait : viewBox 1480 x 2100 (1 unite = 0,1 mm).
import QRCode from "qrcode"

export type ModeleFlyerV2 = { id: string; nom: string; description: string }
export const MODELES_FLYER_V2: ModeleFlyerV2[] = [
  { id: "foraine", nom: "Fête foraine", description: "La roue en vedette, façon affiche de fête" },
  { id: "ticket", nom: "Ticket", description: "Un grand ticket de tombola à gratter des yeux" },
  { id: "sceau", nom: "Bistrot", description: "Un sceau rond, vert bouteille et or" },
  { id: "carte", nom: "Carte rouge", description: "Sobre et chic, aux couleurs FidèleResto" },
]

export type PolicesFlyer = { fraunces: string; frauncesItalic: string; shrikhand: string; bricolage: string }
export type OptionsFlyer = {
  url: string
  nom: string
  logo?: string | null // data URL ; remplace le nom quand il est fourni
  polices?: PolicesFlyer // URL ou data URL des fichiers woff2
}

const W = 1480, H = 2100
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const F_SERIF = "FRSerif, Georgia, serif"
const F_DISPLAY = "FRShrik, Georgia, serif"
const F_SANS = "FRSans, Helvetica, Arial, sans-serif"

function fontes(p?: PolicesFlyer) {
  if (!p) return ""
  return `<style>
@font-face{font-family:'FRSerif';src:url(${p.fraunces}) format('woff2');font-weight:100 900;font-style:normal}
@font-face{font-family:'FRSerif';src:url(${p.frauncesItalic}) format('woff2');font-weight:100 900;font-style:italic}
@font-face{font-family:'FRShrik';src:url(${p.shrikhand}) format('woff2')}
@font-face{font-family:'FRSans';src:url(${p.bricolage}) format('woff2');font-weight:200 800}
</style>`
}

/** QR code en modules carres dans un carre (x, y, taille) */
function qr(url: string, x: number, y: number, taille: number, couleur: string) {
  const q = QRCode.create(url, { errorCorrectionLevel: "M" })
  const n = q.modules.size, m = taille / n
  let d = ""
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    if (q.modules.data[r * n + c]) d += `M${(x + c * m).toFixed(2)} ${(y + r * m).toFixed(2)}h${m.toFixed(2)}v${m.toFixed(2)}h-${m.toFixed(2)}z`
  return `<path d="${d}" fill="${couleur}" shape-rendering="crispEdges"/>`
}

/** Taille de police pour que `texte` tienne dans `largeur` (estimation par caractere) */
const ajuster = (texte: string, largeur: number, max: number, ratio = 0.52) => Math.min(max, Math.floor(largeur / (Math.max(texte.length, 4) * ratio)))

function nomOuLogo(o: OptionsFlyer, x: number, y: number, largeur: number, hauteur: number, ancre: "start" | "middle", style: string, max: number) {
  if (o.logo) {
    const lx = ancre === "middle" ? x - largeur / 2 : x
    return `<image href="${o.logo}" x="${lx}" y="${y - hauteur * 0.8}" width="${largeur}" height="${hauteur}" preserveAspectRatio="${ancre === "middle" ? "xMidYMid" : "xMinYMid"} meet"/>`
  }
  const nom = (o.nom || "Notre restaurant").trim()
  return `<text x="${x}" y="${y}" text-anchor="${ancre}" font-size="${ajuster(nom, largeur, max)}" ${style}>${esc(nom)}</text>`
}

const svg = (o: OptionsFlyer, defs: string, corps: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${fontes(o.polices)}${defs}</defs>${corps}</svg>`

const GRAIN = (id: string, opacite: number) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacite} 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`

// ---------------------------------------------------------------------------------------------
// 1. Fete foraine : rayons de soleil, grande roue a ampoules qui monte du bas, titre peint a la main
function foraine(o: OptionsFlyer) {
  const cx = W / 2, cy = 2420, R = 960
  let rayons = ""
  for (let i = 0; i < 36; i++) {
    const a0 = (i / 36) * Math.PI * 2, a1 = ((i + 0.5) / 36) * Math.PI * 2
    rayons += `<path d="M${cx} ${cy} L${cx + 4000 * Math.cos(a0)} ${cy + 4000 * Math.sin(a0)} L${cx + 4000 * Math.cos(a1)} ${cy + 4000 * Math.sin(a1)} Z" fill="#7a1f33"/>`
  }
  const cases = ["#f4e6c8", "#c9962c", "#6b1e2e", "#f4e6c8", "#e0b551", "#3d0f1a"]
  let roue = ""
  const n = 12
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2
    roue += `<path d="M${cx} ${cy} L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z" fill="${cases[i % cases.length]}"/>`
  }
  let ampoules = ""
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2, r = R + 42
    ampoules += `<circle cx="${cx + r * Math.cos(a)}" cy="${cy + r * Math.sin(a)}" r="15" fill="#fff4cf"/><circle cx="${cx + r * Math.cos(a)}" cy="${cy + r * Math.sin(a)}" r="30" fill="#ffe08a" opacity="0.25"/>`
  }
  const Q = 440, qx = cx - Q / 2, qy = 1120
  return svg(o, `<radialGradient id="fg" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="#8d2a40"/><stop offset="1" stop-color="#4a0f1e"/></radialGradient>${GRAIN("gr", 0.18)}`, `
<rect width="${W}" height="${H}" fill="url(#fg)"/>
<g opacity="0.55">${rayons}</g>
${nomOuLogo(o, cx, 190, 1100, 190, "middle", `font-family="${F_SERIF}" font-weight="600" fill="#f4e6c8" letter-spacing="2"`, 92)}
<g transform="rotate(-5 ${cx} 520)">
  <text x="${cx + 10}" y="470" text-anchor="middle" font-family="${F_DISPLAY}" font-size="250" fill="#2a0810">Tournez</text>
  <text x="${cx}" y="458" text-anchor="middle" font-family="${F_DISPLAY}" font-size="250" fill="#f0c45a">Tournez</text>
  <text x="${cx + 10}" y="702" text-anchor="middle" font-family="${F_DISPLAY}" font-size="250" fill="#2a0810">la roue</text>
  <text x="${cx}" y="690" text-anchor="middle" font-family="${F_DISPLAY}" font-size="250" fill="#f0c45a">la roue</text>
</g>
<text x="${cx}" y="880" text-anchor="middle" font-family="${F_SERIF}" font-style="italic" font-weight="500" font-size="66" fill="#f4e6c8">et repartez peut-être avec un cadeau</text>
<text x="${cx}" y="975" text-anchor="middle" font-family="${F_SANS}" font-weight="500" font-size="40" fill="#f4e6c8" fill-opacity="0.75">Visez le code avec l'appareil photo de votre téléphone</text>
<circle cx="${cx}" cy="${cy}" r="${R + 80}" fill="#2a0810"/>
<circle cx="${cx}" cy="${cy}" r="${R + 66}" fill="#c9962c"/>
${ampoules}
${roue}
<g stroke="#2a0810" stroke-opacity="0.35" stroke-width="4">${Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return `<line x1="${cx}" y1="${cy}" x2="${cx + R * Math.cos(a)}" y2="${cy + R * Math.sin(a)}"/>` }).join("")}</g>
<rect x="${qx - 46}" y="${qy - 46}" width="${Q + 92}" height="${Q + 92}" rx="54" fill="#2a0810" opacity="0.35" transform="translate(10 16)"/>
<rect x="${qx - 46}" y="${qy - 46}" width="${Q + 92}" height="${Q + 92}" rx="54" fill="#fffaf0" stroke="#c9962c" stroke-width="10"/>
${qr(o.url, qx, qy, Q, "#2a0810")}
<path d="M${cx - 34} ${qy + Q + 60} L${cx + 34} ${qy + Q + 60} L${cx} ${qy + Q + 122} Z" fill="#f0c45a" stroke="#2a0810" stroke-width="6" stroke-linejoin="round"/>
<rect width="${W}" height="${H}" filter="url(#gr)" fill="#000"/>`)
}

// ---------------------------------------------------------------------------------------------
// 2. Ticket de tombola : grand ticket cartonne, talon detachable avec le QR, tampon a l'encre
function ticket(o: OptionsFlyer) {
  const x = 110, y = 150, w = W - 220, h = H - 300, talonY = y + 1190
  const encoche = 46
  const contour = `M${x + 40} ${y} H${x + w - 40} Q${x + w} ${y} ${x + w} ${y + 40} V${talonY - encoche} A${encoche} ${encoche} 0 0 0 ${x + w} ${talonY + encoche} V${y + h - 40} Q${x + w} ${y + h} ${x + w - 40} ${y + h} H${x + 40} Q${x} ${y + h} ${x} ${y + h - 40} V${talonY + encoche} A${encoche} ${encoche} 0 0 0 ${x} ${talonY - encoche} V${y + 40} Q${x} ${y} ${x + 40} ${y} Z`
  const numero = String(Math.abs([...o.url].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)) % 1000000).padStart(6, "0")
  const Q = 520
  const motif = Array.from({ length: 18 }, (_, i) => `<line x1="${x + 70}" y1="${y + 380 + i * 26}" x2="${x + w - 70}" y2="${y + 380 + i * 26}" stroke="#6b1e2e" stroke-opacity="0.06" stroke-width="12"/>`).join("")
  return svg(o, `${GRAIN("gt", 0.22)}<clipPath id="tk"><path d="${contour}"/></clipPath>`, `
<rect width="${W}" height="${H}" fill="#2b3a33"/>
<path d="${contour}" fill="#000" opacity="0.3" transform="translate(14 22)"/>
<path d="${contour}" fill="#f2e3c4"/>
<g clip-path="url(#tk)">
  <rect x="${x}" y="${y}" width="${w}" height="190" fill="#6b1e2e"/>
  ${motif}
  <rect x="${x}" y="${talonY}" width="${w}" height="${y + h - talonY}" fill="#ead6ad"/>
</g>
${nomOuLogo(o, x + 80, y + 122, w - 160, 120, "start", `font-family="${F_SERIF}" font-weight="600" fill="#f2e3c4"`, 76)}
<text x="${x + 80}" y="${y + 330}" font-family="${F_SANS}" font-weight="600" font-size="46" fill="#6b1e2e">Valable pour</text>
<text x="${x + 72}" y="${y + 640}" font-family="${F_SERIF}" font-weight="900" font-size="300" fill="#3d0f1a" letter-spacing="-8">un tour</text>
<text x="${x + 72}" y="${y + 920}" font-family="${F_SERIF}" font-style="italic" font-weight="400" font-size="300" fill="#6b1e2e" letter-spacing="-6">de roue</text>
<text font-family="${F_SANS}" font-weight="500" font-size="50" fill="#3d0f1a"><tspan x="${x + 80}" y="${y + 1040}">Une récompense vous attend peut-être,</tspan><tspan x="${x + 80}" y="${y + 1104}">à reprendre lors de votre prochaine visite.</tspan></text>
<g transform="translate(0 -170) rotate(-14 ${x + w - 230} ${y + 470}) translate(${x + w - 230} ${y + 470}) scale(0.82) translate(${-(x + w - 230)} ${-(y + 470)})" opacity="0.85">
  <circle cx="${x + w - 230}" cy="${y + 470}" r="150" fill="none" stroke="#b3263e" stroke-width="10"/>
  <circle cx="${x + w - 230}" cy="${y + 470}" r="122" fill="none" stroke="#b3263e" stroke-width="4"/>
  <text x="${x + w - 230}" y="${y + 455}" text-anchor="middle" font-family="${F_SANS}" font-weight="800" font-size="48" fill="#b3263e">Gratuit</text>
  <text x="${x + w - 230}" y="${y + 512}" text-anchor="middle" font-family="${F_SANS}" font-weight="600" font-size="34" fill="#b3263e">tous les jours</text>
</g>
<line x1="${x + encoche + 20}" y1="${talonY}" x2="${x + w - encoche - 20}" y2="${talonY}" stroke="#3d0f1a" stroke-width="5" stroke-dasharray="4 18" stroke-linecap="round"/>
<rect x="${x + 80}" y="${talonY + 90}" width="${Q + 50}" height="${Q + 50}" rx="20" fill="#fffaf0"/>
${qr(o.url, x + 105, talonY + 115, Q, "#241914")}
<text x="${x + Q + 190}" y="${talonY + 200}" font-family="${F_SERIF}" font-weight="700" font-size="74" fill="#3d0f1a">Scannez</text>
<text x="${x + Q + 190}" y="${talonY + 280}" font-family="${F_SERIF}" font-weight="700" font-size="74" fill="#3d0f1a">pour jouer</text>
<text x="${x + Q + 190}" y="${talonY + 370}" font-family="${F_SANS}" font-weight="500" font-size="40" fill="#3d0f1a" fill-opacity="0.8">Avec l'appareil photo,</text>
<text x="${x + Q + 190}" y="${talonY + 420}" font-family="${F_SANS}" font-weight="500" font-size="40" fill="#3d0f1a" fill-opacity="0.8">sans application.</text>
<text x="${x + Q + 190}" y="${talonY + 590}" font-family="${F_SANS}" font-weight="700" font-size="42" fill="#6b1e2e" letter-spacing="6">N° ${numero}</text>
<rect width="${W}" height="${H}" filter="url(#gt)" fill="#000"/>`)
}

// ---------------------------------------------------------------------------------------------
// 3. Sceau de bistrot : vert bouteille, grand cachet rond avec texte qui suit le cercle
function sceau(o: OptionsFlyer) {
  const cx = W / 2, cy = 1180, R = 560
  const Q = 520
  const etoiles = [0, 1, 2, 3].map((i) => { const a = -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4; const r = R - 62; return `<circle cx="${cx + r * Math.cos(a)}" cy="${cy + r * Math.sin(a)}" r="11" fill="#1f3a2e"/>` }).join("")
  return svg(o, `${GRAIN("gs", 0.2)}
<path id="haut" d="M${cx - (R - 62)} ${cy} A${R - 62} ${R - 62} 0 0 1 ${cx + (R - 62)} ${cy}"/>
<path id="bas" d="M${cx - (R - 62)} ${cy} A${R - 62} ${R - 62} 0 0 0 ${cx + (R - 62)} ${cy}"/>`, `
<rect width="${W}" height="${H}" fill="#1f3a2e"/>
<rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="#d9b25f" stroke-width="3"/>
${nomOuLogo(o, cx, 300, 1150, 200, "middle", `font-family="${F_SERIF}" font-weight="500" fill="#efe4c8"`, 120)}
<text x="${cx}" y="420" text-anchor="middle" font-family="${F_SERIF}" font-style="italic" font-weight="400" font-size="62" fill="#d9b25f">vous offre un tour de roue</text>
<circle cx="${cx}" cy="${cy}" r="${R}" fill="#d9b25f"/>
<circle cx="${cx}" cy="${cy}" r="${R - 14}" fill="none" stroke="#1f3a2e" stroke-width="5"/>
<circle cx="${cx}" cy="${cy}" r="${R - 112}" fill="#efe4c8"/>
<circle cx="${cx}" cy="${cy}" r="${R - 126}" fill="none" stroke="#1f3a2e" stroke-width="3"/>
<text font-family="${F_SANS}" font-weight="800" font-size="54" fill="#1f3a2e" letter-spacing="6"><textPath href="#haut" startOffset="50%" text-anchor="middle">SCANNEZ ET TOURNEZ</textPath></text>
<text font-family="${F_SANS}" font-weight="800" font-size="54" fill="#1f3a2e" letter-spacing="6" dy="40"><textPath href="#bas" startOffset="50%" text-anchor="middle">GAGNEZ UN CADEAU</textPath></text>
${etoiles}
${qr(o.url, cx - Q / 2, cy - Q / 2, Q, "#1f3a2e")}
<text x="${cx}" y="1960" text-anchor="middle" font-family="${F_SANS}" font-weight="500" font-size="44" fill="#efe4c8" fill-opacity="0.85">Visez le code avec l'appareil photo de votre téléphone</text>
<text x="${cx}" y="1890" text-anchor="middle" font-family="${F_SERIF}" font-weight="600" font-size="84" fill="#efe4c8">Une chance à chaque visite</text>
<rect width="${W}" height="${H}" filter="url(#gs)" fill="#000"/>`)
}

// ---------------------------------------------------------------------------------------------
// 4. Carte rouge : composition editoriale, alignee a gauche, beaucoup d'air
function carte(o: OptionsFlyer) {
  const m = 130
  const Q = 560
  return svg(o, `<radialGradient id="cg" cx="20%" cy="10%" r="110%"><stop offset="0" stop-color="#7d2638"/><stop offset="1" stop-color="#4e1220"/></radialGradient>${GRAIN("gc", 0.16)}`, `
<rect width="${W}" height="${H}" fill="url(#cg)"/>
${nomOuLogo(o, m, 300, W - 2 * m, 220, "start", `font-family="${F_SERIF}" font-weight="300" fill="#f6ead2" letter-spacing="-2"`, 150)}
<line x1="${m}" y1="390" x2="${m + 220}" y2="390" stroke="#c9962c" stroke-width="6"/>
<text font-family="${F_SERIF}" font-weight="300" font-size="116" fill="#f6ead2">
  <tspan x="${m}" y="760">Scannez,</tspan>
  <tspan x="${m}" y="900">tournez la roue,</tspan>
  <tspan x="${m}" y="1040" font-style="italic" fill="#e6c27a">gagnez peut-être</tspan>
  <tspan x="${m}" y="1180" font-style="italic" fill="#e6c27a">un cadeau.</tspan>
</text>
<rect x="${W - m - Q - 60}" y="${H - m - Q - 60}" width="${Q + 60}" height="${Q + 60}" fill="#f6ead2"/>
${qr(o.url, W - m - Q - 30, H - m - Q - 30, Q, "#3d0f1a")}
<text font-family="${F_SANS}" font-weight="500" font-size="40" fill="#f6ead2" fill-opacity="0.82">
  <tspan x="${m}" y="${H - m - 230}">Avec l'appareil photo</tspan>
  <tspan x="${m}" y="${H - m - 178}">de votre téléphone,</tspan>
  <tspan x="${m}" y="${H - m - 126}">sans application.</tspan>
</text>
<g transform="translate(${m} ${H - m - 60}) scale(2.4)" fill="none" stroke="#c9962c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></g>
<rect width="${W}" height="${H}" filter="url(#gc)" fill="#000"/>`)
}

export function flyerSvg(modele: string, o: OptionsFlyer): string {
  if (modele === "ticket") return ticket(o)
  if (modele === "sceau") return sceau(o)
  if (modele === "carte") return carte(o)
  return foraine(o)
}
