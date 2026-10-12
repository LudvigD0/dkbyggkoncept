// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import type { InstagramSetting } from '@/payload-types'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/dist/compiled/server-only', () => ({}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('@/instagram/cache', () => ({ getCachedInstagramPosts: vi.fn() }))
vi.mock('payload', async (original) => ({
  ...(await original<typeof import('payload')>()),
  getPayload: vi.fn(),
}))

import { getPayload } from 'payload'
import { encryptInstagramToken, decryptInstagramToken } from '@/instagram/encryption'
import { InstagramSettings, prepareInstagramSettings } from '@/instagram/config'
import { instagramRefreshDecision, refreshInstagramToken } from '@/instagram/refresh'
import { getInstagramAccessToken } from '@/instagram/store'
import { getInstagramPosts } from '@/instagram/posts'
import { GET } from '@/app/(frontend)/api/cron/refresh-instagram/route'
import { getCachedInstagramPosts } from '@/instagram/cache'
import { InstagramFeedComponent } from '@/blocks/InstagramFeed/Component'
import { addHomeInstagram, instagramFeedBlock } from '../../scripts/data/instagram'

const day = 86400_000
const now = Date.parse('2026-10-11T12:00:00Z')
let doc: InstagramSetting
let lease: { owner: string; expiresAt: Date } | null
let payload: Payload
let fetchMock: ReturnType<typeof vi.fn>
let update: ReturnType<typeof vi.fn>
let log: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64'))
  vi.stubEnv('CRON_SECRET', 'test-cron-secret')
  doc = {
    id: 'settings-test',
    accessToken: encryptInstagramToken('old-test-token'),
    tokenIssuedAt: new Date(now - 46 * day).toISOString(),
    tokenRegisteredAt: new Date(now - 2 * day).toISOString(),
    tokenExpiresAt: new Date(now + 14 * day).toISOString(),
    refreshError: 'Ett tidigare fel',
  }
  lease = null
  update = vi.fn(async (filter, change) => {
    if (filter.accessToken !== doc.accessToken) return { matchedCount: 0 }
    Object.assign(doc, change.$set)
    return { matchedCount: 1 }
  })
  payload = {
    db: {
      findGlobal: vi.fn(async () => ({ ...doc })),
      globals: { collection: { updateOne: update } },
      connection: {
        db: {
          collection: () => ({
            findOneAndUpdate: vi.fn(async (_filter, change) => {
              if (lease && lease.expiresAt.getTime() > Date.now()) throw { code: 11000 }
              lease = change.$set
              return lease
            }),
            deleteOne: vi.fn(async (filter) => {
              if (lease?.owner === filter.owner) lease = null
            }),
          }),
        },
      },
    },
  } as unknown as Payload
  vi.mocked(getPayload).mockResolvedValue(payload)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  log = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(getCachedInstagramPosts).mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.mocked(getPayload).mockReset()
})

const refreshedResponse = () =>
  Response.json({ access_token: 'new-test-token', expires_in: 5184000 })
const date = (offset: number) => new Date(now + offset * day).toISOString()

