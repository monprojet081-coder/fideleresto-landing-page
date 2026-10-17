// Fond bordeaux commun aux pages de cartes de visite
export function FondCarte({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#2a0b13] px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,#6b1e2e_0%,#2a0b13_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      {children}
    </main>
  )
}
