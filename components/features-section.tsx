import { Star, CreditCard, Mail, BarChart3, Printer, ShieldAlert, UtensilsCrossed } from "lucide-react"

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
      <div className="w-full space-y-2.5 px-3" aria-hidden="true">
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-wine/50" />
          <UtensilsCrossed className="size-3.5 text-gold" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="h-1.5 w-16 rounded-full bg-ink/15" />
            <span className="shrink-0 text-[9px] font-semibold text-wine">12€</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="h-1.5 w-20 rounded-full bg-ink/15" />
            <span className="shrink-0 text-[9px] font-semibold text-wine">8€</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="h-1.5 w-14 rounded-full bg-ink/15" />
            <span className="shrink-0 text-[9px] font-semibold text-wine">15€</span>
          </div>
        </div>
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
  const [phare, ...reste] = coreFeatures

  return (
    <section id="fonctionnalites" className="relative overflow-hidden bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tout ce qu&apos;il faut pour remplir votre salle
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            Une seule plateforme pour fidéliser vos clients, soigner votre réputation et garder le
            contact, sans compétence technique.
          </p>
        </div>

        {/* La roue, fonctionnalite signature, traitee en grand */}
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col justify-between gap-8 rounded-[28px] border border-wine/12 bg-card p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="max-w-xs">
              <h3 className="font-display text-2xl font-semibold text-ink">{phare.title}</h3>
              <p className="mt-3 text-pretty text-base leading-relaxed text-ink/65">{phare.description}</p>
            </div>
            <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-secondary/50">
              {phare.visual}
            </div>
          </div>

          {/* Les 3 autres fonctionnalites principales, en rang compact */}
          <div className="grid min-w-0 grid-rows-3 gap-5">
            {reste.map((feature) => (
              <div
                key={feature.title}
                className="flex min-w-0 items-center gap-4 rounded-2xl border border-wine/12 bg-card px-5 py-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/50">
                  <div className="scale-[0.4]">{feature.visual}</div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-0.5 truncate text-xs leading-relaxed text-ink/55">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonctionnalites complementaires, en liste simple : pas besoin du meme poids visuel */}
        <div className="mt-14 border-t border-wine/10 pt-10">
          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            {secondaryFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <feature.icon className="mt-0.5 size-5 shrink-0 text-wine/70" aria-hidden="true" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold text-ink">{feature.title}</h3>
                    {feature.badge && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-wine-dark">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-ink/60">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
