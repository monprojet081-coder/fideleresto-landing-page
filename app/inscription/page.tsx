import { SiteHeader } from "@/components/site-header"
import { SignupForm } from "@/components/signup-form"
import { SiteFooter } from "@/components/site-footer"

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