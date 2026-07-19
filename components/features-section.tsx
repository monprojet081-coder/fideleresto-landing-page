import { Star, CreditCard, Mail, BarChart3, Printer, ShieldAlert } from "lucide-react"

const coreFeatures = [
  {
    title: "Roue de la chance",
    description:
      "Vos clients scannent un QR code sur la table, tournent la roue et gagnent une récompense que vous choisissez.",
    visual: (
      <svg viewBox="0 0 100 100" className="size-16" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--wine)" strokeWidth="3" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8
          const x2 = 50 + 42 * Math.cos((angle * Math.PI) / 180)
          const y2 = 50 + 42 * Math.sin((angle * Math.PI) / 180)
          return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="var(--gold)" strokeWidth="1.5" opacity="0.6" />
        })}
        <circle cx="50" cy="50" r="6" fill="var(--gold)" />
        <path d="M50 4 L45 14 L55 14 Z" fill="var(--wine)" />
      </svg>
    ),
  },
  {
    title: "Plus d'avis Google",
    description:
      "Après avoir joué, vos clients laissent un avis sur votre fiche Google en un clic. Votre note grimpe, votre visibilité aussi.",
    visual: (
      <div className="flex flex-col items-center gap-2" aria-hidden="true">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-5 fill-gold text-gold" />
          ))}
        </div>
        <span className="font-display text-2xl font-semibold text-wine">4.8</span>
      </div>
    ),
  },
  {
    title: "Carte de fidélité digitale",
    description:
      "Fini les cartes en carton qu'on perd. Vos clients cumulent leurs tampons sur leur téléphone, sans rien à faire de votre côté.",
    visual: (
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={`flex size-5 items-center justify-center rounded-full border-2 ${
              i < 5 ? "border-wine bg-wine text-gold-light" : "border-wine/25 text-wine/25"
            }`}
          >
            <CreditCard className="size-2.5" />
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Menu digital",
    description:
      "Importez votre carte (PDF, photo ou document) et vos clients la consultent depuis leur téléphone, toujours à jour.",
    visual: (
      <div className="w-full space-y-1.5 px-2" aria-hidden="true">
        <div className="h-1.5 w-3/4 rounded-full bg-wine/40" />
        <div className="h-1.5 w-full rounded-full bg-ink/15" />
        <div className="h-1.5 w-2/3 rounded-full bg-ink/15" />
        <div className="mt-2 h-1.5 w-3/5 rounded-full bg-wine/40" />
        <div className="h-1.5 w-full rounded-full bg-ink/15" />
      </div>
    ),
  },
]

const secondaryFeatures = [
  {
    icon: Mail,
    title: "Emails de relance automatiques",
    description:
      "Un client n'est pas revenu depuis un moment ? FidèleResto lui envoie automatiquement une petite offre pour le faire revenir, avec son accord.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord clair",
    description:
      "Suivez vos scans, vos clients collectés, vos récompenses distribuées et vos avis, tout au même endroit, en temps réel.",
  },
  {
    icon: Printer,
    title: "Flyers prêts à imprimer",
    description:
      "Choisissez parmi plusieurs modèles de flyers à votre nom, avec votre QR code intégré, prêts à poser sur vos tables ou votre comptoir.",
  },
  {
    icon: ShieldAlert,
    title: "Alerte insatisfaction",
    badge: "Premium",
    description:
      "Un client déçu ? Son retour vous arrive directement par email au lieu d'atterrir en public sur Google.",
  },
]

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="relative overflow-hidden bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-wine">
            Fonctionnalités
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tout ce qu&apos;il faut pour remplir votre salle
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            Une seule plateforme pour fidéliser vos clients, soigner votre réputation et garder le contact,
            sans compétence technique.
          </p>
        </div>

        {/* 4 fonctionnalités principales, avec mockup visuel */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-wine/12 bg-card transition-all hover:border-gold/40 hover:shadow-xl hover:shadow-wine/5"
            >
              <div className="flex h-32 items-center justify-center border-b border-dashed border-wine/15 bg-secondary/40">
                {feature.visual}
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink/65">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4 fonctionnalités complémentaires, format compact */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-wine/12 bg-card p-5 transition-all hover:border-gold/40"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-wine/8 text-wine">
                <feature.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <h3 className="font-display text-sm font-semibold text-ink">{feature.title}</h3>
                {feature.badge && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-wine-dark">
                    {feature.badge}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-pretty text-xs leading-relaxed text-ink/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
