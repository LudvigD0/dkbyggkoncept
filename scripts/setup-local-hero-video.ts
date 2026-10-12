import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { HOME_HERO_VIDEO_PATH } from '../src/heros/localVideo'
import { clearLocalContentCache } from './data/clearLocalContentCache'
import type { Page } from '../src/payload-types'

await access(`public${HOME_HERO_VIDEO_PATH}`)
if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const localHero = (page: Page) => ({
  ...page.hero,
  backgroundVideoPath: HOME_HERO_VIDEO_PATH,
  backgroundVideo: null,
})
const needsUpdate = (page: Page) =>
  page.hero.backgroundVideoPath !== HOME_HERO_VIDEO_PATH || Boolean(page.hero.backgroundVideo)
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
  if (!published || published.hero.type !== 'highImpact')
    throw new Error('Homepage High Impact hero missing.')
  const draft = await payload.findByID({
    collection: 'pages',
    id: published.id,
    draft: true,
    depth: 0,
    overrideAccess: true,
  })
  if (!needsUpdate(published) && !needsUpdate(draft)) {
    console.log('Homepage already uses the local video. Existing content preserved.')
  } else {
    await mkdir('.backups', { recursive: true, mode: 0o700 })
    const backup = `.backups/before-local-hero-video-${Date.now()}.json`
    await writeFile(backup, JSON.stringify({ published, draft }, null, 2), { mode: 0o600 })
    const req = await createLocalReq({ context }, payload)
    const transactionID = await payload.db.beginTransaction()
    if (transactionID) req.transactionID = transactionID
    try {
      const current = await payload.findByID({
        collection: 'pages',
        id: published.id,
        draft: false,
        depth: 0,
        req,
        overrideAccess: true,
      })
      const currentDraft = await payload.findByID({
        collection: 'pages',
        id: published.id,
        draft: true,
        depth: 0,
        req,
        overrideAccess: true,
      })
      if (current.updatedAt !== published.updatedAt || currentDraft.updatedAt !== draft.updatedAt)
        throw new Error('Homepage changed during import. Run again to preserve edits.')
      if (needsUpdate(published))
        await payload.update({
          collection: 'pages',
          id: published.id,
          req,
          context,
          draft: false,
          overrideAccess: true,
          data: { ...published, hero: localHero(published), _status: 'published' },
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
          data: { ...draft, hero: localHero(draft), _status: 'draft' },
        })
      if (transactionID) await payload.db.commitTransaction(transactionID)
      await clearLocalContentCache()
      console.log(`Homepage video now uses ${HOME_HERO_VIDEO_PATH}. Backup: ${backup}`)
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }
} finally {
  setTimeout(() => process.exit(process.exitCode || 0), 2000)
  await payload.destroy()
}
