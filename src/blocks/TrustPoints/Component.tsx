import {
  ArrowUpRight,
  BadgePercent,
  Check,
  HardHat,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react'
import { CMSLink } from '@/components/Link'
import type { TrustPointsBlock } from '@/payload-types'
import { Actions } from '../siteComponents'

const icons = {
  check: Check,
  price: ReceiptText,
  experience: HardHat,
  guarantee: ShieldCheck,
  rot: BadgePercent,
}

export function TrustPointsComponent(block: TrustPointsBlock) {
  const items = block.items?.filter((item) => item.title?.trim()) || []
  const areas = block.areas?.filter((area) => area.name?.trim()) || []
  if (!items.length && !areas.length) return null
  const Heading = block.heading ? 'h3' : 'h2'

  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      {(block.eyebrow || block.heading || block.body) && (
        <div className="mb-7 max-w-3xl">
          {block.eyebrow && <p className="eyebrow mb-2">{block.eyebrow}</p>}
          {block.heading && <h2 className="eyebrow">{block.heading}</h2>}
          {block.body && (
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{block.body}</p>
          )}
        </div>
      )}
      <div>
        {items.length > 0 && (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-7 sm:gap-x-8 lg:grid-cols-4 lg:py-8">
            {items.map((item, index) => {
              const Icon = icons[item.icon || 'check']
              const content = (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <Icon size={26} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                    {item.enableLink && item.link && (
                      <ArrowUpRight
                        size={17}
                        className="text-muted-foreground transition-colors group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <Heading className="text-xl font-semibold leading-snug underline-offset-4 group-hover:underline sm:text-2xl">
                    {item.title}
                  </Heading>
                  {item.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                  )}
                </>
              )
              const className = 'block h-full rounded-sm'
              return (
                <li key={item.id || index} className="min-w-0">
                  {item.enableLink && item.link ? (
                    <CMSLink {...item.link} label={null} className={`group ${className}`}>
                      {content}
                    </CMSLink>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {areas.length > 0 && (
          <div className="mt-6 flex items-start gap-3 sm:items-center">
            <MapPin size={19} className="mt-0.5 shrink-0 text-accent sm:mt-0" aria-hidden="true" />
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-sm leading-relaxed">
              {block.areasLabel && <p className="text-muted-foreground">{block.areasLabel}</p>}
              <ul className="flex flex-wrap gap-x-3 gap-y-1 font-medium sm:text-base">
                {areas.map((area, index) => (
                  <li key={area.id || index} className="flex items-baseline gap-3">
                    {area.name}
                    {index < areas.length - 1 && (
                      <span className="text-oak" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <Actions links={block.links} />
    </section>
  )
}
