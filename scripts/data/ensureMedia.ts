import type { Payload } from 'payload'
import path from 'node:path'
import type { MediaRefs } from './buildPageBlocks'
export async function ensureMedia(payload: Payload): Promise<MediaRefs> {
  const files = {
    hero: ['public/design/hero-fonster.jpg', 'Hantverkare monterar ett nytt fönster'],
    badrum: ['public/design/badrum.jpg', 'Exempelbild av badrum'],
    kok: ['public/design/kok.jpg', 'Exempelbild av kök'],
    hantverk: ['public/design/hantverk.jpg', 'Exempelbild av hantverk'],
    heroPoster: ['public/bakgrundsvideo-frame-1.jpg', 'Vy över Göteborg'],
    headerLogo: ['public/logo-dk.png', 'DK Byggkoncept'],
    footerLogo: ['public/logo-dk-vit.png', 'DK Byggkoncept'],
  }
  const media: MediaRefs = {}
  for (const [key, [filename, alt]] of Object.entries(files)) {
    const existing = await payload.find({
      collection: 'media',
      where: { seedKey: { equals: `lovable-${key}` } },
      limit: 1,
      depth: 0,
    })
    const document =
      existing.docs[0] ||
      (await payload.create({
        collection: 'media',
        context: { disableRevalidate: true },
        data: { seedKey: `lovable-${key}`, alt },
        filePath: path.resolve(filename),
      }))
    media[key] = document.id
  }
  media.fonster = media.hero
  return media
}
