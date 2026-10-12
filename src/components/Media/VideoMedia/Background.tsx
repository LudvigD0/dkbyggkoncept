'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string }

/** No video URL is assigned until the prioritized still image has loaded. */
export function BackgroundVideo({
  children,
  src,
  pauseLabel = 'Pausa bakgrundsvideo',
  playLabel = 'Spela bakgrundsvideo',
}: {
  children?: ReactNode
  src: string
  pauseLabel?: string
  playLabel?: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = video.current
    const frame = container.current
    if (!element || !frame) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: Connection }).connection
    const image = frame.querySelector('img')
    let visible = false
    let imageLoaded = Boolean(image?.complete && image.naturalWidth)
    let idle: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let disposed = false
    const allowed = () =>
      !motion.matches &&
      !connection?.saveData &&
      !['slow-2g', '2g', '3g'].includes(connection?.effectiveType || '')
    const cancel = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) clearTimeout(timer)
      idle = undefined
      timer = undefined
    }
    const play = () => {
      if (disposed || !allowed() || !visible || document.hidden || userPaused.current) return
      if (!element.hasAttribute('src')) {
        element.src = src
        element.load()
      }
      void element.play().catch(() => {
        /* Autoplay denied: keep the still image. */
      })
    }
    const sync = () => {
      cancel()
      if (!allowed()) {
        element.pause()
        if (element.hasAttribute('src')) {
          element.removeAttribute('src')
          element.load()
        }
        return
      }
      if (!visible || document.hidden || userPaused.current) {
        element.pause()
        return
      }
      if (!imageLoaded) return
      if (element.hasAttribute('src')) play()
      else if ('requestIdleCallback' in window)
        idle = window.requestIdleCallback(play, { timeout: 2000 })
      else timer = setTimeout(play, 300)
    }
    const onImageLoad = () => {
      imageLoaded = true
      sync()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0.1 },
    )
    observer.observe(frame)
    image?.addEventListener('load', onImageLoad)
    motion.addEventListener('change', sync)
    connection?.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      disposed = true
      cancel()
      observer.disconnect()
      image?.removeEventListener('load', onImageLoad)
      motion.removeEventListener('change', sync)
      connection?.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
  }, [src])

  return (
    <div ref={container} className="absolute inset-0">
      {children}
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:hidden ${ready ? 'opacity-100' : 'opacity-0'}`}
        onPlaying={() => {
          setReady(true)
          setPlaying(true)
        }}
        onPause={() => setPlaying(false)}
        onEmptied={() => {
          setReady(false)
          setPlaying(false)
        }}
        onError={() => {
          setReady(false)
          setPlaying(false)
        }}
      />
      {ready && (
        <button
          type="button"
          aria-label={playing ? pauseLabel : playLabel}
          className="absolute bottom-6 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60 motion-reduce:hidden md:bottom-10 md:right-10"
          onClick={() => {
            const element = video.current
            if (!element) return
            if (playing) {
              userPaused.current = true
              element.pause()
            } else {
              userPaused.current = false
              void element.play().catch(() => {})
            }
          }}
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  )
}
