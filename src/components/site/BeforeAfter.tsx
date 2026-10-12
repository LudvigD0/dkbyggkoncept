'use client'
import Image from 'next/image'
import { useState } from 'react'

/** Drag-to-compare before/after images. Pass the company's own photos. */
export function BeforeAfter({
  before,
  after,
  alt,
  beforeLabel = 'Före',
  afterLabel = 'Efter',
  compareLabel = 'Jämför före och efter',
}: {
  before: string
  after: string
  alt: string
  beforeLabel?: string
  afterLabel?: string
  compareLabel?: string
}) {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative aspect-[4/3] select-none overflow-hidden rounded-3xl bg-secondary">
      <Image
        src={after}
        alt={`${alt} – efter`}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        sizes="(max-width: 768px) 100vw, 640px"
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={before}
          alt={`${alt} – före`}
          className="h-full w-full object-cover grayscale"
          fill
          sizes="(max-width: 768px) 100vw, 640px"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-background"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-background text-xs font-bold shadow-soft">
          ↔
        </span>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold">
        {afterLabel}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={compareLabel}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0 focus:opacity-100"
      />
    </div>
  )
}