describe('Instagram token security', () => {
  it('encrypts with a fresh IV and rejects tampering and a missing/wrong key', () => {
    const one = encryptInstagramToken('a-secret')
    const two = encryptInstagramToken('a-secret')
    expect(one).not.toBe(two)
    expect(one).not.toContain('a-secret')
    expect(decryptInstagramToken(one)).toBe('a-secret')
    expect(() => decryptInstagramToken(`${one.slice(0, -5)}AAAAA`)).toThrow()
    vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY', Buffer.alloc(32, 9).toString('base64'))
    expect(() => decryptInstagramToken(one)).toThrow()
    vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY', '')
    expect(() => encryptInstagramToken('a-secret')).toThrow(/INSTAGRAM_TOKEN_ENCRYPTION_KEY/)
  })

  it('distinguishes missing, invalid and mismatched keys without revealing secrets', () => {
    const token = 'private-test-token'
    const encrypted = encryptInstagramToken(token)
    const wrongKey = Buffer.alloc(32, 9).toString('base64')
    for (const [key, code] of [
      ['', 'missing-key'],
      ['invalid-private-key', 'invalid-key'],
      [wrongKey, 'decryption-failed'],
    ]) {
      vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY', key)
      let caught: unknown
      try {
        decryptInstagramToken(encrypted)
      } catch (error) {
        caught = error
      }
      expect(caught).toMatchObject({ name: 'InstagramEncryptionError', code })
      expect((caught as Error).message).toContain('INSTAGRAM_TOKEN_ENCRYPTION_KEY')
      expect((caught as Error).message).not.toContain(token)
      expect((caught as Error).message).not.toContain(encrypted)
      if (key) expect((caught as Error).message).not.toContain(key)
    }
    vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY', '')
    expect(() => encryptInstagramToken(token)).toThrow(/saknas i serverns miljö/)
    vi.stubEnv('INSTAGRAM_TOKEN_ENCRYPTION_KEY', 'invalid-private-key')
    expect(() => encryptInstagramToken(token)).toThrow(/har fel format/)
  })

  it('denies public access and masks the token for admins and ordinary Local API reads', async () => {
    const access = InstagramSettings.access!.read!
    expect(await access({ req: { user: null } } as Parameters<typeof access>[0])).toBe(false)
    expect(
      await access({ req: { user: { collection: 'other' } } } as unknown as Parameters<
        typeof access
      >[0]),
    ).toBe(false)
    expect(
      await access({ req: { user: { collection: 'users' } } } as Parameters<typeof access>[0]),
    ).toBe(true)
    const hook = InstagramSettings.hooks!.afterRead![0]
    const masked = await hook({ doc } as Parameters<typeof hook>[0])
    expect(masked.accessToken).toBeNull()
    expect(masked.hasAccessToken).toBe(true)
    expect(await getInstagramAccessToken(payload)).toBe('old-test-token')
  })

  it('preserves a blank write-only token and clears stale dates when replacing it', async () => {
    const kept = await prepareInstagramSettings({
      data: { accessToken: '' },
      originalDoc: doc,
    } as Parameters<typeof prepareInstagramSettings>[0])
    expect(kept.accessToken).toBe(doc.accessToken)
    const replaced = await prepareInstagramSettings({
      data: {
        accessToken: 'replacement',
        tokenExpiresAt: doc.tokenExpiresAt,
        tokenIssuedAt: doc.tokenIssuedAt,
      },
      originalDoc: doc,
    } as Parameters<typeof prepareInstagramSettings>[0])
    expect(decryptInstagramToken(replaced.accessToken)).toBe('replacement')
    expect(replaced.tokenRegisteredAt).toBe(date(0))
    expect(replaced.tokenExpiresAt).toBeNull()
    expect(replaced.tokenIssuedAt).toBeNull()
    expect(replaced.lastRefreshedAt).toBeNull()
    expect(replaced.refreshError).toBeNull()
    const partial = await prepareInstagramSettings({
      data: { accessToken: 'another-replacement' },
      originalDoc: doc,
    } as Parameters<typeof prepareInstagramSettings>[0])
    expect(partial.tokenExpiresAt).toBeNull()
    expect(partial.tokenIssuedAt).toBeNull()
  })
})

