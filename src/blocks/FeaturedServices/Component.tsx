import type { FeaturedServicesBlock } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { ArrowRight, Bath, CookingPot, Hammer, House, PanelsTopLeft } from 'lucide-react'
import { Actions, Photo, SectionHeading } from '../siteComponents'

const icons = {
  bathroom: Bath,
  kitchen: CookingPot,
  renovation: Hammer,
  house: House,
  window: PanelsTopLeft,
}

export function FeaturedServicesComponent(block: FeaturedServicesBlock & { priority?: boolean }) {
  const Heading = block.heading ? 'h3' : 'h2'

  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="max-w-2xl">
          <SectionHeading {...block} />
        </div>
        <div className="shrink-0">
          <Actions links={block.links} />
        </div>
      </div>
      <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
        {block.services?.map((service, index) => {
          const hasImage = service.image && typeof service.image === 'object' && service.image.url
          const ServiceIcon = icons[service.icon || 'renovation']

          return (
            <li key={service.id || index} className="min-w-0">
              <CMSLink
                {...service.link}
                label={null}
                className="group flex h-full flex-col rounded-md"
              >
                {hasImage ? (
                  <Photo
                    {...service}
                    priority={block.priority && index === 0}
                    sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 767px) calc((100vw - 64px) / 2), (max-width: 1023px) calc((100vw - 88px) / 2), (max-width: 1312px) calc((100vw - 136px) / 4), 294px"
                    className="aspect-[4/3] [&_img]:transition-transform [&_img]:duration-500 motion-safe:group-hover:[&_img]:scale-[1.03]"
                  />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-md border border-border bg-secondary">
                    <ServiceIcon
                      size={56}
                      strokeWidth={1.25}
                      className="text-accent"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <Heading className="mt-5 text-2xl font-semibold leading-tight underline-offset-4 group-hover:underline">
                  {service.title}
                </Heading>
                {service.description && (
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                )}
                <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold">
                  {service.link.label}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </CMSLink>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
