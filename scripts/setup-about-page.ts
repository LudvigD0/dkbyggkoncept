import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import { createLocalReq, getPayload } from 'payload'
import config from '../src/payload.config'
import { enrichAboutPage } from './data/aboutPage'
import { clearLocalContentCache } from './data/clearLocalContentCache'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { in: ['home', 'om-oss'] }, _status: { equals: 'published' } },
    draft: false,
    depth: 0,
    limit: 2,
    overrideAccess: true,
  })
  const published = pages.docs.find((page) => page.slug === 'om-oss')
  const home = pages.docs.find((page) => page.slug === 'home')
  if (!published) throw new Error('Published about page missing.')
  const draft = await payload.findByID({
    collection: 'pages',
    id: published.id,
    draft: true,
    depth: 0,
    overrideAccess: true,
  })
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })
  const photos = await payload.find({
    collection: 'media',
    where: { filename: { in: ['kakelsattning-dk.jpg.webp', 'dkbyggkoncept-bild.webp'] } },
    depth: 0,
    limit: 2,
    overrideAccess: true,
  })
  const photo =
    photos.docs.find((photo) => photo.filename === 'kakelsattning-dk.jpg.webp') || photos.docs[0]
  if (!photo) throw new Error('The uploaded DK Byggkoncept team photo is missing.')
  const content = {
    image: photo.id,
    imageAlt: 'Medarbetare hos DK Byggkoncept arbetar med kakel i företagets profilkläder',
    trust: home?.layout?.find((block) => block.blockType === 'trustPoints'),
    reviews: home?.layout?.find((block) => block.blockType === 'googleReviews'),
  }
  const layout = enrichAboutPage(published.layout || [], content)
  const draftLayout = enrichAboutPage(draft.layout || [], content)
  const updateCompany = !settings.company.organizationNumber
  if (layout === published.layout && draftLayout === draft.layout && !updateCompany) {
    console.log('About page already updated. Existing edits preserved.')
  } else {
    await mkdir('.backups', { recursive: true, mode: 0o700 })
    const backup = `.backups/before-about-page-${Date.now()}.json`
    await writeFile(backup, JSON.stringify({ published, draft, settings }, null, 2), {
      mode: 0o600,
    })
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
      const currentSettings = await payload.findGlobal({
        slug: 'site-settings',
        depth: 0,
        req,
        overrideAccess: true,
      })
      if (
        current.updatedAt !== published.updatedAt ||
        currentDraft.updatedAt !== draft.updatedAt ||
        currentSettings.updatedAt !== settings.updatedAt
      )
        throw new Error('Content changed during import. Run again to preserve edits.')
      if (updateCompany)
        await payload.updateGlobal({
          slug: 'site-settings',
          req,
          context,
          overrideAccess: true,
          data: { company: { ...settings.company, organizationNumber: '559463-0682' } },
        })
      if (layout !== published.layout)
        await payload.update({
          collection: 'pages',
          id: published.id,
          req,
          context,
          draft: false,
          overrideAccess: true,
          data: {
            ...published,
            layout,
            meta: { ...published.meta, image: photo.id },
            _status: 'published',
          },
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
          data: {
            ...draft,
            layout: draftLayout,
            meta: { ...draft.meta, image: photo.id },
            _status: 'draft',
          },
        })
      if (transactionID) await payload.db.commitTransaction(transactionID)
      await clearLocalContentCache()
      console.log(
        `About page updated with profile photo, trust points, reviews and company details. Backup: ${backup}`,
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
