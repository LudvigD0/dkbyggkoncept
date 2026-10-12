import NextImage from 'next/image'
import type { Props as MediaProps } from '../types'
import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export function ImageMedia({
  alt,
  fill,
  pictureClassName,
  imgClassName,
  priority,
  resource,
  size,
  src,
  loading,
  onLoad,
}: MediaProps) {
  const media = resource && typeof resource === 'object' ? resource : null
  const imageSrc = src || getMediaUrl(media?.url, media?.updatedAt)
  if (!imageSrc) return null
  const staticImage = typeof imageSrc === 'object' ? imageSrc : null
  const width = media?.width || staticImage?.width || undefined
  const height = media?.height || staticImage?.height || undefined
  return (
    <picture className={cn(fill && 'absolute inset-0', pictureClassName)}>
      <NextImage
        src={imageSrc}
        alt={alt ?? media?.alt ?? ''}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(imgClassName)}
        preload={priority || undefined}
        loading={priority ? undefined : loading || 'lazy'}
        quality={75}
        sizes={size || '100vw'}
        style={
          media?.focalX != null && media?.focalY != null
            ? { objectPosition: `${media.focalX}% ${media.focalY}%` }
            : undefined
        }
        onLoad={onLoad}
        {...(staticImage?.blurDataURL
          ? { placeholder: 'blur' as const, blurDataURL: staticImage.blurDataURL }
          : {})}
      />
    </picture>
  )
}
