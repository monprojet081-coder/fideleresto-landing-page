import { Disc3, Star, CreditCard, BookOpen, Mail, BarChart3, Printer, ShieldAlert } from "lucide-react"

const features = [
  {
    icon: Disc3,
    title: "Roue de la chance",
    description:
      "Vos clients scannent un QR code sur la table, tournent la roue et gagnent une récompense que vous choisissez. Un petit jeu qui leur donne une vraie raison de revenir.",
  },
  {
    icon: Star,
    title: "Plus d'avis Google",
    description:
      "Après avoir joué, vos clients sont invités à laisser un avis sur votre fiche Google en un clic. Votre note grimpe, votre visibilité locale aussi.",
  },
  {
    icon: CreditCard,
    title: "Carte de fidélité digitale",
    description:
      "Fini les cartes en carton qu'on perd. Vos clients cumulent leurs tampons sur leur téléphone et débloquent leur récompense automatiquement.",
  },
  {
    icon: BookOpen,
    title: "Menu digital",
    description:
      "Importez votre carte (PDF, photo ou document) et vos clients la consultent directement depuis leur téléphone, toujours à jour.",
  },
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
      "Un client déçu ? Son retour vous arrive directement par email au lieu d'atterrir en public sur Google. Vous rattrapez la situation avant qu'elle ne coûte cher.",
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

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-wine/12 bg-card p-6 transition-all hover:border-gold/40 hover:shadow-xl hover:shadow-wine/5"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-wine/8 text-wine transition-all group-hover:bg-wine group-hover:text-gold-light">
                <feature.icon className="size-6" aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-ink">{feature.title}</h3>
                {feature.badge && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-wine-dark">
                    {feature.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 text-pretty leading-relaxed text-ink/65">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
