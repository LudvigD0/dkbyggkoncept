import type { GalleryBlock } from '@/payload-types'
import { BeforeAfter } from '@/components/site/BeforeAfter'
import { CMSLink } from '@/components/Link'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { Actions, Photo, SectionHeading } from '../siteComponents'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/utilities/ui'
export function GalleryComponent(block: GalleryBlock & { priority?: boolean }) {
  const Heading = block.heading ? 'h3' : 'h2'
  const entries = block.entries || []
  const hasHeading = Boolean(block.heading || block.eyebrow || block.body)
  return (
    <section id={block.anchor || undefined} className="container-site">
      {hasHeading && <SectionHeading {...block} />}
      <div
        className={cn(
          'grid gap-4',
          hasHeading && 'mt-10',
          block.layout === 'mosaic' || block.layout === 'team'
            ? 'md:grid-cols-12'
            : block.columns === '1'
              ? 'grid-cols-1'
              : block.columns === '3'
                ? 'md:grid-cols-3'
                : 'md:grid-cols-2',
        )}
      >
        {entries.map((entry, i) => {
          const before =
            entry.beforeImage && typeof entry.beforeImage === 'object' ? entry.beforeImage : null
          const after =
            entry.afterImage && typeof entry.afterImage === 'object' ? entry.afterImage : null
          const project = Boolean(entry.title && (entry.category || entry.place))
          const mosaic = block.layout === 'mosaic'
          return (
            <article
              key={entry.id || i}
              className={cn(
                'overflow-hidden',
                project && 'rounded-4xl border border-border bg-card p-3',
                mosaic && (i === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5'),
                block.layout === 'team' && (i === 0 ? 'md:col-span-5' : 'md:col-span-7'),
                !entry.image &&
                  !before &&
                  'flex flex-col justify-center rounded-3xl bg-secondary p-8',
                block.layout === 'team' &&
                  !entry.image &&
                  'border-2 border-dashed border-border text-center',
              )}
            >
              {before?.url && after?.url ? (
                <BeforeAfter
                  before={getMediaUrl(before.url, before.updatedAt)}
                  after={getMediaUrl(after.url, after.updatedAt)}
                  alt={entry.imageAlt || entry.category || entry.title || ''}
                  beforeLabel={entry.beforeLabel || ''}
                  afterLabel={entry.afterLabel || ''}
                  compareLabel={entry.compareLabel || ''}
                />
              ) : (
                <Photo
                  {...entry}
                  priority={block.priority && i === 0}
                  className={cn(
                    block.layout === 'team' ? 'aspect-square' : 'aspect-[4/3]',
                    mosaic &&
                      (i === 0 ? 'md:h-full md:min-h-[520px]' : 'md:h-[252px] md:aspect-auto'),
                  )}
                />
              )}
              {(entry.title ||
                entry.description ||
                entry.category ||
                entry.place ||
                entry.enableLink) && (
                <div
                  className={cn(
                    project
                      ? 'flex items-center justify-between gap-3 px-3 py-4'
                      : entry.image
                        ? 'pt-4'
                        : '',
                  )}
                >
                  <div>
                    {entry.title && (
                      <Heading className="font-display text-2xl font-semibold leading-snug">
                        {entry.title}
                      </Heading>
                    )}
                    {entry.description && (
                      <p className="mt-2 whitespace-pre-line text-muted-foreground">
                        {entry.description}
                      </p>
                    )}
                    {entry.place && (
                      <p className="mt-1 text-sm text-muted-foreground">{entry.place}</p>
                    )}
                    {entry.enableLink && entry.link && (
                      <CMSLink
                        {...entry.link}
                        className="mt-6 inline-flex items-center gap-2 font-semibold"
                      >
                        <ArrowRight size={16} aria-hidden="true" />
                      </CMSLink>
                    )}
                  </div>
                  {entry.category && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                      {entry.category}
                    </span>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
      <Actions links={block.links} />
    </section>
  )
}
