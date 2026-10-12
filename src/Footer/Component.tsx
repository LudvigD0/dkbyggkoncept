import type { SiteData } from '@/site/types'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { Actions } from '@/blocks/siteComponents'
export function Footer({ data: { company, footer } }: { data: SiteData }) {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            {footer.logo && (
              <Media
                resource={footer.logo}
                className="relative h-18 w-18"
                fill
                size="72px"
                alt={footer.logoAlt || company.name}
                imgClassName="object-contain"
              />
            )}
            {footer.description && (
              <p className="mt-6 max-w-sm font-display text-2xl leading-snug">
                {footer.description}
              </p>
            )}
            <Actions links={footer.links} inverted />
          </div>
          <div>
            {footer.navigationHeading && (
              <p className="eyebrow !text-ink-foreground/50">{footer.navigationHeading}</p>
            )}
            <ul className="mt-4 space-y-2">
              {footer.navItems?.map((item, i) => (
                <li key={item.id || i}>
                  <CMSLink {...item.link} className="opacity-80 hover:opacity-100" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            {footer.contactHeading && (
              <p className="eyebrow !text-ink-foreground/50">{footer.contactHeading}</p>
            )}
            <ul className="mt-4 space-y-2">
              <li>
                <a href={`mailto:${company.email}`} className="opacity-80 hover:opacity-100">
                  {company.email}
                </a>
              </li>
              <li>
                <a href={company.phoneHref} className="opacity-80 hover:opacity-100">
                  {company.phone}
                </a>
              </li>
            </ul>
            {footer.areasHeading && (
              <p className="eyebrow mt-8 !text-ink-foreground/50">{footer.areasHeading}</p>
            )}
            <p className="mt-4 opacity-80">
              {company.areas?.map((area) => area.name).join(', ')} {footer.areasSuffix}
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-2 border-t border-ink-foreground/10 pt-6 text-sm opacity-60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.name}
          </p>
          {footer.copyrightText && <p>{footer.copyrightText}</p>}
        </div>
      </div>
    </footer>
  )
}
