import { Button } from "@/components/ui/button"

// Le panneau "ticket" a droite est un element graphique a part entiere, en attente
// d'etre remplace/enrichi par l'asset hero fourni par le client. Pas d'illustration
// recreee ici : uniquement de la couleur, de la forme et du texte reel.
function TicketPanel() {
  const lignes = [
    { chiffre: "1 scan", texte: "suffit pour jouer, aucune appli à installer" },
    { chiffre: "0 €", texte: "dépensé en pub pour faire revenir vos habitués" },
    { chiffre: "24 h", texte: "chrono pour voir vos premiers clients rejouer" },
  ]

  return (
    <div className="relative mx-auto w-full max-w-sm lg:mx-0">
      <div className="relative overflow-hidden rounded-[28px] bg-wine text-ivory shadow-2xl shadow-wine/30">
        {/* Bord perfore haut, comme un ticket qu'on detache */}
        <div
          className="h-5 bg-ivory"
          style={{
            maskImage: "radial-gradient(circle at 10px 2.5px, transparent 6px, black 6.5px)",
            maskSize: "20px 20px",
            maskRepeat: "repeat-x",
            WebkitMaskImage: "radial-gradient(circle at 10px 2.5px, transparent 6px, black 6.5px)",
            WebkitMaskSize: "20px 20px",
            WebkitMaskRepeat: "repeat-x",
          }}
          aria-hidden="true"
        />

        <div className="px-8 py-9">
          <p className="font-display text-base italic text-gold-light/70">
            Depuis votre table
          </p>

          <div className="mt-7 space-y-6">
            {lignes.map((l) => (
              <div key={l.texte} className="flex items-baseline gap-4 border-t border-gold-light/15 pt-6 first:border-0 first:pt-0">
                <span className="shrink-0 whitespace-nowrap font-display text-3xl font-semibold text-gold-light">{l.chiffre}</span>
                <span className="text-sm leading-snug text-ivory/80">{l.texte}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="h-5 bg-ivory"
          style={{
            maskImage: "radial-gradient(circle at 10px 2.5px, transparent 6px, black 6.5px)",
            maskSize: "20px 20px",
            maskRepeat: "repeat-x",
            WebkitMaskImage: "radial-gradient(circle at 10px 2.5px, transparent 6px, black 6.5px)",
            WebkitMaskSize: "20px 20px",
            WebkitMaskRepeat: "repeat-x",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Tampon dore, comme une carte de fidelite validee */}
      <div className="absolute -right-5 -top-5 flex size-20 rotate-[8deg] items-center justify-center rounded-full border-2 border-gold bg-ivory text-center shadow-lg">
        <span className="font-display text-xs font-semibold leading-tight text-wine">
          Prêt en<br />5 min
        </span>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ivory pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <h1 className="text-balance font-display font-semibold tracking-tight text-ink">
              <span className="block text-4xl sm:text-5xl md:text-[3.4rem] md:leading-[1.05]">
                Vos clients reviennent
              </span>
              <span className="mt-1 block text-5xl text-wine sm:text-6xl md:text-7xl md:leading-[1.02]">
                ou ils ne reviennent pas.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-pretty text-lg leading-relaxed text-ink/65">
              FidèleResto glisse une roue de la chance derrière le QR code de vos tables. Le client joue,
              gagne, laisse un avis Google et revient — vous, vous récupérez ses coordonnées et suivez
              tout depuis un tableau de bord.
            </p>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 bg-wine px-7 text-base text-gold-light shadow-lg shadow-wine/20 hover:bg-wine-dark"
                nativeButton={false}
                render={<a href="/inscription?plan=standard_mensuel" />}
              >
                Essayer gratuitement 14 jours
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-12 px-3 text-base text-ink underline decoration-wine/30 decoration-2 underline-offset-4 hover:bg-transparent hover:text-wine"
                nativeButton={false}
                render={<a href="#comment-ca-marche" />}
              >
                Voir comment ça marche
              </Button>
            </div>
          </div>

          <TicketPanel />
        </div>
      </div>
    </section>
  )
}
