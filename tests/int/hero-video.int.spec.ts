import React from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BackgroundVideo } from '@/components/Media/VideoMedia/Background'
import { HighImpactHero } from '@/heros/HighImpact'
import { isLocalHeroVideoPath } from '@/heros/localVideo'
import type { Media } from '@/payload-types'

vi.mock('@/components/RichText', () => ({ default: () => null }))

let intersect: (entries: Array<{ isIntersecting: boolean }>) => void
let idle: () => void
let imageComplete = true
let reduced = false
const connection = Object.assign(new EventTarget(), { saveData: false, effectiveType: '4g' })

beforeEach(() => {
  imageComplete = true
  reduced = false
  connection.saveData = false
  connection.effectiveType = '4g'
  idle = () => {}
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(() => imageComplete)
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1280)
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: reduced }))
  vi.stubGlobal('requestIdleCallback', (callback: () => void) => {
    idle = callback
    return 1
  })
  vi.stubGlobal('cancelIdleCallback', () => {
    idle = () => {}
  })
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof intersect) {
        intersect = callback
      }
      observe() {}
      disconnect() {}
    },
  )
  Object.defineProperty(navigator, 'connection', { configurable: true, value: connection })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'connection')
})
const mount = () =>
  render(
    React.createElement(
      BackgroundVideo,
      { src: '/design/hero-background.mp4' },
      React.createElement('img', { src: '/fallback.jpg', alt: '' }),
    ),
  )
const show = () =>
  act(() => {
    intersect([{ isIntersecting: true }])
    idle()
  })

describe('Hero video loading policy', () => {
  const image: Media = {
    id: 'poster',
    url: '/fallback.jpg',
    mimeType: 'image/jpeg',
    width: 1280,
    height: 720,
    createdAt: '',
    updatedAt: '',
  }
  it('uses a local hero file without requiring a Payload video upload', () => {
    const { container } = render(
      React.createElement(HighImpactHero, {
        type: 'highImpact',
        pageSlug: 'home',
        media: image,
        enableBackgroundVideo: true,
        backgroundVideoPath: '/design/hero-background.mp4',
        backgroundVideo: null,
      }),
    )
    expect(container.querySelector('video')?.getAttribute('src')).toBeNull()
    show()
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/design/hero-background.mp4',
    )
    expect(container.querySelector('img')).not.toBeNull()
  })
  it('does not render a local background video on other pages', () => {
    const { container } = render(
      React.createElement(HighImpactHero, {
        type: 'highImpact',
        pageSlug: 'totalrenovering-goteborg',
        media: image,
        enableBackgroundVideo: true,
        backgroundVideoPath: '/design/hero-background.mp4',
      }),
    )
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('img')).not.toBeNull()
  })
  it.each([
    'https://example.com/video.mp4',
    '//example.com/video.mp4',
    '/../private/video.mp4',
    '/design/video.mp4?token=private',
  ])('rejects non-public-path syntax %s', (path) => {
    expect(isLocalHeroVideoPath(path)).toBe(false)
  })
  it('waits for the fallback image before requesting video', () => {
    imageComplete = false
    const { container } = mount()
    show()
    expect(container.querySelector('video')?.getAttribute('src')).toBeNull()
    act(() => {
      fireEvent.load(container.querySelector('img')!)
      idle()
    })
    expect(container.querySelector('video')?.getAttribute('src')).toBe(
      '/design/hero-background.mp4',
    )
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })
  it.each(['reduced-motion', 'save-data', 'slow-connection'])(
    'does not fetch video for %s',
    (policy) => {
      reduced = policy === 'reduced-motion'
      connection.saveData = policy === 'save-data'
      connection.effectiveType = policy === 'slow-connection' ? '3g' : '4g'
      const { container } = mount()
      show()
      expect(container.querySelector('video')?.getAttribute('src')).toBeNull()
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
    },
  )
  it('pauses outside the viewport and resumes on return', () => {
    mount()
    show()
    const count = vi.mocked(HTMLMediaElement.prototype.pause).mock.calls.length
    act(() => intersect([{ isIntersecting: false }]))
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(count + 1)
    const plays = vi.mocked(HTMLMediaElement.prototype.play).mock.calls.length
    show()
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(plays + 1)
  })
})
