import type { Payload } from 'payload'
import path from 'node:path'
import type { MediaRefs } from './buildPageBlocks'

export const serviceImages = [
  ['totalentreprenad', 'Vita bostadshus med terrasser och trädgårdar'],
  ['totalrenovering', 'Hantverkare arbetar med en träkonstruktion'],
  ['lagenhetsrenovering', 'Ljust vardagsrum med soffa och förvaring'],
  ['tillbyggnad', 'Bostadshus med träfasader och trädgårdar'],
  ['samordning', 'Hantverkare monterar ett fönster med skruvdragare'],
  ['lagenhet-detalj', 'Vardagsrum med ljus soffa, gröna växter och naturmaterial'],
] as const

export async function ensureServiceMedia(payload: Payload): Promise<MediaRefs> {
  const refs: MediaRefs = {}
  for (const [key, alt] of serviceImages) {
    const seedKey = `service-${key}`
    const existing = await payload.find({
      collection: 'media',
      where: { seedKey: { equals: seedKey } },
      limit: 1,
      depth: 0,
    })
    const image =
      existing.docs[0] ||
      (await payload.create({
        collection: 'media',
        context: { disableRevalidate: true },
        data: { seedKey, alt },
        filePath: path.resolve(`public/design/services/${key}.jpg`),
      }))
    refs[seedKey] = image.id
  }
  refs['service-renovering-detalj'] = refs['service-totalentreprenad']
  refs['service-tillbyggnad-detalj'] = refs['service-totalentreprenad']
  return refs
}
