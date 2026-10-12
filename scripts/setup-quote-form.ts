import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { writeFile, mkdir, chmod } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { ensureQuoteForm } from './data/ensureQuoteForm'
import type { Page } from '../src/payload-types'
import { buildPageBlocks } from './data/buildPageBlocks'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
try {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'offert' } },
    depth: 0,
    limit: 1,
    draft: false,
  })
  const published = found.docs[0]
  if (!published) throw new Error('No quote page found. Run pnpm seed first.')
  const draft = await payload.findByID({
    collection: 'pages',
    id: published.id,
    depth: 0,
    draft: true,
  })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  await mkdir('.backups', { recursive: true, mode: 0o700 })
  const filename = `.backups/before-quote-form-${Date.now()}.json`
  await writeFile(filename, JSON.stringify({ published, draft, settings }, null, 2), {
    mode: 0o600,
  })
  await chmod(filename, 0o600)
  const form = await ensureQuoteForm(payload)
  const context = { disableRevalidate: true }
  const convert = (page: Page, addMissing = false) => {
    const layout = (page.layout || []).map((block) =>
      block.blockType === 'quotePanel' && !block.form ? { ...block, form: form.id } : block,
    )
    if (addMissing && !layout.some((block) => block.blockType === 'quotePanel')) {
      const company = { ...settings.company, areas: settings.company.areas ?? undefined }
      const panel = buildPageBlocks({ slug: 'offert' }, { company }, {}).find(
        (block) => block.blockType === 'quotePanel',
      )
      if (!panel || panel.blockType !== 'quotePanel') throw new Error('Quote panel seed missing')
      layout.splice(0, 0, { ...panel, form: form.id })
    }
    return layout
  }
  const alreadyConnected = published.layout?.some(
    (block) => block.blockType === 'quotePanel' && block.form,
  )
  if (!alreadyConnected) {
    const layout = convert(published, true)
    await payload.update({
      collection: 'pages',
      id: published.id,
      draft: false,
      context,
      data: { ...published, layout, _status: published._status },
    })
    if (draft._status === 'draft')
      await payload.update({
        collection: 'pages',
        id: draft.id,
        draft: true,
        publishAllLocales: false,
        context,
        data: { ...draft, layout: convert(draft), _status: 'draft' },
      })
  }
  console.log(`Quote form ready. Existing draft preserved. Backup: ${filename}`)
} finally {
  await payload.destroy()
}
process.exit(0)
