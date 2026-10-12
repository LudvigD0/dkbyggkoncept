import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { createLocalReq, getPayload, type TypeWithVersion } from 'payload'
import config from '../src/payload.config'
import type { Page } from '../src/payload-types'
import { restoreHeroStructure } from './data/restoreHeroStructure'
import { clearLocalContentCache } from './data/clearLocalContentCache'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const backup = JSON.parse(
  await readFile('.backups/before-hero-structure-1791638958604.json', 'utf8'),
) as { published: Page[]; drafts: Page[]; versions: TypeWithVersion<Page>[] }
const original = backup.published.find((page) => page.slug === 'kontakt')!
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const current = await payload.findByID({
    collection: 'pages',
    id: original.id,
    depth: 0,
    draft: false,
  })
  const draft = await payload.findByID({
    collection: 'pages',
    id: original.id,
    depth: 0,
    draft: true,
  })
  if (current._status === 'published') {
    console.log('Publication already restored')
  } else {
    // Correct only this migration's known write, never a subsequent editorial change.
    if (
      current.updatedAt !== '2026-10-10T13:36:09.667Z' ||
      original._status !== 'published' ||
      draft._status !== 'draft'
    )
      throw new Error('Unexpected current state; refusing to overwrite edits')
    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: current.id } },
      depth: 0,
      pagination: false,
      limit: 100,
    })
    await writeFile(
      `.backups/before-hero-draft-repair-${Date.now()}.json`,
      JSON.stringify({ current, draft, versions: versions.docs }, null, 2),
      { mode: 0o600 },
    )
    const req = await createLocalReq({ context }, payload)
    const transactionID = await payload.db.beginTransaction()
    if (transactionID) req.transactionID = transactionID
    try {
      await payload.find({
        collection: 'media',
        depth: 0,
        limit: 1,
        select: { filename: true },
        req,
      })
      for (const version of backup.versions) {
        // Restore original history timestamps altered by the first import.
        await payload.db.updateVersion({
          collection: 'pages',
          id: version.id,
          req,
          versionData: {
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
            version: { ...version.version, ...restoreHeroStructure(version.version) },
          },
        })
      }
      await payload.update({
        collection: 'pages',
        id: original.id,
        req,
        context,
        draft: false,
        data: { ...original, ...restoreHeroStructure(original), _status: 'published' },
      })
      await payload.update({
        collection: 'pages',
        id: draft.id,
        req,
        context,
        draft: true,
        publishAllLocales: false,
        data: { ...draft, _status: 'draft' },
      })
      const published = await payload.findByID({
        collection: 'pages',
        id: original.id,
        depth: 0,
        draft: false,
        req,
      })
      const preservedDraft = await payload.findByID({
        collection: 'pages',
        id: original.id,
        depth: 0,
        draft: true,
        req,
      })
      if (
        published._status !== 'published' ||
        published.title !== original.title ||
        published.slug !== original.slug ||
        preservedDraft._status !== 'draft' ||
        preservedDraft.title !== draft.title
      )
        throw new Error('Published/draft verification failed')
      if (transactionID) await payload.db.commitTransaction(transactionID)
      await clearLocalContentCache()
      console.log(
        'Original published contact page restored; separate draft and version chronology preserved',
      )
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }
} finally {
  await payload.destroy()
}
process.exit(0)
