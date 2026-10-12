import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { featuredServiceDefaults, replaceHomeServices } from './data/featuredServices'
import { clearLocalContentCache } from './data/clearLocalContentCache'
import type { MediaRefs } from './data/buildPageBlocks'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
const context = { disableRevalidate: true }

try {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' }, _status: { equals: 'published' } },
    draft: false,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const published = found.docs[0]
  if (!published) throw new Error('Published homepage missing. Run pnpm seed first.')
  const draft = await payload.findByID({
    collection: 'pages',
    id: published.id,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const media: MediaRefs = {}
  const imageAlts: Record<string, string> = {}
  for (const service of featuredServiceDefaults) {
    const images = await payload.find({
      collection: 'media',
      where: {
        or: [{ filename: { equals: service.filename } }, { seedKey: { equals: service.seedKey } }],
      },
      depth: 0,
      limit: 10,
      overrideAccess: true,
    })
    const image = images.docs.find((image) => image.filename === service.filename) || images.docs[0]
    media[service.imageKey] = image?.id || null
    if (image)
      imageAlts[service.imageKey] =
        image.filename === service.filename ? service.imageAlt : image.alt || ''
  }
  const layout = replaceHomeServices(published.layout || [], media, imageAlts)
  const draftLayout = replaceHomeServices(draft.layout || [], media, imageAlts)
  if (layout === published.layout && draftLayout === draft.layout) {
    console.log(
      'Featured services already present, or no matching service section. Content preserved.',
    )
  } else {
    await mkdir('.backups', { recursive: true, mode: 0o700 })
    const backup = `.backups/before-featured-services-${Date.now()}.json`
    await writeFile(backup, JSON.stringify({ published, draft }, null, 2), { mode: 0o600 })
    const req = await createLocalReq({ context }, payload)
    const transactionID = await payload.db.beginTransaction()
    if (transactionID) req.transactionID = transactionID
    try {
      const current = await payload.findByID({
        collection: 'pages',
        id: published.id,
        depth: 0,
        draft: false,
        req,
        overrideAccess: true,
      })
      const currentDraft = await payload.findByID({
        collection: 'pages',
        id: published.id,
        depth: 0,
        draft: true,
        req,
        overrideAccess: true,
      })
      if (current.updatedAt !== published.updatedAt || currentDraft.updatedAt !== draft.updatedAt)
        throw new Error('Homepage changed during import. Run again to preserve edits.')
      if (layout !== published.layout)
        await payload.update({
          collection: 'pages',
          id: published.id,
          req,
          context,
          draft: false,
          overrideAccess: true,
          data: { ...published, layout, _status: 'published' },
        })
      if (draft._status === 'draft')
        await payload.update({
          collection: 'pages',
          id: draft.id,
          req,
          context,
          draft: true,
          publishAllLocales: false,
          overrideAccess: true,
          data: { ...draft, layout: draftLayout, _status: 'draft' },
        })
      if (transactionID) await payload.db.commitTransaction(transactionID)
      await clearLocalContentCache()
      console.log(
        `Homepage service section replaced with four editable services. Backup: ${backup}`,
      )
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }
} finally {
  setTimeout(() => process.exit(process.exitCode || 0), 2000)
  await payload.destroy()
}
