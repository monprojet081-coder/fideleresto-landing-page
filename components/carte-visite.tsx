"use client"

import { useState } from "react"
import { Check, Globe, Mail, Phone, QrCode, RotateCcw, Share2, UserPlus } from "lucide-react"
import { CARTE, NOM_COMPLET } from "@/lib/carte-contact"

function Filet() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      <span className="h-px w-10 bg-gold/60" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="h-px w-10 bg-gold/60" />
    </div>
  )
}

function Ligne({ href, icone, libelle, valeur, externe }: { href: string; icone: React.ReactNode; libelle: string; valeur: string; externe?: boolean }) {
  return (
    <a
      href={href}
      {...(externe ? { target: "_blank", rel: "noopener" } : {})}
      className="group flex min-h-14 items-center gap-3.5 rounded-2xl px-3 py-2 transition-colors hover:bg-wine/5 active:bg-wine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wine text-gold-light shadow-sm shadow-wine/30">
        {icone}
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-ink/55">{libelle}</span>
        <span className="block truncate text-[15px] font-semibold text-ink">{valeur}</span>
      </span>
    </a>
  )
}

export function CarteVisite({ qrSvg }: { qrSvg: string }) {
  const [verso, setVerso] = useState(false)
  const [copie, setCopie] = useState(false)

  async function partager() {
    const donnees = {
      title: `${NOM_COMPLET} · FidèleResto`,
      text: `${NOM_COMPLET}, ${CARTE.titre.toLowerCase()} de FidèleResto. Ma carte de visite :`,
      url: CARTE.url,
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(donnees)
        return
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(CARTE.url)
    } catch {
      const zone = document.createElement("textarea")
      zone.value = CARTE.url
      zone.setAttribute("readonly", "")
      zone.style.position = "fixed"
      zone.style.opacity = "0"
      document.body.appendChild(zone)
      zone.select()
      document.execCommand("copy")
      zone.remove()
    }
    setCopie(true)
    setTimeout(() => setCopie(false), 2200)
  }

  return (
    <div className="relative z-10 w-full max-w-[380px]">
      {/* La carte : recto (coordonnées) / verso (QR code), retournable */}
      <div className="[perspective:1400px]">
        <div
          className={`grid transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none ${
            verso ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Recto */}
          <section
            aria-hidden={verso}
            className="relative [grid-area:1/1] overflow-hidden rounded-[28px] bg-ivory px-6 pb-6 pt-8 shadow-2xl shadow-black/50 [backface-visibility:hidden]"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-gold/45" />

            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logo-icone.webp" alt="" width={34} height={32} className="h-8 w-auto" />
                <span className="font-display text-[22px] font-semibold tracking-tight">
                  <span className="text-wine">Fidèle</span>
                  <span className="text-gold">Resto</span>
                </span>
              </div>

              <h1 className="mt-7 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-wine-dark">
                {NOM_COMPLET}
              </h1>
              <p className="mt-2 text-[11.5px] font-semibold uppercase tracking-[0.24em] text-gold">
                {CARTE.titre} · {CARTE.entreprise}
              </p>

              <div className="mt-5">
                <Filet />
              </div>

              <p className="mt-5 max-w-[30ch] text-pretty text-[14.5px] leading-relaxed text-ink/75">{CARTE.accroche}</p>
            </div>

            <div className="relative mt-6 flex flex-col gap-1 border-t border-wine/10 pt-4">
              <Ligne href={`tel:${CARTE.telephone}`} icone={<Phone className="size-[18px]" aria-hidden="true" />} libelle="Téléphone" valeur={CARTE.telephoneAffiche} />
              <Ligne href={`mailto:${CARTE.email}`} icone={<Mail className="size-[18px]" aria-hidden="true" />} libelle="Email" valeur={CARTE.email} />
              <Ligne href={CARTE.site} externe icone={<Globe className="size-[18px]" aria-hidden="true" />} libelle="Site" valeur={CARTE.siteAffiche} />
            </div>

            <p className="relative mt-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-ink/45">{CARTE.region}</p>
          </section>

          {/* Verso */}
          <section
            aria-hidden={!verso}
            className="relative flex [grid-area:1/1] flex-col items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-b from-wine to-wine-dark px-7 py-8 text-center shadow-2xl shadow-black/50 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-gold/40" />
            <p className="relative text-[11.5px] font-semibold uppercase tracking-[0.24em] text-gold">Scannez pour enregistrer</p>
            <p className="relative mt-2 font-display text-[26px] font-semibold leading-tight text-ivory">{NOM_COMPLET}</p>
            <div className="relative mt-6 w-full max-w-[250px] rounded-3xl bg-ivory p-5 shadow-xl shadow-black/30">
              <div className="aspect-square w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <p className="relative mt-5 text-sm text-ivory/75">fideleresto.fr/contact</p>
            <div className="relative mt-5">
              <Filet />
            </div>
          </section>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <a
          href="/contact/vcard"
          download="Victor-Ehrenbogen-FideleResto.vcf"
          className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-gold text-[16px] font-semibold text-wine-dark shadow-lg shadow-black/30 transition-colors hover:bg-gold-light active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
        >
          <UserPlus className="size-5" aria-hidden="true" />
          Enregistrer le contact
        </a>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={partager}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-ivory/20 bg-ivory/5 text-[15px] font-medium text-ivory transition-colors hover:bg-ivory/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
          >
            {copie ? <Check className="size-[18px] text-gold-light" aria-hidden="true" /> : <Share2 className="size-[18px]" aria-hidden="true" />}
            {copie ? "Lien copié" : "Partager"}
          </button>
          <button
            type="button"
            onClick={() => setVerso((v) => !v)}
            aria-pressed={verso}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-ivory/20 bg-ivory/5 text-[15px] font-medium text-ivory transition-colors hover:bg-ivory/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
          >
            {verso ? <RotateCcw className="size-[18px]" aria-hidden="true" /> : <QrCode className="size-[18px]" aria-hidden="true" />}
            {verso ? "Coordonnées" : "QR code"}
          </button>
        </div>
        <p role="status" aria-live="polite" className="sr-only">{copie ? "Lien de la carte copié" : ""}</p>
      </div>
    </div>
  )
}
