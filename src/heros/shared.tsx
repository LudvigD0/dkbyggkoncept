import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export type HeroProps = Page['hero'] & { pageSlug?: string; title?: string }

export function HeroContent({
  richText,
  title,
  inverted = false,
}: HeroProps & { inverted?: boolean }) {
  const hasHeading = richText?.root.children.some(
    (node) => node.type === 'heading' && node.tag === 'h1',
  )
  return (
    <div className={cn('hero-copy', inverted && 'hero-copy-inverted')}>
      {!hasHeading && title && <h1>{title}</h1>}
      {richText && <RichText data={richText} enableGutter={false} enableProse={false} />}
    </div>
  )
}

export function HeroActions({
  links,
  inverted = false,
}: Pick<HeroProps, 'links'> & { inverted?: boolean }) {
  return links?.length ? (
    <ul className="mt-8 flex flex-wrap gap-3">
      {links.map(({ link, id }, index) => (
        <li key={id || index}>
          <CMSLink
            {...link}
            appearance="inline"
            className={cn(
              'inline-flex min-h-12 items-center justify-center gap-3 rounded-md border px-6 py-3 text-sm font-semibold transition-colors',
              link.appearance === 'outline'
                ? inverted
                  ? 'border-white/50 text-white hover:bg-white/10'
                  : 'border-foreground/30 hover:bg-secondary'
                : 'border-accent bg-accent text-accent-foreground hover:bg-accent/90',
            )}
          >
            <ArrowRight size={17} aria-hidden="true" />
          </CMSLink>
        </li>
      ))}
    </ul>
  ) : null
}

export function HeroBreadcrumb({ breadcrumbLabel, breadcrumbURL }: HeroProps) {
  return breadcrumbLabel && breadcrumbURL ? (
    <Link
      href={breadcrumbURL}
      className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <span aria-hidden="true">←</span>
      {breadcrumbLabel}
    </Link>
  ) : null
}

export function HeroPoints({ items, inverted = false }: HeroProps & { inverted?: boolean }) {
  return items?.length ? (
    <ul
      className={cn(
        'mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-sm',
        inverted ? 'border-white/25 text-white/85' : 'border-border text-muted-foreground',
      )}
    >
      {items.map((item, index) => (
        <li key={item.id || index}>{item.text}</li>
      ))}
    </ul>
  ) : null
}