describe('Daily renewal policy', () => {
  it.each([
    [{ tokenIssuedAt: date(-44), tokenExpiresAt: date(16) }, 'not-due'],
    [{ tokenIssuedAt: date(-45) }, 'due'],
    [{ tokenIssuedAt: date(-5), tokenExpiresAt: date(7) }, 'due'],
    [{ tokenIssuedAt: date(-0.99), tokenExpiresAt: date(0.5) }, 'too-young'],
    [{ tokenIssuedAt: date(-1), tokenExpiresAt: null }, 'due'],
    [{ tokenIssuedAt: null, tokenExpiresAt: null, tokenRegisteredAt: date(-0.5) }, 'too-young'],
    [{ tokenIssuedAt: null, tokenExpiresAt: null, tokenRegisteredAt: date(-1) }, 'due'],
    [{ tokenExpiresAt: date(-1) }, 'expired'],
    [{ tokenIssuedAt: null, tokenRegisteredAt: null }, 'missing-dates'],
  ] as const)('handles %j as %s', (fields, expected) => {
    expect(instagramRefreshDecision({ ...doc, ...fields }, now)).toBe(expected)
  })

  it('persists the refreshed encrypted token, expiry and timestamp, clears errors and avoids a repeat API call', async () => {
    fetchMock.mockResolvedValue(refreshedResponse())
    const result = await refreshInstagramToken(payload)
    expect(result).toEqual({
      status: 'refreshed',
      tokenExpiresAt: date(60),
      lastRefreshedAt: date(0),
    })
    expect(doc.accessToken).not.toContain('new-test-token')
    expect(await getInstagramAccessToken(payload)).toBe('new-test-token')
    expect(doc.refreshError).toBeNull()
    const [url, options] = fetchMock.mock.calls[0]
    expect(url.origin + url.pathname).toBe('https://graph.instagram.com/refresh_access_token')
    expect(url.searchParams.get('grant_type')).toBe('ig_refresh_token')
    expect(url.searchParams.get('access_token')).toBe('old-test-token')
    expect(options.cache).toBe('no-store')
    expect(await refreshInstagramToken(payload)).toEqual({ status: 'skipped', reason: 'too-young' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lease).toBeNull()
  })

  it.each([
    ['http-error', () => Response.json({ error: 'old-test-token' }, { status: 503 })],
    ['missing-token', () => Response.json({ expires_in: 5184000 })],
    ['bad-expiry', () => Response.json({ access_token: 'new-test-token', expires_in: -1 })],
    [
      'string-expiry',
      () => Response.json({ access_token: 'new-test-token', expires_in: '5184000' }),
    ],
  ])('preserves the old token and dates for %s', async (_name, response) => {
    const previous = { ...doc }
    fetchMock.mockResolvedValue(response())
    const result = await refreshInstagramToken(payload)
    expect(result.status).toBe('failed')
    expect(doc.accessToken).toBe(previous.accessToken)
    expect(doc.tokenExpiresAt).toBe(previous.tokenExpiresAt)
    expect(doc.lastRefreshedAt).toBe(previous.lastRefreshedAt)
    expect(doc.refreshError).toBeTruthy()
    expect(JSON.stringify(log.mock.calls)).not.toContain('old-test-token')
    expect(JSON.stringify(result)).not.toContain('new-test-token')
    expect(lease).toBeNull()
  })

  it('sanitizes fetch exceptions and retries safely on the next run', async () => {
    fetchMock.mockRejectedValueOnce(new Error('https://example.test?access_token=old-test-token'))
    expect((await refreshInstagramToken(payload)).status).toBe('failed')
    expect(JSON.stringify(log.mock.calls)).not.toContain('old-test-token')
    expect(doc.refreshError).not.toContain('access_token')
    fetchMock.mockResolvedValueOnce(refreshedResponse())
    expect((await refreshInstagramToken(payload)).status).toBe('refreshed')
  })

  it('records an expired token without calling Meta', async () => {
    doc.tokenExpiresAt = date(-1)
    expect((await refreshInstagramToken(payload)).status).toBe('failed')
    expect(doc.refreshError).toContain('löpt ut')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('allows only one concurrent renewal', async () => {
    let finish!: (response: Response) => void
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve
        }),
    )
    const first = refreshInstagramToken(payload)
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(await refreshInstagramToken(payload)).toEqual({ status: 'skipped', reason: 'locked' })
    finish(refreshedResponse())
    expect((await first).status).toBe('refreshed')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not overwrite an administrator replacement made while Meta responds', async () => {
    fetchMock.mockImplementation(async () => {
      doc.accessToken = encryptInstagramToken('manual-replacement')
      return refreshedResponse()
    })
    expect(await refreshInstagramToken(payload)).toEqual({
      status: 'skipped',
      reason: 'token-changed',
    })
    expect(await getInstagramAccessToken(payload)).toBe('manual-replacement')
  })
})

