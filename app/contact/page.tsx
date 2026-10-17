import type { Metadata, Viewport } from "next"
import { ChevronRight, Mail } from "lucide-react"
import { CARTES, ENTREPRISE, nomComplet } from "@/lib/carte-contact"
import { FondCarte } from "@/components/fond-carte"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe FidèleResto : cartes de visite de Bryan Gommenginger et Victor Ehrenbogen.",
  alternates: { canonical: "/contact" },
}

export const viewport: Viewport = { themeColor: "#2a0b13" }

export default function ContactPage() {
  return (
    <FondCarte>
      <div className="relative z-10 w-full max-w-[380px]">
        <a href="/" className="mx-auto flex w-fit items-center gap-2.5" aria-label="FidèleResto, accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-icone.webp" alt="" width={34} height={32} className="h-8 w-auto" />
          <span className="font-display text-[22px] font-semibold tracking-tight">
            <span className="text-ivory">Fidèle</span>
            <span className="text-gold-light">Resto</span>
          </span>
        </a>

        <h1 className="mt-8 text-center font-display text-[30px] font-semibold leading-tight text-ivory">Notre équipe</h1>
        <p className="mt-2 text-center text-[15px] text-ivory/70">Choisissez une carte pour enregistrer le contact.</p>

        <ul className="mt-8 flex flex-col gap-3">
          {CARTES.map((c) => (
            <li key={c.slug}>
              <a
                href={`/contact/${c.slug}`}
                className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-ivory px-5 py-5 shadow-xl shadow-black/40 transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[18px] border border-gold/40" />
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-wine font-display text-lg font-semibold text-gold-light">
                  {c.prenom[0]}
                  {c.nom[0]}
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-[21px] font-semibold leading-tight text-wine-dark">{nomComplet(c)}</span>
                  <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{c.titre}</span>
                </span>
                <ChevronRight className="relative size-5 shrink-0 text-wine/60" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${ENTREPRISE.email}`}
          className="mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl border border-ivory/20 bg-ivory/5 text-[15px] font-medium text-ivory transition-colors hover:bg-ivory/10"
        >
          <Mail className="size-[18px]" aria-hidden="true" />
          {ENTREPRISE.email}
        </a>
      </div>
    </FondCarte>
  )
}
