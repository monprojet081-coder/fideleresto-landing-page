import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { guides, trouverGuide } from "@/lib/guides"

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = trouverGuide(slug)
  if (!guide) return {}
  return {
    title: guide.metaTitre,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.titre,
      description: guide.description,
      url: `https://fideleresto.fr/guides/${guide.slug}`,
      type: "article",
      locale: "fr_FR",
      siteName: "FidèleResto",
      images: ["/opengraph-image.jpg"],
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = trouverGuide(slug)
  if (!guide) notFound()

  const autres = guides.filter((g) => g.slug !== guide.slug)
  const url = `https://fideleresto.fr/guides/${guide.slug}`
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.titre,
      description: guide.description,
      datePublished: guide.publieLe,
      dateModified: guide.publieLe,
      inLanguage: "fr-FR",
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "FidèleResto", url: "https://fideleresto.fr" },
      publisher: {
        "@type": "Organization",
        name: "FidèleResto",
        logo: { "@type": "ImageObject", url: "https://fideleresto.fr/icon-512x512.png" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://fideleresto.fr" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://fideleresto.fr/guides" },
        { "@type": "ListItem", position: 3, name: guide.titre, item: url },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink/50">
          <Link href="/" className="hover:text-wine">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-wine">Guides</Link>
        </nav>

        <article>
          <h1 className="mt-5 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.08]">
            {guide.titre}
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-ink/75">{guide.intro}</p>

          {guide.sections.map((section) => (
            <section key={section.titre} className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-ink">{section.titre}</h2>
              {section.blocs.map((bloc, i) =>
                bloc.type === "p" ? (
                  <p key={i} className="mt-4 text-base leading-relaxed text-ink/75 sm:text-[17px]">
                    {bloc.texte}
                  </p>
                ) : (
                  <ul key={i} className="mt-4 space-y-2.5">
                    {bloc.items.map((item) => (
                      <li key={item} className="flex gap-3 text-base leading-relaxed text-ink/75 sm:text-[17px]">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </article>

        <aside className="mt-14 rounded-2xl bg-wine p-7 text-center sm:p-9">
          <p className="font-display text-2xl font-semibold text-gold-light">Essayez FidèleResto dans votre restaurant</p>
          <p className="mt-3 text-ivory/75">
            QR code, roue de la fidélité, carte de fidélité digitale et relances email. 14 jours d&apos;essai gratuit.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/inscription?plan=standard_mensuel"
              className="rounded-lg bg-gold px-6 py-3 font-medium text-wine-dark transition-colors hover:bg-gold-light"
            >
              Essayer gratuitement
            </a>
            <a href="/#tarifs" className="text-gold-light underline underline-offset-4 hover:text-ivory">
              Voir les tarifs
            </a>
          </div>
        </aside>

        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink">À lire aussi</h2>
          <ul className="mt-4 space-y-3">
            {autres.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-wine underline-offset-4 hover:underline">
                  {g.titre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
