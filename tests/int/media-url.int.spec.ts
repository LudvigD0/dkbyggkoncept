import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMediaUrl } from '@/utilities/getMediaUrl'

afterEach(() => vi.unstubAllEnvs())

describe('CMS media cache URLs', () => {
  const origin = 'https://www.dkbyggkoncept.se'
  const path = '/api/media/file/kok-vargarda.webp'
  const updatedAt = '2026-10-11T20:40:38.623Z'

  it('uses an absolute, versioned CMS URL when the production origin is supplied', () => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_ORIGIN', origin)
    expect(getMediaUrl(path, updatedAt)).toBe(`${origin}${path}?v=2026-10-11T20%3A40%3A38.623Z`)
  })

  it('keeps local and preview CMS URLs relative without the production origin', () => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_ORIGIN', '')
    expect(getMediaUrl(path, updatedAt)).toBe(`${path}?v=2026-10-11T20%3A40%3A38.623Z`)
  })

  it('preserves existing query parameters and changes the cache URL after a CMS update', () => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_ORIGIN', origin)
    const original = getMediaUrl(`${path}?download=false`, updatedAt)
    const updated = getMediaUrl(`${path}?download=false`, '2026-10-16T20:00:00.000Z')
    expect(original).toBe(`${origin}${path}?download=false&v=2026-10-11T20%3A40%3A38.623Z`)
    expect(updated).not.toBe(original)
    expect(new URL(updated).searchParams.get('v')).toBe('2026-10-16T20:00:00.000Z')
  })

  it.each([
    `${origin}${path}`,
    'https://storage.example.com/image.webp',
    '/design/hero-background.mp4',
  ])('preserves existing absolute URLs and other public paths: %s', (url) => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_ORIGIN', origin)
    expect(getMediaUrl(url)).toBe(url)
  })

  it.each([undefined, null, ''])('keeps missing media empty: %s', (url) => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_ORIGIN', origin)
    expect(getMediaUrl(url)).toBe('')
  })
})
