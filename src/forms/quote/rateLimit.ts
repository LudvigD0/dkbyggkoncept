import { createHmac } from 'node:crypto'
import type { Payload } from 'payload'

const initialized = new WeakMap<object, Promise<string>>()
export async function allowQuoteRequest(payload: Payload, request: Request, email: string) {
  const db = payload.db.connection.db
  if (!db) throw new Error('Database not connected')
  const collection = db.collection<{ _id: string; count: number; expiresAt: Date }>(
    'quote_rate_limits',
  )
  if (!initialized.has(db))
    initialized.set(
      db,
      collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch((error) => {
        initialized.delete(db)
        throw error
      }),
    )
  await initialized.get(db)
  const window = 15 * 60 * 1000
  const slot = Math.floor(Date.now() / window)
  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  const identities = [
    { identity: `email:${email.toLowerCase()}`, limit: 5 },
    ...(ip ? [{ identity: `ip:${ip}`, limit: 10 }] : []),
  ]
  for (const { identity, limit } of identities) {
    const key = createHmac('sha256', process.env.PAYLOAD_SECRET!)
      .update(`${slot}:${identity}`)
      .digest('hex')
    await collection.updateOne(
      { _id: key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((slot + 2) * window) } },
      { upsert: true },
    )
    const counter = await collection.findOne({ _id: key })
    if ((counter?.count || 0) > limit) return false
  }
  return true
}
