import Image from "next/image"

export function TestimonialsSection() {
  return (
    <section id="resultats" className="relative overflow-hidden border-t border-wine/10 bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ce que FidèleResto change, concrètement
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/70">
            L&apos;idée est simple : capter chaque client au moment où il est là, juste après son repas, pour
            lui donner une raison de revenir.
          </p>
        </div>

        {/* Le contenu des images est résumé ici pour les lecteurs d'écran et les moteurs de recherche */}
        <p className="sr-only">
          Exemple illustratif pour un restaurant fictif, « Le Kebab du Centre ». Avant FidèleResto : 3,6 étoiles
          pour 45 avis, peu de clients qui reviennent, peu de clients fidèles, peu d&apos;avis Google, des cartes
          de fidélité papier souvent perdues, un chiffre d&apos;affaires limité et aucun moyen de recontacter les
          clients. Avec FidèleResto : 4,7 étoiles pour 187 avis, 142 nouveaux avis, plus de clients qui
          reviennent, une carte de fidélité digitale, un chiffre d&apos;affaires en hausse et la possibilité de
          recontacter ses clients par email.
        </p>

        <div className="mx-auto mt-12 grid max-w-[440px] items-center gap-4 sm:mt-14 lg:max-w-5xl lg:grid-cols-[1fr_auto_1fr] lg:gap-7">
          <Image
            src="/assets/avant-apres-avant.webp"
            alt="Avant FidèleResto, exemple illustratif : 3,6 étoiles pour 45 avis, peu de clients qui reviennent, peu d'avis Google, des cartes papier perdues, un chiffre d'affaires limité, aucun moyen de recontact"
            width={700}
            height={924}
            sizes="(min-width: 1024px) 480px, 440px"
            loading="lazy"
            className="h-auto w-full"
          />
          <Image
            src="/assets/avant-apres-fleche.webp"
            alt=""
            width={76}
            height={77}
            loading="lazy"
            className="mx-auto h-auto w-9 rotate-90 lg:w-14 lg:rotate-0"
          />
          <Image
            src="/assets/avant-apres-apres.webp"
            alt="Avec FidèleResto, exemple illustratif : 4,7 étoiles pour 187 avis, plus de clients qui reviennent, plus d'avis Google, une carte de fidélité digitale, un chiffre d'affaires en hausse, la possibilité de recontacter ses clients"
            width={700}
            height={942}
            sizes="(min-width: 1024px) 480px, 440px"
            loading="lazy"
            className="h-auto w-full"
          />
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-ink/60">
          Exemple illustratif
        </p>
      </div>
    </section>
  )
}
