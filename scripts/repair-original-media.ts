import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { clearLocalContentCache } from './data/clearLocalContentCache'

if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const base = process.env.MEDIA_BASE_URL || 'http://localhost:3002'
const payload = await getPayload({ config })
try {
  const missing = []
  for (const key of ['hantverk', 'badrum', 'kok']) {
    const result = await payload.find({
      collection: 'media',
      where: { seedKey: { equals: `lovable-${key}` } },
      depth: 0,
      limit: 1,
    })
    const doc = result.docs[0]
    if (!doc || doc.filename !== `${key}.webp` || !doc.url) continue
    const response = await fetch(new URL(doc.url, base), { method: 'HEAD' })
    if (response.ok) continue
    if (response.status !== 404)
      throw new Error(`Unable to verify ${doc.filename}: HTTP ${response.status}`)
    missing.push({ doc, key })
  }
  if (missing.length) {
    await mkdir('.backups', { recursive: true, mode: 0o700 })
    await writeFile(
      `.backups/before-media-repair-${Date.now()}.json`,
      JSON.stringify(
        missing.map(({ doc }) => doc),
        null,
        2,
      ),
      { mode: 0o600 },
    )
  }
  for (const { doc, key } of missing) {
    const restored = await payload.update({
      collection: 'media',
      id: doc.id,
      context: { disableRevalidate: true },
      overwriteExistingFiles: true,
      filePath: path.resolve(`public/design/${key}.jpg`),
      data: { alt: doc.alt, caption: doc.caption, focalX: doc.focalX, focalY: doc.focalY },
    })
    const response = await fetch(new URL(restored.url!, base))
    if (!response.ok || (await response.arrayBuffer()).byteLength < 1000)
      throw new Error(`Restored media check failed: ${restored.filename}`)
    console.log(
      `Restored original file to configured storage: ${restored.filename}; media ID preserved`,
    )
  }
  if (missing.length) await clearLocalContentCache()
  console.log(`Media repair complete: ${missing.length} missing original files`)
} finally {
  await payload.destroy()
}
process.exit(0)
