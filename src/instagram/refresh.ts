import 'next/dist/compiled/server-only'

import type { Payload } from 'payload'
import type { InstagramSetting } from '@/payload-types'
import {
  decryptInstagramToken,
  encryptInstagramToken,
  InstagramEncryptionError,
} from './encryption'
import {
  acquireInstagramRefreshLock,
  readInstagramSettings,
  releaseInstagramRefreshLock,
  updateInstagramSettingsIfUnchanged,
} from './store'

const day = 24 * 60 * 60 * 1000
export type InstagramRefreshResult =
  | { status: 'refreshed'; tokenExpiresAt: string; lastRefreshedAt: string }
  | {
      status: 'skipped'
      reason: 'not-configured' | 'locked' | 'too-young' | 'not-due' | 'token-changed'
    }
  | { status: 'failed'; error: string }

export function instagramRefreshDecision(settings: InstagramSetting, now = Date.now()) {
  const expires = settings.tokenExpiresAt ? Date.parse(settings.tokenExpiresAt) : null
  const reference = settings.lastRefreshedAt || settings.tokenIssuedAt || settings.tokenRegisteredAt
  const issued = reference ? Date.parse(reference) : NaN
  if (expires !== null && expires <= now) return 'expired'
  if (!Number.isFinite(issued) || (expires !== null && !Number.isFinite(expires)))
    return 'missing-dates'
  if (now - issued < day) return 'too-young'
  if (expires === null || now - issued >= 45 * day || expires - now <= 7 * day) return 'due'
  return 'not-due'
}

class RefreshError extends Error {}

export async function refreshInstagramToken(payload: Payload): Promise<InstagramRefreshResult> {
  let owner: string | null = null
  let settings: InstagramSetting | null = null
  try {
    owner = await acquireInstagramRefreshLock(payload)
    if (!owner) return { status: 'skipped', reason: 'locked' }
    settings = await readInstagramSettings(payload)
    if (!settings?.accessToken) return { status: 'skipped', reason: 'not-configured' }

    const decision = instagramRefreshDecision(settings)
    if (decision === 'expired')
      throw new RefreshError(
        'Instagram-token har löpt ut. Lägg in en ny långlivad token i Payload.',
      )
    if (decision === 'missing-dates')
      throw new RefreshError(
        'Tokenens datum saknas eller är ogiltiga. Registrera token och dess kända datum i Payload.',
      )
    if (decision !== 'due') return { status: 'skipped', reason: decision }

    const url = new URL('https://graph.instagram.com/refresh_access_token')
    url.searchParams.set('grant_type', 'ig_refresh_token')
    url.searchParams.set('access_token', decryptInstagramToken(settings.accessToken))
    const response = await fetch(url, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok)
      throw new RefreshError(
        `Instagram nekade förnyelsen (HTTP ${response.status}). Kontrollera token och behörigheter. Vid tillfälliga fel försöker nästa cron-körning igen.`,
      )
    const data: unknown = await response.json()
    if (
      !data ||
      typeof data !== 'object' ||
      !('access_token' in data) ||
      typeof data.access_token !== 'string' ||
      !data.access_token.trim() ||
      !('expires_in' in data) ||
      typeof data.expires_in !== 'number' ||
      !Number.isSafeInteger(data.expires_in) ||
      data.expires_in <= 0 ||
      data.expires_in > 366 * 86400
    )
      throw new RefreshError(
        'Instagram returnerade ett ogiltigt förnyelsesvar. Den tidigare token har behållits.',
      )

    const refreshedAt = new Date()
    const expiresAt = new Date(refreshedAt.getTime() + data.expires_in * 1000)
    const saved = await updateInstagramSettingsIfUnchanged(payload, settings.accessToken, {
      accessToken: encryptInstagramToken(data.access_token.trim()),
      tokenExpiresAt: expiresAt.toISOString(),
      lastRefreshedAt: refreshedAt.toISOString(),
      tokenIssuedAt: refreshedAt.toISOString(),
      tokenRegisteredAt: refreshedAt.toISOString(),
      refreshError: null,
    })
    if (!saved) return { status: 'skipped', reason: 'token-changed' }
    return {
      status: 'refreshed',
      tokenExpiresAt: expiresAt.toISOString(),
      lastRefreshedAt: refreshedAt.toISOString(),
    }
  } catch (error) {
    // Meta response bodies, fetch errors, and request URLs can contain secrets. Never log them.
    const message =
      error instanceof RefreshError || error instanceof InstagramEncryptionError
        ? error.message
        : 'Instagram-token kunde inte förnyas på grund av ett anslutnings- eller databasfel. Den tidigare token har behållits.'
    console.error(`[instagram] ${message}`)
    if (settings?.accessToken) {
      try {
        await updateInstagramSettingsIfUnchanged(payload, settings.accessToken, {
          refreshError: message,
        })
      } catch {
        console.error('[instagram] Felstatus kunde inte sparas i databasen.')
      }
    }
    return { status: 'failed', error: message }
  } finally {
    if (owner) {
      try {
        await releaseInstagramRefreshLock(payload, owner)
      } catch {
        console.error('[instagram] Låset kunde inte släppas; det löper ut automatiskt.')
      }
    }
  }
}
