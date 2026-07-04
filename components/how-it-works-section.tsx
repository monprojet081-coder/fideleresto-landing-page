import { QrCode, Disc3, Gift } from "lucide-react"

const steps = [
  {
    icon: QrCode,
    title: "Scannez le QR code",
    description:
      "Le client scanne le QR code unique présent sur sa table, son addition ou sa vitrine. Aucune application à télécharger.",
    illustration: "qr",
  },
  {
    icon: Disc3,
    title: "Tournez la roue",
    description:
      "Il fait tourner la roue de la fidélité et laisse un avis Google en quelques secondes pour tenter sa chance.",
    illustration: "wheel",
  },
  {
    icon: Gift,
    title: "Recevez votre récompense",
    description:
      "Café offert, dessert gratuit, réduction… Le client gagne une récompense et a une vraie raison de revenir.",
    illustration: "gift",
  },
]

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="relative overflow-hidden border-t border-wine/10 bg-secondary/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-wine">
            Comment ça marche
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Trois étapes, zéro friction
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            Un parcours pensé pour vos clients, qui prend moins d&apos;une minute et fonctionne sans application.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-20 hidden h-px w-full translate-x-8 border-t border-dashed border-gold/50 md:block" />
              )}

              {/* Illustration décorative propre à chaque étape */}
              <div className="relative flex size-40 items-center justify-center overflow-hidden rounded-2xl border border-wine/10 bg-card shadow-md shadow-wine/5">
                {step.illustration === "qr" && (
                  <svg viewBox="0 0 160 160" className="size-full" aria-hidden="true">
                    <rect width="160" height="160" fill="var(--ivory)" />
                    {[18, 42, 66, 90, 114].map((y) =>
                      [18, 42, 66, 90, 114].map((x) => (
                        <rect
                          key={`${x}-${y}`}
                          x={x}
                          y={y}
                          width="16"
                          height="16"
                          rx="2"
                          fill={(x + y) % 48 === 0 ? "var(--wine)" : "var(--gold)"}
                          opacity={(x + y) % 36 === 0 ? 1 : 0.55}
                        />
                      ))
                    )}
                  </svg>
                )}
                {step.illustration === "wheel" && (
                  <svg viewBox="0 0 160 160" className="size-24" aria-hidden="true">
                    <g style={{ transform: "rotate(-10deg)", transformOrigin: "80px 80px" }}>
                      <path d="M80,80 L80,8 A72,72 0 0,1 142.4,44 Z" fill="var(--wine)" />
                      <path d="M80,80 L142.4,44 A72,72 0 0,1 142.4,116 Z" fill="var(--gold)" />
                      <path d="M80,80 L142.4,116 A72,72 0 0,1 80,152 Z" fill="var(--sage)" />
                      <path d="M80,80 L80,152 A72,72 0 0,1 17.6,116 Z" fill="#a8536a" />
                      <path d="M80,80 L17.6,116 A72,72 0 0,1 17.6,44 Z" fill="var(--wine-dark)" />
                      <path d="M80,80 L17.6,44 A72,72 0 0,1 80,8 Z" fill="var(--gold-light)" />
                      <circle cx="80" cy="80" r="72" fill="none" stroke="var(--ivory)" strokeWidth="3" />
                    </g>
                    <circle cx="80" cy="80" r="13" fill="var(--ivory)" />
                    <path d="M80 4 L72 16 L88 16 Z" fill="var(--ink)" />
                  </svg>
                )}
                {step.illustration === "gift" && (
                  <svg viewBox="0 0 160 160" className="size-24" aria-hidden="true">
                    <rect x="30" y="70" width="100" height="70" rx="6" fill="var(--wine)" />
                    <rect x="30" y="70" width="100" height="20" fill="var(--wine-dark)" />
                    <rect x="72" y="70" width="16" height="70" fill="var(--gold)" />
                    <path
                      d="M80,70 C60,70 55,50 68,45 C78,42 80,60 80,70 C80,60 82,42 92,45 C105,50 100,70 80,70 Z"
                      fill="var(--gold)"
                    />
                  </svg>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 border-t border-dashed border-wine/15 bg-card/95 py-2">
                  <step.icon className="size-4 text-wine" aria-hidden="true" />
                  <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-wine-dark">
                    {index + 1}
                  </span>
                </div>
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 text-pretty leading-relaxed text-ink/65">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}