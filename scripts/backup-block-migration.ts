import 'dotenv/config'
import { setServers } from 'node:dns/promises'
if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { writeFile } from 'node:fs/promises'
const payload = await getPayload({ config })
try {
  const [published, drafts, versions, settings, header, footer] = await Promise.all([
    payload.find({ collection: 'pages', pagination: false, limit: 10000, depth: 0, draft: false }),
    payload.find({ collection: 'pages', pagination: false, limit: 10000, depth: 0, draft: true }),
    payload.findVersions({ collection: 'pages', pagination: false, limit: 10000, depth: 0 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.findGlobal({ slug: 'header', depth: 0 }),
    payload.findGlobal({ slug: 'footer', depth: 0 }),
  ])
  const filename = `/private/tmp/dkbyggkoncept-blocks-${Date.now()}.json`
  await writeFile(
    filename,
    JSON.stringify(
      {
        published: published.docs,
        drafts: drafts.docs,
        versions: versions.docs,
        settings,
        header,
        footer,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  )
  console.log(
    JSON.stringify({
      backup: filename,
      pages: published.docs.length,
      drafts: drafts.docs.length,
      versions: versions.docs.length,
    }),
  )
} finally {
  await payload.destroy()
}
process.exit(0)
