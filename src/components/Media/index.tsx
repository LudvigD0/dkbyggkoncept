import { Fragment } from 'react'
import type { Props } from './types'
import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
export function Media(props: Props) {
  const { className, htmlElement = 'div', resource, fallbackResource, videoMode } = props
  const isVideo =
    (videoMode === 'background' && typeof props.src === 'string') ||
    (typeof resource === 'object' && resource?.mimeType?.startsWith('video/'))
  const Tag = htmlElement || Fragment
  return (
    <Tag {...(htmlElement !== null ? { className } : {})}>
      {isVideo ? (
        <VideoMedia {...props}>
          {fallbackResource && videoMode === 'background' && (
            <ImageMedia
              {...props}
              resource={fallbackResource}
              src={undefined}
              fill
              imgClassName="object-cover"
            />
          )}
        </VideoMedia>
      ) : (
        <ImageMedia {...props} />
      )}
    </Tag>
  )
}
