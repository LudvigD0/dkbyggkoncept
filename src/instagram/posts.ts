import 'next/dist/compiled/server-only'

import type { Payload } from 'payload'
import { getInstagramAccessToken } from './store'

export type InstagramPost = {
  id: string
  caption: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string | null
  thumbnailUrl: string | null
  permalink: string | null
  timestamp: string | null
}

const safeURL = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.searchParams.has('access_token')
    )
      return null
    return url.toString()
  } catch {
    return null
  }
}

// Ready for the site's Server Components. No existing Instagram renderer is present in this checkout.
export async function getInstagramPosts(payload: Payload, limit = 6): Promise<InstagramPost[]> {
  try {
    const token = await getInstagramAccessToken(payload)
    if (!token) return []
    const options: RequestInit = {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    }
    const profileResponse = await fetch(
      'https://graph.instagram.com/v25.0/me?fields=user_id',
      options,
    )
    if (!profileResponse.ok) throw new Error()
    const profile = await profileResponse.json()
    if (typeof profile?.user_id !== 'string' || !/^\d+$/.test(profile.user_id)) throw new Error()
    const url = new URL(`https://graph.instagram.com/v25.0/${profile.user_id}/media`)
    url.searchParams.set(
      'fields',
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
    )
    url.searchParams.set(
      'limit',
      String(Number.isFinite(limit) ? Math.min(25, Math.max(1, Math.floor(limit))) : 6),
    )
    const response = await fetch(url, options)
    if (!response.ok) throw new Error()
    const body = await response.json()
    if (!Array.isArray(body?.data)) throw new Error()
    // Whitelist fields; never forward Meta's paging URLs or complete API responses.
    return body.data.flatMap((item: Record<string, unknown>) => {
      if (
        !item ||
        typeof item.id !== 'string' ||
        !['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(String(item.media_type))
      )
        return []
      return [
        {
          id: item.id,
          caption: typeof item.caption === 'string' ? item.caption : '',
          mediaType: item.media_type as InstagramPost['mediaType'],
          mediaUrl: safeURL(item.media_url),
          thumbnailUrl: safeURL(item.thumbnail_url),
          permalink: safeURL(item.permalink),
          timestamp: typeof item.timestamp === 'string' ? item.timestamp : null,
        },
      ]
    })
  } catch {
    console.error(
      '[instagram] Inlägg kunde inte hämtas. Kontrollera token och behörigheter i Payload.',
    )
    return []
  }
}
