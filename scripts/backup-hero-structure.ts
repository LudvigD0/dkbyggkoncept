import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
try {
  const published = await payload.find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    limit: 1000,
  })
  const drafts = await Promise.all(
    published.docs.map((page) =>
      payload.findByID({ collection: 'pages', id: page.id, draft: true, depth: 0 }),
    ),
  )
  const versions = await payload.findVersions({
    collection: 'pages',
    depth: 0,
    pagination: false,
    limit: 10000,
  })
  await mkdir('.backups', { recursive: true, mode: 0o700 })
  const filename = `.backups/before-hero-structure-${Date.now()}.json`
  await writeFile(
    filename,
    JSON.stringify({ published: published.docs, drafts, versions: versions.docs }, null, 2),
    { mode: 0o600 },
  )
  console.log(
    `Backup saved: ${filename}; ${published.totalDocs} pages, ${versions.totalDocs} versions`,
  )
} finally {
  await payload.destroy()
}
process.exit(0)
