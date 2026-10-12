import type { ServiceContentBlock } from '@/payload-types'
import { Actions, Photo, SectionHeading } from '../siteComponents'
import { cn } from '@/utilities/ui'

export function ServiceContentComponent(block: ServiceContentBlock & { priority?: boolean }) {
  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-20">
        <div
          className={cn('min-w-0 lg:sticky lg:top-28', block.imageSide === 'right' && 'lg:order-2')}
        >
          <Photo
            {...block}
            priority={block.priority}
            sizes="(max-width: 1023px) 100vw, 600px"
            className="aspect-[4/3] lg:aspect-[4/5]"
          />
          {(block.note?.heading || block.note?.body) && (
            <div className="mt-4 border-l-2 border-oak bg-secondary/50 px-5 py-4">
              {block.note.heading && <p className="text-lg font-semibold">{block.note.heading}</p>}
              {block.note.body && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {block.note.body}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 py-2">
          <SectionHeading {...block} />
          <div className="mt-8 divide-y divide-border">
            {block.topics?.map((topic, index) => (
              <div
                key={topic.id || index}
                className="grid grid-cols-[2rem_1fr] gap-3 py-6 first:pt-0 sm:gap-5"
              >
                <span className="pt-1 text-xs font-semibold text-accent" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-xl font-semibold sm:text-2xl">{topic.heading}</h3>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {topic.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Actions links={block.links} />
        </div>
      </div>
    </section>
  )
}
