import type { StaticImageData } from 'next/image'
import type { ElementType, Ref, ReactNode } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData | string // for static media
  videoClassName?: string
  videoMode?: 'background' | 'player'
  fallbackResource?: MediaType | string | number | null
  pauseLabel?: string
  playLabel?: string
  children?: ReactNode
}