describe('Cron authorization', () => {
  it.each([undefined, '', 'wrong', 'Bearer test-cron-secretx'])(
    'rejects authorization %s before database initialization',
    async (authorization) => {
      const request = new Request('https://example.test/api/cron/refresh-instagram', {
        headers: authorization ? { Authorization: authorization } : {},
      })
      const response = await GET(request)
      expect(response.status).toBe(401)
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(getPayload).not.toHaveBeenCalled()
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('rejects requests when CRON_SECRET is absent', async () => {
    vi.stubEnv('CRON_SECRET', '')
    expect(
      (await GET(new Request('https://example.test', { headers: { Authorization: 'Bearer ' } })))
        .status,
    ).toBe(401)
    expect(getPayload).not.toHaveBeenCalled()
  })

  it('returns safe metadata for authorized mocked renewal', async () => {
    fetchMock.mockResolvedValue(refreshedResponse())
    const response = await GET(
      new Request('https://example.test', {
        headers: { Authorization: 'Bearer test-cron-secret' },
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.text()
    expect(body).toContain('refreshed')
    expect(body).not.toContain('test-token')
  })
})

describe('Server-only posts', () => {
  it('reads the current Payload token and returns only public post fields after a refresh', async () => {
    fetchMock.mockResolvedValueOnce(refreshedResponse())
    await refreshInstagramToken(payload)
    fetchMock.mockResolvedValueOnce(Response.json({ user_id: '123456' }))
    fetchMock.mockResolvedValueOnce(
      Response.json({
        data: [
          {
            id: '1',
            caption: 'Byggprojekt',
            media_type: 'IMAGE',
            media_url: 'https://cdn.example.test/project.jpg',
            permalink: 'https://www.instagram.com/p/example/',
            access_token: 'new-test-token',
          },
        ],
        paging: { next: 'https://graph.instagram.com/?access_token=new-test-token' },
      }),
    )
    const posts = await getInstagramPosts(payload)
    expect(posts).toHaveLength(1)
    expect(posts[0].caption).toBe('Byggprojekt')
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer new-test-token')
    expect(JSON.stringify(posts)).not.toContain('new-test-token')
    expect(JSON.stringify(posts)).not.toContain('paging')
  })

  it('returns an empty feed on an API failure without exposing the error or crashing', async () => {
    fetchMock.mockRejectedValue(new Error('old-test-token'))
    expect(await getInstagramPosts(payload)).toEqual([])
    expect(JSON.stringify(log.mock.calls)).not.toContain('old-test-token')
  })
})

describe('Editable Instagram block', () => {
  it('renders post links and lazy images, using video thumbnails and editable headings', async () => {
    vi.mocked(getCachedInstagramPosts).mockResolvedValue([
      {
        id: '1',
        caption: 'Badrumsrenovering',
        mediaType: 'IMAGE',
        mediaUrl: 'https://scontent.cdninstagram.com/photo.jpg',
        thumbnailUrl: null,
        permalink: 'https://www.instagram.com/p/project1/',
        timestamp: '2026-10-01T12:00:00Z',
      },
      {
        id: '2',
        caption: 'Takbyte',
        mediaType: 'VIDEO',
        mediaUrl: 'https://scontent.cdninstagram.com/video.mp4',
        thumbnailUrl: 'https://scontent.cdninstagram.com/thumbnail.jpg',
        permalink: 'https://www.instagram.com/p/project2/',
        timestamp: null,
      },
    ])
    const html = renderToStaticMarkup(
      await InstagramFeedComponent({
        ...instagramFeedBlock(),
        heading: 'Våra senaste projekt',
        postCount: '3',
      }),
    )
    expect(html).toContain('Våra senaste projekt')
    expect(html).toContain('https://www.instagram.com/p/project1/')
    expect(html).toContain('thumbnail.jpg')
    expect(html).not.toContain('video.mp4')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('lg:grid-cols-3')
    expect(getCachedInstagramPosts).toHaveBeenCalledWith(3)
  })

  it('keeps the account link visible when no posts are available', async () => {
    vi.mocked(getCachedInstagramPosts).mockResolvedValue([])
    const html = renderToStaticMarkup(await InstagramFeedComponent(instagramFeedBlock()))
    expect(html).toContain('https://www.instagram.com/dkbyggkoncept_ab/')
    expect(html).toContain('Se fler bilder från våra projekt')
    expect(html).not.toContain('<img')
  })

  it('adds the homepage block once and preserves edited blocks', () => {
    const existing = [
      { blockType: 'intro' as const, heading: 'Min rubrik' },
      { blockType: 'siteCTA' as const },
    ]
    const result = addHomeInstagram(existing)
    expect(result.map((block) => block.blockType)).toEqual(['intro', 'instagramFeed', 'siteCTA'])
    expect(result[0]).toEqual(existing[0])
    expect(addHomeInstagram(result)).toBe(result)
  })
})
