import 'next/dist/compiled/server-only'

import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'
import type { InstagramSetting } from '@/payload-types'
import { decryptInstagramToken } from './encryption'

export const instagramGlobalSlug = 'instagram-settings' as const

export async function readInstagramSettings(payload: Payload): Promise<InstagramSetting | null> {
  // Trusted server-only adapter read. The public/admin Local API intentionally masks the token.
  return (await payload.db.findGlobal({
    slug: instagramGlobalSlug,
  })) as unknown as InstagramSetting | null
}

export async function getInstagramAccessToken(payload: Payload): Promise<string | null> {
  const settings = await readInstagramSettings(payload)
  return settings?.accessToken ? decryptInstagramToken(settings.accessToken) : null
}

export async function updateInstagramSettingsIfUnchanged(
  payload: Payload,
  encryptedToken: string,
  data: Partial<InstagramSetting>,
): Promise<boolean> {
  // Atomic compare-and-set: never overwrite a token replaced in Admin during an API call.
  // This global has no versions. Callers encrypt new tokens; the cron route invalidates the post cache.
  const result = await payload.db.globals.collection.updateOne(
    { globalType: instagramGlobalSlug, accessToken: encryptedToken },
    { $set: { ...data, updatedAt: new Date() } },
  )
  return result.matchedCount === 1
}

type RefreshLease = { _id: string; owner: string; expiresAt: Date }
function leases(payload: Payload) {
  const db = payload.db.connection.db
  if (!db) throw new Error('Instagram database unavailable')
  return db.collection<RefreshLease>('instagram_refresh_locks')
}

export async function acquireInstagramRefreshLock(payload: Payload): Promise<string | null> {
  const owner = randomUUID()
  try {
    const lease = await leases(payload).findOneAndUpdate(
      { _id: instagramGlobalSlug, expiresAt: { $lte: new Date() } },
      { $set: { owner, expiresAt: new Date(Date.now() + 120_000) } },
      { upsert: true, returnDocument: 'after' },
    )
    return lease?.owner === owner ? owner : null
  } catch (error) {
    // An unexpired lease makes the upsert collide with MongoDB's unique _id index.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000)
      return null
    throw new Error('Instagram refresh lock unavailable')
  }
}

export async function releaseInstagramRefreshLock(payload: Payload, owner: string) {
  await leases(payload).deleteOne({ _id: instagramGlobalSlug, owner })
}
