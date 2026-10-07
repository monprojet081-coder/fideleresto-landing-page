import { Plus } from "lucide-react"
import { faq } from "@/lib/faq"

export function FaqSection() {
  return (
    <section id="faq" className="relative border-t border-wine/10 bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Questions fréquentes
        </h2>

        <div className="mt-10 divide-y divide-wine/10 border-y border-wine/10">
          {faq.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <Plus
                  className="mt-1 size-5 shrink-0 text-wine transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 pr-8 text-base leading-relaxed text-ink/70">{item.reponse}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
