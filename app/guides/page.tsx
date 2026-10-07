import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { guides } from "@/lib/guides"

export const metadata: Metadata = {
  title: "Guides pour restaurateurs : fidélité, avis Google, QR code",
  description:
    "Guides pratiques pour les restaurants indépendants : carte de fidélité digitale, avis Google, roue de la fortune QR code et idées pour fidéliser ses clients.",
  alternates: { canonical: "/guides" },
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">Guides pour restaurateurs</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/70">
          Des conseils concrets pour faire revenir vos clients et améliorer votre visibilité sur Google.
        </p>
        <ul className="mt-10 divide-y divide-wine/10 border-y border-wine/10">
          {guides.map((g) => (
            <li key={g.slug} className="py-6">
              <Link href={`/guides/${g.slug}`} className="group block">
                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-wine sm:text-2xl">{g.titre}</h2>
                <p className="mt-2 text-base leading-relaxed text-ink/65">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  )
}
