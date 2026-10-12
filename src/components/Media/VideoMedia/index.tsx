'use client'
import type { Props as MediaProps } from '../types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'
import { BackgroundVideo } from './Background'
export function VideoMedia({
  resource,
  src,
  videoMode = 'player',
  videoClassName,
  children,
  pauseLabel,
  playLabel,
  onClick,
}: MediaProps) {
  const media = resource && typeof resource === 'object' ? resource : null
  const videoSrc = typeof src === 'string' ? src : getMediaUrl(media?.url, media?.updatedAt)
  if (!videoSrc) return children || null
  if (videoMode === 'background')
    return (
      <BackgroundVideo src={videoSrc} pauseLabel={pauseLabel} playLabel={playLabel}>
        {children}
      </BackgroundVideo>
    )
  return (
    <video
      src={videoSrc}
      className={cn(videoClassName)}
      controls
      playsInline
      preload="none"
      onClick={onClick}
    />
  )
}
