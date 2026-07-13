import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function LegalLayout({ title, majDate, children }: { title: string; majDate: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink/55 transition-colors hover:text-wine">
          <ArrowLeft className="size-4" />
          Retour à l'accueil
        </Link>

        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink/45">Dernière mise à jour : {majDate}</p>

        <div className="legal-content mt-10 space-y-6 text-[15px] leading-relaxed text-ink/80">
          {children}
        </div>
      </div>
    </div>
  )
}
