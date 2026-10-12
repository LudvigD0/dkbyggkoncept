import type { BeforeAfterBlock } from '@/payload-types'
import { Actions, Photo, SectionHeading } from '../siteComponents'
import { PhotoPlaceholder } from '../ProjectShowcase/Placeholder'

export function BeforeAfterComponent(block: BeforeAfterBlock) {
  const photos = [
    {
      image: block.beforeImage,
      imageAlt: block.beforeAlt,
      caption: block.beforeCaption,
      label: block.beforeLabel || 'Före',
    },
    {
      image: block.afterImage,
      imageAlt: block.afterAlt,
      caption: block.afterCaption,
      label: block.afterLabel || 'Efter',
    },
  ]
  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div className="max-w-3xl">
        <SectionHeading {...block} />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {photos.map((photo, index) => (
          <figure key={index}>
            <div className="relative overflow-hidden rounded-md">
              {photo.image && typeof photo.image === 'object' ? (
                <Photo
                  {...photo}
                  className="aspect-[4/3] rounded-none"
                  sizes="(max-width: 767px) 100vw, 630px"
                />
              ) : (
                <PhotoPlaceholder label={block.placeholderLabel} className="aspect-[4/3]" />
              )}
              <span className="absolute top-4 left-4 border-l-2 border-accent bg-ink px-4 py-2 text-sm font-semibold text-white">
                {photo.label}
              </span>
            </div>
            {photo.caption && (
              <figcaption className="border-b border-border py-4 text-sm text-muted-foreground">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <Actions links={block.links} />
    </section>
  )
}
