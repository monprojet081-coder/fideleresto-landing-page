import type { MetadataRoute } from 'next'
import { guides } from '@/lib/guides'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fideleresto.fr'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/inscription`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...guides.map((g) => ({
      url: `${base}/guides/${g.slug}`,
      lastModified: new Date(g.publieLe),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
