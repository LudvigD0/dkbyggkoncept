import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { readFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import { createLocalReq, getPayload, type TypeWithVersion } from 'payload'
import config from '../src/payload.config'
import type { Page } from '../src/payload-types'
import { restoreHeroStructure } from './data/restoreHeroStructure'
import { clearLocalContentCache } from './data/clearLocalContentCache'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const filename = process.argv[2]
if (!filename)
  throw new Error('Usage: node --import tsx scripts/restore-page-heroes.ts /path/to/backup.json')
const backup = JSON.parse(await readFile(filename, 'utf8')) as {
  published: Page[]
  drafts: Page[]
  versions: TypeWithVersion<Page>[]
}
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  // Never overwrite work done since the backup. Repeated runs preserve current content.
  for (const snapshot of backup.drafts) {
    const current = await payload.findByID({
      collection: 'pages',
      id: snapshot.id,
      draft: true,
      depth: 0,
    })
    if (
      current.updatedAt !== snapshot.updatedAt &&
      !isDeepStrictEqual(restoreHeroStructure(current), {
        hero: current.hero,
        layout: current.layout,
      })
    ) {
      throw new Error(
        `Page ${snapshot.slug} changed after backup. Take a new backup before importing.`,
      )
    }
  }
  let changed = 0
  for (const snapshot of backup.published) {
    const current = await payload.findByID({
      collection: 'pages',
      id: snapshot.id,
      draft: false,
      depth: 0,
    })
    if (
      isDeepStrictEqual(restoreHeroStructure(current), {
        hero: current.hero,
        layout: current.layout,
      })
    )
      continue
    const restored = restoreHeroStructure(snapshot)
    const draft = backup.drafts.find((page) => page.id === snapshot.id && page._status === 'draft')
    const req = await createLocalReq({ context }, payload)
    const transactionID = await payload.db.beginTransaction()
    if (transactionID) req.transactionID = transactionID
    try {
      // Start the transaction before concurrent relationship validation queries.
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        select: { filename: true },
        req,
      })
      // Convert history first and keep its chronology. Publishing below then creates
      // the latest version, followed by any separate editorial draft.
      for (const version of backup.versions.filter((version) => version.parent === snapshot.id)) {
        const restoredVersion = restoreHeroStructure(version.version)
        await payload.db.updateVersion({
          collection: 'pages',
          id: version.id,
          req,
          versionData: {
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
            version: { ...version.version, ...restoredVersion },
          },
        })
      }
      await payload.update({
        collection: 'pages',
        id: current.id,
        req,
        context,
        draft: false,
        // Payload updates start from the latest version, which may be a draft.
        // Explicit published fields and status keep draft content private.
        data: { ...snapshot, ...restored, _status: snapshot._status },
      })
      if (draft)
        await payload.update({
          collection: 'pages',
          id: draft.id,
          req,
          context,
          draft: true,
          publishAllLocales: false,
          data: { ...draft, ...restoreHeroStructure(draft), _status: 'draft' },
        })
      if (transactionID) await payload.db.commitTransaction(transactionID)
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
    changed++
    console.log(
      `Restored ${snapshot.slug}: ${restored.hero.type}, ${restored.layout.length} content blocks`,
    )
  }
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    limit: 1000,
  })
  for (const page of pages.docs) {
    if (page.layout?.some((block) => ['siteHero', 'serviceHero'].includes(block.blockType)))
      throw new Error(`Legacy hero remains on ${page.slug}`)
    if (page.slug !== 'home' && page.hero.enableBackgroundVideo)
      throw new Error(`Unexpected video hero on ${page.slug}`)
    const snapshot = backup.published.find((snapshot) => snapshot.id === page.id)
    if (snapshot && snapshot.slug !== page.slug) throw new Error(`Slug changed: ${page.slug}`)
    if (snapshot && snapshot._status !== page._status)
      throw new Error(`Publication status changed: ${page.slug}`)
    const originalDraft = backup.drafts.find(
      (draft) => draft.id === page.id && draft._status === 'draft',
    )
    if (originalDraft) {
      const draft = await payload.findByID({
        collection: 'pages',
        id: page.id,
        draft: true,
        depth: 0,
      })
      if (
        draft._status !== originalDraft._status ||
        draft.title !== originalDraft.title ||
        draft.slug !== originalDraft.slug
      )
        throw new Error(`Draft changed: ${page.slug}`)
    }
  }
  await clearLocalContentCache()
  console.log(
    `Verified ${pages.totalDocs} pages. Changed: ${changed}. Backup retained: ${filename}`,
  )
} finally {
  await payload.destroy()
}
process.exit(0)
