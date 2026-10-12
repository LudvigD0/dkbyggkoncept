import type { CardGridBlock } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { SectionHeading, Actions, Icon } from '../siteComponents'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/utilities/ui'
export function CardGridComponent(block: CardGridBlock) {
  const Heading = block.heading ? 'h3' : 'h2'
  const grid =
    block.columns === '2'
      ? 'sm:grid-cols-2'
      : block.columns === '3'
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4'
  return (
    <section
      id={block.anchor || undefined}
      className={cn(
        'container-site',
        block.layout === 'split' && 'grid gap-10 md:grid-cols-[1fr_1.4fr]',
      )}
    >
      {(block.heading || block.eyebrow || block.body || (block.links?.length ?? 0) > 0) && (
        <SectionHeading {...block}>
          <Actions links={block.links} />
        </SectionHeading>
      )}
      <div
        className={cn(
          'grid gap-4',
          block.layout === 'split' ? 'sm:grid-cols-2' : grid,
          block.layout !== 'split' && block.heading && 'mt-10',
        )}
      >
        {block.cards?.map((card, i) => {
          const content = (
            <>
              <div className="flex items-start justify-between">
                {block.showNumbers && (
                  <span className="font-display text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                <Icon name={card.icon} className="h-6 w-6 text-accent" />
                {card.enableLink && (
                  <span className="grid h-8 w-8 place-items-center text-muted-foreground transition-colors group-hover:text-accent">
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                )}
              </div>
              <div
                className={cn(
                  (block.showNumbers || card.enableLink || (card.icon && card.icon !== 'none')) &&
                    'mt-8',
                )}
              >
                <Heading className="text-2xl font-semibold">{card.title}</Heading>
                {card.description && (
                  <p className="mt-2 whitespace-pre-line text-muted-foreground">
                    {card.description}
                  </p>
                )}
              </div>
            </>
          )
          const className =
            'group flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-oak'
          return card.enableLink && card.link ? (
            <CMSLink key={card.id || i} {...card.link} label={null} className={className}>
              {content}
            </CMSLink>
          ) : (
            <article key={card.id || i} className={className}>
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}
