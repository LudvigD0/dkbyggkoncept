'use client'

import { useEffect, useId, useRef, useState, type ReactNode, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function ProjectSlider({
  children,
  count,
  label,
  previousLabel,
  nextLabel,
  scrollLabel,
}: {
  children?: ReactNode
  count: number
  label: string
  previousLabel: string
  nextLabel: string
  scrollLabel?: string | null
}) {
  const track = useRef<HTMLDivElement>(null)
  const id = useId()
  const [limits, setLimits] = useState({ start: true, end: count < 2 })
  const update = () => {
    const element = track.current
    if (!element) return
    const start = element.scrollLeft < 2
    const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2
    setLimits((old) => (old.start === start && old.end === end ? old : { start, end }))
  }
  useEffect(() => {
    update()
    const observer = new ResizeObserver(update)
    if (track.current) observer.observe(track.current)
    return () => observer.disconnect()
  }, [count])

  const move = (direction: number | 'first' | 'last') => {
    const element = track.current
    if (!element) return
    const photos = Array.from(element.children) as HTMLElement[]
    if (!photos.length) return
    let nearest = 0
    photos.forEach((photo, index) => {
      if (
        Math.abs(photo.offsetLeft - element.scrollLeft) <
        Math.abs(photos[nearest].offsetLeft - element.scrollLeft)
      )
        nearest = index
    })
    const index =
      direction === 'first'
        ? 0
        : direction === 'last'
          ? photos.length - 1
          : Math.max(0, Math.min(photos.length - 1, nearest + direction))
    element.scrollTo({
      left: photos[index].offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const direction =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight'
          ? 1
          : event.key === 'Home'
            ? 'first'
            : event.key === 'End'
              ? 'last'
              : null
    if (direction === null) return
    event.preventDefault()
    move(direction)
  }

  return (
    <div>
      <div
        ref={track}
        id={id}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onScroll={update}
        className="project-slider relative flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4"
      >
        {children}
      </div>
      {count > 1 && (
        <div className="mt-3 flex items-center justify-between gap-5">
          {scrollLabel && <p className="text-sm text-muted-foreground">{scrollLabel}</p>}
          <div className="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={previousLabel}
              aria-controls={id}
              disabled={limits.start}
              onClick={() => move(-1)}
              className="grid h-11 w-11 place-items-center rounded-md border border-border hover:bg-secondary disabled:opacity-30"
            >
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              aria-controls={id}
              disabled={limits.end}
              onClick={() => move(1)}
              className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white hover:bg-ink/80 disabled:opacity-30"
            >
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
