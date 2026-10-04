import Image from "next/image"

const etapes = [
  {
    numero: "1",
    titre: "Il scanne",
    texte:
      "Le QR code est posé sur la table ou sur l'addition. Aucune application à installer : ça s'ouvre directement dans le navigateur de son téléphone.",
  },
  {
    numero: "2",
    titre: "Il joue",
    texte:
      "La roue tourne et il gagne une récompense en quelques secondes : un café, un dessert, une réduction... selon ce que vous avez choisi.",
  },
  {
    numero: "3",
    titre: "Il revient",
    texte:
      "Il reçoit sa récompense par email, avec un QR code à présenter au comptoir au moment de payer. Il peut aussi laisser un avis Google, sans aucune obligation.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="relative overflow-hidden border-t border-wine/10 bg-secondary/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            De la table au comptoir, en trois gestes
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/70">
            Aucun compte à créer côté client, aucune installation. Le client joue en moins d&apos;une minute,
            et vous gagnez une raison de plus de le revoir.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <figure className="overflow-hidden rounded-[28px] shadow-xl shadow-wine/15">
            <Image
              src="/assets/scan-qr-restaurant.webp"
              alt="Un client scanne avec son téléphone le QR code FidèleResto posé sur un chevalet bordeaux, sur la table d'un restaurant"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 640px, 100vw"
              className="h-auto w-full"
            />
          </figure>

          <ol className="divide-y divide-wine/15 border-y border-wine/15">
            {etapes.map((etape) => (
              <li key={etape.numero} className="flex gap-6 py-7">
                <span className="w-10 shrink-0 font-display text-5xl font-semibold leading-none text-gold" aria-hidden="true">
                  {etape.numero}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">{etape.titre}</h3>
                  <p className="mt-2 text-pretty text-base leading-relaxed text-ink/70">{etape.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
