import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { addHomeReviews } from './data/googleReviews'
import { clearLocalContentCache } from './data/clearLocalContentCache'

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
  })
  const published = found.docs[0]
  if (!published) throw new Error('Published homepage missing. Run pnpm seed first.')
  const layout = addHomeReviews(published.layout || [])
  if (layout === published.layout) {
    console.log('Google reviews block already exists. Content preserved.')
  } else {
    const draft = await payload.findByID({
      collection: 'pages',
      id: published.id,
      depth: 0,
      draft: true,
    })
    await mkdir('.backups', { recursive: true, mode: 0o700 })
    const backup = `.backups/before-google-reviews-${Date.now()}.json`
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
      })
      const currentDraft = await payload.findByID({
        collection: 'pages',
        id: published.id,
        depth: 0,
        draft: true,
        req,
      })
      if (current.updatedAt !== published.updatedAt || currentDraft.updatedAt !== draft.updatedAt)
        throw new Error('Homepage changed during import. Run again to preserve edits.')
      await payload.update({
        collection: 'pages',
        id: published.id,
        req,
        context,
        draft: false,
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
          data: { ...draft, layout: addHomeReviews(draft.layout || []), _status: 'draft' },
        })
      if (transactionID) await payload.db.commitTransaction(transactionID)
      await clearLocalContentCache()
      console.log(`Empty Google reviews block added. No reviews invented. Backup: ${backup}`)
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }
} finally {
  await payload.destroy()
}
process.exit(0)
