'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import type { SiteData } from '@/site/types'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { Actions } from '@/blocks/siteComponents'
export function HeaderClient({ data: { company, header } }: { data: SiteData }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <Link
          href={header.homeURL || '/'}
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          {header.logo && (
            <Media
              resource={header.logo}
              className="relative h-12 w-12"
              fill
              size="48px"
              alt={header.logoAlt || company.name}
              imgClassName="object-contain"
            />
          )}
          <span className="hidden font-display text-lg font-semibold sm:inline">
            {company.name}
          </span>
        </Link>
        <nav aria-label="Huvudmeny" className="hidden items-center gap-1 lg:flex">
          {header.navItems?.map((item, i) => (
            <CMSLink
              key={item.id || i}
              {...item.link}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {header.showPhone && (
            <a
              href={company.phoneHref}
              className="hidden items-center gap-2 px-3 text-sm font-semibold xl:flex"
            >
              <Phone size={16} className="text-accent" aria-hidden="true" />
              {company.phone}
            </a>
          )}
          <div className="hidden [&>div]:mt-0 sm:block">
            <Actions links={header.links} />
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={(open ? header.closeMenuLabel : header.openMenuLabel) || undefined}
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-md bg-secondary lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Mobilmeny"
            className="container-site flex flex-col gap-1 py-4"
            onClick={() => setOpen(false)}
          >
            {header.navItems?.map((item, i) => (
              <CMSLink
                key={item.id || i}
                {...item.link}
                className="rounded-2xl px-4 py-3 font-display text-xl font-medium hover:bg-secondary"
              />
            ))}
            <Actions links={header.links} />
            {header.showPhone && (
              <a
                href={company.phoneHref}
                className="mt-3 rounded-full border border-border px-5 py-3 text-center font-semibold"
              >
                {header.phonePrefix} {company.phone}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
