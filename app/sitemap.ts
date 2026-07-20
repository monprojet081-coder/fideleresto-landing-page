import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fideleresto.fr'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
