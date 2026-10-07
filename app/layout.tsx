import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { ReferralTracker } from '@/components/referral-tracker'
import { VisitTracker } from '@/components/visit-tracker'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fideleresto.fr'),
  title: {
    default: 'FidèleResto — Logiciel de fidélité pour restaurant',
    template: '%s | FidèleResto',
  },
  description:
    "Logiciel de fidélité pour restaurants indépendants : QR code sur table, roue de la fidélité, carte de fidélité digitale, relances email et plus d'avis Google. Sans application à installer. Essai gratuit 14 jours.",
  keywords: [
    'logiciel fidélité restaurant',
    'carte de fidélité digitale restaurant',
    'programme de fidélité restaurant',
    'roue de la fortune QR code restaurant',
    'avis Google restaurant',
    'fidéliser clients restaurant',
    'QR code restaurant',
  ],
  applicationName: 'FidèleResto',
  icons: {
    icon: [
      {
        url: '/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'FidèleResto — Faites revenir vos clients',
    description:
      "QR code sur table, roue de la fidélité, carte de fidélité digitale et plus d'avis Google pour les restaurants indépendants.",
    url: 'https://fideleresto.fr',
    siteName: 'FidèleResto',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FidèleResto — Faites revenir vos clients',
    description:
      "QR code sur table, roue de la fidélité, carte de fidélité digitale et plus d'avis Google pour les restaurants indépendants.",
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FidèleResto',
  alternateName: ['Fidele Resto', 'Fidèle Resto', 'Fideleresto'],
  url: 'https://fideleresto.fr',
  logo: 'https://fideleresto.fr/icon-512x512.png',
  description:
    "Logiciel de fidélité pour restaurants indépendants : QR code, roue de la fidélité, carte de fidélité digitale et relances email.",
  email: 'contact@fideleresto.fr',
  areaServed: 'FR',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`light bg-background ${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ReferralTracker />
        <VisitTracker />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
