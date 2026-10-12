import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { refreshInstagramToken } from '@/instagram/refresh'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const reply = (body: object, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('authorization')
  if (!secret || !header) return reply({ error: 'Unauthorized' }, 401)
  const actual = Buffer.from(header)
  const expected = Buffer.from(`Bearer ${secret}`)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return reply({ error: 'Unauthorized' }, 401)

  try {
    // Unauthorized requests never initialize Payload or connect to the database.
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    const payload = await getPayload({ config })
    const result = await refreshInstagramToken(payload)
    if (result.status === 'refreshed') revalidateTag('instagram-posts', { expire: 0 })
    return reply(result, result.status === 'failed' ? 503 : 200)
  } catch {
    console.error('[instagram] Cron-jobbet kunde inte ansluta till Payload.')
    return reply({ status: 'failed', error: 'Instagram-jobbet kunde inte köras.' }, 503)
  }
}
