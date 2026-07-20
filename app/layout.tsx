import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
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
  title: 'FidèleResto — Fidélisez vos clients et boostez vos avis Google',
  description:
    'FidèleResto aide les restaurateurs à fidéliser leurs clients et à multiplier leurs avis Google grâce à un QR code, une roue de la fidélité et des récompenses.',
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
    title: 'FidèleResto — Fidélisez vos clients et boostez vos avis Google',
    description:
      'FidèleResto aide les restaurateurs à fidéliser leurs clients et à multiplier leurs avis Google grâce à un QR code, une roue de la fidélité et des récompenses.',
    url: 'https://fideleresto.fr',
    siteName: 'FidèleResto',
    locale: 'fr_FR',
    type: 'website',
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
    "FidèleResto aide les restaurateurs à fidéliser leurs clients et à multiplier leurs avis Google grâce à un QR code, une roue de la fidélité et des récompenses.",
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
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
