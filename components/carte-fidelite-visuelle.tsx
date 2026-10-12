import Image from "next/image"
import { Gift } from "lucide-react"

// Carte de fidelite au style FidèleResto (meme rendu que dans la video de presentation) :
// tampons au logo, derniere case cadeau, barre de progression.
export function CarteFideliteVisuelle({
  nomRestaurant,
  tampons,
  requis,
  recompense,
}: {
  nomRestaurant: string
  tampons: number
  requis: number
  recompense: string
}) {
  const total = Math.max(1, requis)
  const faits = Math.min(tampons, total)
  const restant = Math.max(0, total - faits)
  const complete = restant === 0

  return (
    <div className="overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(61,15,26,0.18)] ring-1 ring-wine/10">
      <div className="flex items-center gap-3 bg-gradient-to-br from-wine to-wine-dark px-5 py-4">
        <Image src="/assets/logo-icone.webp" alt="" width={320} height={304} className="h-8 w-auto" />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-ivory">FidèleResto</p>
          <p className="truncate text-xs text-gold-light/90">{nomRestaurant}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold-light">
          {faits} / {total}
        </span>
      </div>

      <div className="bg-card px-5 pb-5 pt-4">
        <p className="font-display text-base font-semibold text-ink">Ma carte de fidélité</p>

        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {Array.from({ length: total }).map((_, i) => {
            const rempli = i < faits
            const derniere = i === total - 1
            if (derniere) {
              return (
                <span
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-full ${
                    complete
                      ? "bg-gradient-to-br from-gold to-gold-light text-wine-dark shadow-[0_0_18px_rgba(235,198,119,0.8)]"
                      : "border-2 border-dashed border-gold/60 text-gold"
                  }`}
                  title={recompense}
                >
                  <Gift className="size-1/2" aria-hidden="true" />
                </span>
              )
            }
            return (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded-full ${
                  rempli ? "bg-wine shadow-sm ring-2 ring-gold/40" : "border-2 border-dashed border-wine/20"
                }`}
              >
                {rempli && <Image src="/assets/logo-icone.webp" alt="" width={320} height={304} className="h-auto w-[55%]" />}
              </span>
            )
          })}
        </div>

        <div className="mt-4 flex gap-1" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < faits ? "bg-wine" : "bg-wine/10"}`} />
          ))}
        </div>

        <div className={`mt-4 flex items-center gap-3 rounded-xl p-3 ${complete ? "bg-gold/15" : "bg-secondary/60"}`}>
          <Gift className={`size-7 shrink-0 ${complete ? "text-gold" : "text-wine"}`} aria-hidden="true" />
          <p className="text-sm leading-snug text-ink">
            {complete ? (
              <>
                <span className="font-semibold text-wine">Récompense débloquée !</span> {recompense} — présentez votre
                QR code au comptoir.
              </>
            ) : (
              <>
                Encore <span className="font-semibold text-wine">{restant} visite{restant > 1 ? "s" : ""}</span> avant
                votre récompense : <span className="font-medium">{recompense}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
