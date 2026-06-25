import { UtensilsCrossed } from "lucide-react"

const legalLinks = [
  { label: "Mentions légales", href: "#" },
  { label: "Conditions générales", href: "#" },
  { label: "Politique de confidentialité", href: "#" },
  { label: "Cookies", href: "#" },
  { label: "Contact", href: "#" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <a href="#" className="flex items-center gap-2" aria-label="FidèleResto, accueil">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-4" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Fidèle<span className="text-primary">Resto</span>
            </span>
          </a>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Liens légaux">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FidèleResto. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
