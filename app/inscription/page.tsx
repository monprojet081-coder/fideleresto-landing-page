import { SiteHeader } from "@/components/site-header"
import { SignupForm } from "@/components/signup-form"
import { SiteFooter } from "@/components/site-footer"
// Page dynamique par nature (session utilisateur, donnees en temps reel) : jamais
// prerenderee statiquement au build, ce qui evitait un plantage du build Vercel
// quand cette page touchait des variables d'env cote client au mauvais moment
export const dynamic = 'force-dynamic'

export default function InscriptionPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-16">
        <SignupForm />
      </main>
      <SiteFooter />
    </div>
  )
}