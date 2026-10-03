const parcoursAvant = [
  { label: "Il mange", note: null },
  { label: "Il paie", note: null },
  { label: "Il repart", note: "et disparaît de vos radars" },
]

const parcoursApres = [
  { label: "Il mange", note: null },
  { label: "Il scanne et joue", note: "gagne une récompense" },
  { label: "Il note en privé", note: "les avis négatifs restent chez vous" },
  { label: "Il revient", note: "récompense à récupérer sur place" },
]

const chiffres = [
  { avant: "45", apres: "187", label: "avis Google" },
  { avant: "3.6", apres: "4.7", label: "note moyenne" },
]

export function TestimonialsSection() {
  return (
    <section id="resultats" className="relative overflow-hidden bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Ce que FidèleResto change, concrètement
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            L&apos;idée est simple : capter chaque client au moment où il est content, juste après son repas.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* AVANT : parcours court, qui s'arrête net */}
          <div>
            <p className="text-sm font-semibold text-ink/50">Sans FidèleResto</p>
            <div className="mt-5">
              {parcoursAvant.map((etape, i) => (
                <div key={etape.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-2.5 shrink-0 rounded-full bg-ink/25" aria-hidden="true" />
                    {i < parcoursAvant.length - 1 && <span className="my-1 h-10 w-px bg-ink/15" aria-hidden="true" />}
                  </div>
                  <div className="-mt-1 pb-1">
                    <p className="font-display text-lg font-medium text-ink/70">{etape.label}</p>
                    {etape.note && <p className="text-sm text-ink/45">{etape.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* APRES : parcours plus long, qui boucle sur lui-meme */}
          <div>
            <p className="text-sm font-semibold text-wine">Avec FidèleResto</p>
            <div className="mt-5">
              {parcoursApres.map((etape, i) => (
                <div key={etape.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-2.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {i < parcoursApres.length - 1 && <span className="my-1 h-10 w-px bg-gold/40" aria-hidden="true" />}
                  </div>
                  <div className="-mt-1 pb-1">
                    <p className="font-display text-lg font-medium text-ink">{etape.label}</p>
                    {etape.note && <p className="text-sm text-ink/55">{etape.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chiffres d'exemple, en bas, sobres */}
        <div className="mt-14 flex flex-wrap items-center gap-x-12 gap-y-6 border-t border-wine/10 pt-10">
          {chiffres.map((c) => (
            <div key={c.label} className="flex items-baseline gap-3">
              <span className="font-display text-2xl text-ink/35 line-through decoration-1">{c.avant}</span>
              <span className="font-display text-3xl font-semibold text-wine">{c.apres}</span>
              <span className="text-sm text-ink/55">{c.label}</span>
            </div>
          ))}
          <p className="text-xs text-ink/40">Exemple illustratif, les résultats dépendent de votre fréquentation.</p>
        </div>
      </div>
    </section>
  )
}
