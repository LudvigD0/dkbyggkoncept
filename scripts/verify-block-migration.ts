import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import type { Page } from '../src/payload-types'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const filename = process.argv[2]
if (!filename) throw new Error('Provide the pre-migration backup path.')
const backup = JSON.parse(await readFile(filename, 'utf8')) as {
  published: Page[]
  drafts: Page[]
  versions: Array<{ id: string; version: Page }>
}
const payload = await getPayload({ config })
try {
  const [published, drafts, versions] = await Promise.all([
    payload.find({ collection: 'pages', depth: 0, pagination: false, limit: 10000, draft: false }),
    payload.find({ collection: 'pages', depth: 0, pagination: false, limit: 10000, draft: true }),
    payload.findVersions({ collection: 'pages', depth: 0, pagination: false, limit: 10000 }),
  ])
  for (const original of backup.published) {
    const current = published.docs.find((page) => page.id === original.id)
    assert.ok(current?.layout?.length, original.slug || original.id)
    assert.equal(current.title, original.title)
    assert.equal(current._status, original._status)
    assert.equal('siteContent' in current, false)
    assert.equal('siteTemplate' in current, false)
  }
  for (const original of backup.drafts) {
    const current = drafts.docs.find((page) => page.id === original.id)
    assert.ok(current?.layout?.length)
    assert.equal(current.title, original.title)
    assert.equal(current._status, original._status)
  }
  for (const original of backup.versions) {
    const current = versions.docs.find((version) => version.id === original.id)
    assert.ok(current?.version.layout?.length, `Historical version ${original.id}`)
    assert.equal(current.version.title, original.version.title)
  }
  assert.equal(published.docs.find((page) => page.slug === 'offert')?.layout?.length, 2)
  assert.equal(drafts.docs.find((page) => page.slug === 'offert')?.layout?.length, 8)
  assert.equal(drafts.docs.find((page) => page.slug === 'offert')?._status, 'draft')
  console.log(
    `Verified ${backup.published.length} published pages, ${backup.drafts.length} draft snapshots and ${backup.versions.length} original historical versions.`,
  )
} finally {
  await payload.destroy()
}
process.exit(0)
