import { QrCode, Disc3, Mail, BarChart3, MessageSquareText, BellRing } from "lucide-react"

const features = [
  {
    icon: QrCode,
    title: "QR code unique",
    description:
      "Un QR code personnalisé à votre établissement, à imprimer sur vos tables, additions ou affiches.",
  },
  {
    icon: Disc3,
    title: "Roue de la fidélité",
    description:
      "Un jeu engageant qui récompense vos clients et les incite à revenir encore et encore.",
  },
  {
    icon: Mail,
    title: "Collecte d'emails",
    description:
      "Constituez une base de données clients qualifiée pour vos campagnes et promotions ciblées.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Suivez vos scans, vos récompenses distribuées et le taux de retour de vos clients en temps réel.",
  },
  {
    icon: MessageSquareText,
    title: "Avis Google",
    description:
      "Redirigez automatiquement vos clients satisfaits vers votre fiche Google pour booster votre note.",
  },
  {
    icon: BellRing,
    title: "Alertes insatisfaction",
    description:
      "Soyez alerté immédiatement en cas d'expérience négative pour réagir avant qu'un avis ne soit publié.",
  },
]

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400/5 via-violet-400/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Fonctionnalités
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tout ce qu&apos;il faut pour fidéliser
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Une plateforme complète qui combine fidélisation, collecte de données et gestion de votre e-réputation.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-transparent hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 transition-all group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-violet-600 group-hover:text-white">
                <feature.icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}