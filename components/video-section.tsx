export function VideoSection() {
  return (
    <section className="relative overflow-hidden bg-ivory pb-16 sm:pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="text-balance font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Voyez FidèleResto en action
          </h2>
          <p className="mt-3 text-pretty text-ink/60">
            1min23 pour tout comprendre : la roue, le boost d&apos;avis Google, le menu digital et la carte de fidélité.
          </p>
        </div>

        <div className="rounded-2xl border border-wine/10 bg-card p-2 shadow-xl shadow-wine/5 sm:p-3">
          <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: "56.25%" }}>
            <iframe
              src="https://www.youtube.com/embed/9Dm5AImbNfY"
              title="Présentation de FidèleResto"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  )
}
