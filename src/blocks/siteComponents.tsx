import type { ComponentProps, ReactNode } from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { Media as MediaDocument } from '@/payload-types'
import { ArrowRight, Check, Ear, Leaf, Mail, MapPin, Phone, Sun, Wrench } from 'lucide-react'
import { cn } from '@/utilities/ui'

type LinkData = ComponentProps<typeof CMSLink>
export type Action = {
  link: LinkData
  style?: 'solid' | 'accent' | 'outline' | 'text' | 'pill' | null
  id?: string | null
}
export function Actions({
  links,
  inverted = false,
}: {
  links?: Action[] | null
  inverted?: boolean
}) {
  return links?.length ? (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {links.map(({ link, style, id }, i) => {
        const isButton = !['text', 'pill'].includes(style || '')
        return (
          <CMSLink
            key={id || i}
            {...link}
            appearance="inline"
            className={cn(
              'inline-flex items-center gap-3 font-semibold transition-colors',
              isButton
                ? 'min-h-12 rounded-md px-5 py-3'
                : style === 'pill'
                  ? 'rounded-md border border-border bg-card px-4 py-2 text-sm'
                  : 'py-2',
              style === 'accent'
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : style === 'outline'
                  ? `border ${inverted ? 'border-white/40 text-white hover:bg-white/10' : 'border-border hover:bg-secondary'}`
                  : style === 'solid' || !style
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : '',
            )}
          >
            {isButton ? (
              <ArrowRight size={17} aria-hidden="true" />
            ) : style === 'text' ? (
              <ArrowRight size={16} aria-hidden="true" />
            ) : null}
          </CMSLink>
        )
      })}
    </div>
  ) : null
}
export function SectionHeading({
  eyebrow,
  heading,
  body,
  children,
}: {
  eyebrow?: string | null
  heading?: string | null
  body?: string | null
  children?: ReactNode
}) {
  return (
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {heading && (
        <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">{heading}</h2>
      )}
      {body && <p className="mt-5 whitespace-pre-line text-lg text-muted-foreground">{body}</p>}
      {children}
    </div>
  )
}
export function Photo({
  image,
  imageAlt,
  imageLabel,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 640px',
}: {
  image?: MediaDocument | string | null
  imageAlt?: string | null
  imageLabel?: string | null
  className?: string
  priority?: boolean
  sizes?: string
}) {
  return image && typeof image === 'object' ? (
    <div className={cn('relative overflow-hidden rounded-md bg-secondary', className)}>
      <Media
        resource={image}
        htmlElement={null}
        fill
        priority={priority}
        size={sizes}
        alt={imageAlt ?? undefined}
        imgClassName="object-cover"
      />
      {imageLabel && (
        <span className="absolute bottom-3 left-3 bg-background/90 px-3 py-1 text-[0.7rem] font-semibold text-muted-foreground">
          {imageLabel}
        </span>
      )}
    </div>
  ) : null
}
export function Points({ items }: { items?: Array<{ text: string; id?: string | null }> | null }) {
  return items?.length ? (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={item.id || i} className="flex items-start gap-2 text-sm font-medium">
          <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          {item.text}
        </li>
      ))}
    </ul>
  ) : null
}
const icons = {
  check: Check,
  ear: Ear,
  leaf: Leaf,
  mail: Mail,
  mapPin: MapPin,
  phone: Phone,
  sun: Sun,
  wrench: Wrench,
}
export function Icon({ name, className }: { name?: string | null; className?: string }) {
  const Component = icons[name as keyof typeof icons]
  return Component ? <Component className={className} aria-hidden="true" /> : null
}
