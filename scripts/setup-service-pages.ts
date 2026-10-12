import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile, chmod } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { ensureServiceContent } from './data/ensureServiceContent'
import { servicePages } from './data/servicePages'
import { clearLocalContentCache } from './data/clearLocalContentCache'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
try {
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { in: ['home', 'tjanster', ...servicePages.map((page) => page.slug)] } },
    depth: 0,
    pagination: false,
    limit: 100,
  })
  const drafts = await Promise.all(
    pages.docs.map((page) =>
      payload.findByID({ collection: 'pages', id: page.id, draft: true, depth: 0 }),
    ),
  )
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  await mkdir('.backups', { recursive: true, mode: 0o700 })
  const backup = `.backups/before-service-pages-${Date.now()}.json`
  await writeFile(backup, JSON.stringify({ pages: pages.docs, drafts, footer }, null, 2), {
    mode: 0o600,
  })
  await chmod(backup, 0o600)
  const created = await ensureServiceContent(payload)
  await clearLocalContentCache()
  console.log(
    `Service pages ready. Created: ${created.join(', ') || 'none; existing content preserved'}. Backup: ${backup}`,
  )
} finally {
  await payload.destroy()
}
process.exit(0)
