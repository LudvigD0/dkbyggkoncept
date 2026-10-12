import type { ContactCardsBlock } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { SectionHeading, Icon } from '../siteComponents'
export function ContactCardsComponent(block: ContactCardsBlock) {
  return (
    <section id={block.anchor || undefined} className="container-site">
      {(block.heading || block.eyebrow || block.body) && <SectionHeading {...block} />}
      <div className="grid gap-4 md:grid-cols-3">
        {block.cards?.map((card, i) => {
          const content = (
            <>
              <Icon name={card.icon} className="h-7 w-7 text-accent" />
              <p className={`eyebrow mt-10 ${card.dark ? '!text-ink-foreground/60' : ''}`}>
                {card.label}
              </p>
              <p className="mt-2 break-words font-display text-2xl font-semibold md:text-3xl">
                {card.value}
              </p>
            </>
          )
          const className = `rounded-4xl p-8 ${card.dark ? 'bg-ink text-ink-foreground' : 'bg-card shadow-card transition-transform hover:-translate-y-1'}`
          return card.enableLink && card.link ? (
            <CMSLink key={card.id || i} {...card.link} label={null} className={className}>
              {content}
            </CMSLink>
          ) : (
            <div key={card.id || i} className={className}>
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}
