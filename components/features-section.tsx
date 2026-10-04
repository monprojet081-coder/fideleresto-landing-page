import Image from "next/image"
import { Check, Mail, BarChart3, Printer, ShieldAlert, QrCode, SlidersHorizontal } from "lucide-react"

const avantagesCarte = [
  "Elle reste dans le téléphone du client : impossible de l'oublier à la maison.",
  "Vous validez chaque passage en scannant son QR code.",
  "Le menu digital se consulte depuis le même lien.",
]

const autresFonctionnalites = [
  {
    icon: SlidersHorizontal,
    title: "Une roue à vos couleurs",
    description:
      "Vous choisissez les récompenses, leur probabilité, la couleur de chaque case et le délai avant qu'un client puisse rejouer.",
  },
  {
    icon: QrCode,
    title: "Récompenses suivies et validées",
    description:
      "Chaque gain arrive par email avec un QR code unique, valable 10 jours et utilisable une seule fois : vous le scannez, c'est validé.",
  },
  {
    icon: Mail,
    title: "Relance automatique",
    description:
      "Un client n'est pas revenu depuis un moment ? FidèleResto lui envoie automatiquement une petite offre pour le faire revenir, avec son accord.",
  },
  {
    icon: ShieldAlert,
    title: "Tri des avis négatifs",
    description:
      "Un client déçu ? Son retour vous arrive directement par email au lieu d'atterrir en public sur Google.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord clair",
    description:
      "Suivez vos scans, vos clients, vos récompenses distribuées et vos avis, tout au même endroit, en temps réel.",
  },
  {
    icon: Printer,
    title: "Flyers prêts à imprimer",
    description:
      "Choisissez parmi plusieurs modèles de flyers à votre nom, avec votre QR code intégré, prêts à poser sur vos tables ou votre comptoir.",
  },
]

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="relative overflow-hidden bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tout ce qu&apos;il faut pour remplir votre salle
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/70">
            Une seule plateforme pour fidéliser vos clients, soigner votre réputation et garder le contact,
            sans compétence technique.
          </p>
        </div>

        {/* La carte de fidélité digitale */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <h3 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink">
              Fini les cartes en carton perdues
            </h3>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/70">
              Chaque client a sa carte de fidélité sur son téléphone, avec ses tampons et la récompense qui
              l&apos;attend. Pas de carte à imprimer, pas de carte oubliée dans un autre manteau.
            </p>
            <ul className="mt-7 space-y-3.5">
              {avantagesCarte.map((texte) => (
                <li key={texte} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-wine">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-base leading-relaxed text-ink">{texte}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <Image
              src="/assets/carte-fidelite-mockup.webp"
              alt="La carte de fidélité digitale FidèleResto sur un smartphone : quatre tampons sur huit et « Encore 3 visites avant votre récompense »"
              width={852}
              height={1334}
              sizes="(min-width: 1024px) 380px, 70vw"
              className="h-auto w-full max-w-[340px] drop-shadow-[0_26px_30px_rgba(66,16,28,0.22)] lg:max-w-[380px]"
            />
          </div>
        </div>

        {/* Les avis Google */}
        <div className="mt-24 sm:mt-28">
          <figure className="relative overflow-hidden rounded-[28px] shadow-xl shadow-wine/15">
            <Image
              src="/assets/avis-google-kebab.webp"
              alt="Illustration : le comptoir d'un kebab avec, en surimpression, la fiche Google du restaurant et plusieurs avis cinq étoiles de clients"
              width={1536}
              height={1024}
              sizes="(min-width: 1152px) 1100px, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="absolute right-3 top-3 rounded-full bg-ink/65 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Illustration : avis fictifs
            </figcaption>
          </figure>

          <div className="relative mx-auto -mt-8 max-w-3xl rounded-3xl bg-wine p-7 text-ivory shadow-2xl shadow-wine/30 sm:-mt-20 sm:p-10">
            <h3 className="text-balance font-display text-2xl font-semibold text-gold-light sm:text-3xl">
              Des avis Google, au bon moment
            </h3>
            <p className="mt-3 text-pretty text-base leading-relaxed text-ivory/90 sm:text-lg">
              Après la roue, votre client peut laisser un avis Google en un tap, directement depuis son
              téléphone. Plus besoin de lui tendre un smartphone ni de lui courir après : vous gagnez en
              visibilité sur Google, sans effort.
            </p>
          </div>
        </div>

        {/* Le reste, en liste sobre */}
        <div className="mt-20 border-t border-wine/12 pt-12">
          <div className="grid gap-x-12 gap-y-9 sm:grid-cols-2">
            {autresFonctionnalites.map((fonction) => (
              <div key={fonction.title} className="flex gap-4">
                <fonction.icon className="mt-1 size-5 shrink-0 text-wine/75" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">{fonction.title}</h3>
                  <p className="mt-1.5 text-pretty text-[0.95rem] leading-relaxed text-ink/70">{fonction.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
