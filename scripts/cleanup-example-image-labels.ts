import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { removeExampleImageLabels } from './data/removeExampleImageLabels'
import { clearLocalContentCache } from './data/clearLocalContentCache'
import type { Page } from '../src/payload-types'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const clean = (page: Page) => removeExampleImageLabels({ hero: page.hero, layout: page.layout })
const hasChanges = (page: Page) => {
  const cleaned = clean(page)
  return cleaned.hero !== page.hero || cleaned.layout !== page.layout
}

try {
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: false,
    pagination: false,
    limit: 1000,
    overrideAccess: true,
  })
  const changes: Array<{ published: Page; draft: Page }> = []
  for (const published of pages.docs) {
    const draft = await payload.findByID({
      collection: 'pages',
      id: published.id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    })
    if (hasChanges(published) || hasChanges(draft)) changes.push({ published, draft })
  }
  if (!changes.length) {
    console.log('No example image labels remain. Existing content preserved.')
  } else {
    await mkdir('.backups', { recursive: true, mode: 0o700 })
    const backup = `.backups/before-example-label-cleanup-${Date.now()}.json`
    await writeFile(backup, JSON.stringify(changes, null, 2), { mode: 0o600 })
    const req = await createLocalReq({ context }, payload)
    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) throw new Error('A database transaction is required for this cleanup.')
    req.transactionID = transactionID
    try {
      for (const { published, draft } of changes) {
        const current = await payload.findByID({
          collection: 'pages',
          id: published.id,
          draft: false,
          depth: 0,
          overrideAccess: true,
          req,
        })
        const currentDraft = await payload.findByID({
          collection: 'pages',
          id: draft.id,
          draft: true,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (current.updatedAt !== published.updatedAt || currentDraft.updatedAt !== draft.updatedAt)
          throw new Error(
            `Page ${published.slug} changed during cleanup. Run again to preserve edits.`,
          )

        if (published._status === 'published' && hasChanges(published))
          await payload.update({
            collection: 'pages',
            id: published.id,
            req,
            context,
            draft: false,
            overrideAccess: true,
            data: { ...published, ...clean(published), _status: 'published' },
          })
        // Publishing updates can replace the latest version: restore an independent draft.
        if (draft._status === 'draft')
          await payload.update({
            collection: 'pages',
            id: draft.id,
            req,
            context,
            draft: true,
            publishAllLocales: false,
            overrideAccess: true,
            data: { ...draft, ...clean(draft), _status: 'draft' },
          })
      }
      await payload.db.commitTransaction(transactionID)
      await clearLocalContentCache()
      console.log(
        `Image labels cleaned on: ${changes.map(({ published }) => published.slug).join(', ')}. Backup: ${backup}`,
      )
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }
} finally {
  setTimeout(() => process.exit(process.exitCode || 0), 2000)
  await payload.destroy()
}
