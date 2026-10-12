import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { readFile } from 'node:fs/promises'
import { getPayload, createLocalReq, type TypeWithVersion } from 'payload'
import config from '../src/payload.config'
import type { Page, Header, Footer } from '../src/payload-types'
import {
  buildPageContent,
  action,
  type LegacyPage,
  type LegacySettings,
} from './data/buildPageBlocks'
import { ensureMedia } from './data/ensureMedia'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const filename = process.argv[2]
if (!filename)
  throw new Error(
    'Usage: pnpm exec tsx scripts/migrate-page-blocks.ts /absolute/path/to/backup.json',
  )
type SnapshotPage = Page & LegacyPage
const backup = JSON.parse(await readFile(filename, 'utf8')) as {
  published: SnapshotPage[]
  drafts: SnapshotPage[]
  versions: TypeWithVersion<SnapshotPage>[]
  settings: LegacySettings
  header: Header
  footer: Footer
}
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const converted = (
  page: SnapshotPage,
  content: ReturnType<typeof buildPageContent>,
): SnapshotPage => ({
  ...page,
  ...content,
  siteTemplate: null,
  siteContent: [],
})
try {
  // Refuse to overwrite edits that were made after the backup.
  for (const snapshot of backup.drafts) {
    const current = (await payload.findByID({
      collection: 'pages',
      id: snapshot.id,
      draft: true,
      depth: 0,
    })) as SnapshotPage
    if (current.layout?.length && !current.siteTemplate) continue
    if (current.updatedAt !== snapshot.updatedAt)
      throw new Error(
        `Page ${snapshot.slug} changed after backup. Make a new backup before migrating.`,
      )
  }
  const media = await ensureMedia(payload)
  let migrated = 0
  for (const snapshot of backup.published) {
    const current = (await payload.findByID({
      collection: 'pages',
      id: snapshot.id,
      draft: false,
      depth: 0,
    })) as SnapshotPage
    if (current.layout?.length && !current.siteTemplate) continue
    if (!snapshot.siteTemplate) continue
    const content = buildPageContent(snapshot, backup.settings, media)
    const { layout } = content
    if (!layout.length) throw new Error(`No migration for template ${snapshot.siteTemplate}`)
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
      for (const version of backup.versions.filter(
        (version) => version.parent === snapshot.id && version.version.siteTemplate,
      )) {
        await payload.db.updateVersion({
          collection: 'pages',
          id: version.id,
          req,
          versionData: {
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
            version: {
              ...version.version,
              ...buildPageContent(version.version, backup.settings, media),
              siteTemplate: null,
              siteContent: [],
            },
          },
        })
      }
      await payload.update({
        collection: 'pages',
        id: snapshot.id,
        req,
        context,
        draft: false,
        data: converted(snapshot, content),
      })
      const draft = backup.drafts.find(
        (page) => page.id === snapshot.id && page._status === 'draft',
      )
      if (draft)
        await payload.update({
          collection: 'pages',
          id: draft.id,
          req,
          context,
          draft: true,
          publishAllLocales: false,
          data: converted(draft, buildPageContent(draft, backup.settings, media)),
        })
      if (transactionID) await payload.db.commitTransaction(transactionID)
    } catch (error) {
      if (transactionID) await payload.db.rollbackTransaction(transactionID)
      throw error
    }
    migrated++
    console.log(
      `Migrated ${snapshot.slug}: ${layout.length} blocks${backup.drafts.find((page) => page.id === snapshot.id) ? ' (draft state preserved)' : ''}`,
    )
  }
  const nav = (backup.settings.nav || []).map((item) => ({
    link: action(item.label, item.to).link,
  }))
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  if (!header.logo)
    await payload.updateGlobal({
      slug: 'header',
      context,
      data: {
        logo: media.headerLogo,
        logoAlt: backup.settings.company?.name,
        homeURL: '/',
        showPhone: true,
        links: [action('Begär offert', '/offert')],
        navItems: header.navItems?.length ? header.navItems : nav,
      },
    })
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  if (!footer.logo)
    await payload.updateGlobal({
      slug: 'footer',
      context,
      data: {
        logo: media.footerLogo,
        logoAlt: backup.settings.company?.name,
        description:
          backup.settings.shared?.footerText ||
          'Byggfirman för hem och företag i Göteborg med omnejd.',
        links: [action('Begär offert', '/offert', 'accent')],
        navItems: footer.navItems?.length ? footer.navItems : nav,
      },
    })
  const [published, drafts] = await Promise.all([
    payload.find({ collection: 'pages', depth: 0, pagination: false, limit: 1000, draft: false }),
    payload.find({ collection: 'pages', depth: 0, pagination: false, limit: 1000, draft: true }),
  ])
  for (const snapshot of backup.published) {
    const page = published.docs.find((page) => page.id === snapshot.id) as SnapshotPage | undefined
    if (snapshot.siteTemplate && (!page?.layout?.length || page.siteTemplate))
      throw new Error(`Published migration verification failed: ${snapshot.slug}`)
  }
  for (const snapshot of backup.drafts) {
    const page = drafts.docs.find((page) => page.id === snapshot.id)
    if (page?._status !== snapshot._status)
      throw new Error(`Draft status changed: ${snapshot.slug}`)
    if (snapshot._status === 'draft' && page?.title !== snapshot.title)
      throw new Error(`Draft title changed: ${snapshot.slug}`)
  }
  console.log(`Migration verified: ${migrated} pages; original backup retained at ${filename}`)
} finally {
  await payload.destroy()
}
process.exit(0)
