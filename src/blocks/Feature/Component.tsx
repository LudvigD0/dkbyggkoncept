import type { FeatureBlock } from '@/payload-types'
import { Photo, Points, Actions, SectionHeading } from '../siteComponents'
import { cn } from '@/utilities/ui'
export function FeatureComponent(block: FeatureBlock & { priority?: boolean }) {
  const card = block.appearance !== 'plain'
  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div
        className={cn(
          'grid md:grid-cols-2',
          card ? 'overflow-hidden rounded-lg border border-border bg-card' : 'items-center gap-10',
        )}
      >
        <Photo
          {...block}
          priority={block.priority}
          className={cn(
            block.imageAspect === 'square'
              ? 'aspect-square'
              : 'aspect-[4/3] md:aspect-auto md:min-h-[380px]',
            card && 'rounded-none',
            block.imageSide === 'right' && 'md:order-2',
          )}
        />
        <div className={cn('flex flex-col justify-center', card && 'p-8 sm:p-12')}>
          {block.badge && (
            <p className="mb-2 w-fit border-l-2 border-accent pl-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {block.badge}
            </p>
          )}
          <SectionHeading {...block} />
          {block.secondaryBody && (
            <p className="mt-4 whitespace-pre-line text-muted-foreground">{block.secondaryBody}</p>
          )}
          <Points items={block.items} />
          <Actions links={block.links} />
        </div>
      </div>
    </section>
  )
}
