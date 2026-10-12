import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { VideoPresentationSection } from "@/components/video-presentation-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaSection } from "@/components/cta-section"
import { FaqSection } from "@/components/faq-section"
import { faq } from "@/lib/faq"
import { plans } from "@/lib/pricing"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

// Donnees structurees : aident Google a comprendre le produit (logiciel, prix) et la FAQ
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FidèleResto",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://fideleresto.fr",
  description:
    "Logiciel de fidélité pour restaurants : QR code sur table, roue de la fidélité, carte de fidélité digitale, menu digital et relances email.",
  offers: plans.map((p) => ({
    "@type": "Offer",
    name: `Plan ${p.nom}`,
    price: p.prixMensuel,
    priceCurrency: "EUR",
    url: "https://fideleresto.fr/#tarifs",
  })),
}

const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "FidèleResto en 38 secondes",
  description:
    "Présentation de FidèleResto : le client scanne le QR code, tourne la roue de la fidélité, reçoit sa récompense par email et revient la chercher.",
  thumbnailUrl: "https://fideleresto.fr/assets/video-presentation-poster.webp",
  uploadDate: "2026-10-12",
  duration: "PT38S",
  embedUrl: "https://www.youtube.com/embed/3jDmugug0D8",
  contentUrl: "https://youtu.be/3jDmugug0D8",
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.reponse },
  })),
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([softwareJsonLd, videoJsonLd, faqJsonLd]) }}
      />
      <SiteHeader />
      <main>
        <HeroSection />
        <VideoPresentationSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}