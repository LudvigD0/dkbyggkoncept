import type { SiteCTABlock } from '@/payload-types'
import { Media } from '@/components/Media'
import { Actions } from '../siteComponents'
export function SiteCTAComponent(block: SiteCTABlock) {
  const dark = block.appearance !== 'light'
  return (
    <section id={block.anchor || undefined} className="container-site">
      <div
        className={`relative overflow-hidden rounded-4xl ${dark ? 'bg-ink text-ink-foreground' : 'bg-secondary'}`}
      >
        {dark && block.backgroundImage && (
          <Media
            resource={block.backgroundImage}
            className="absolute inset-0 opacity-25"
            fill
            size="100vw"
            alt=""
            imgClassName="object-cover"
          />
        )}
        <div className="relative grid items-center gap-8 p-8 sm:p-12 md:grid-cols-[1.5fr_1fr] md:p-16">
          <div>
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && (
              <h2 className="text-4xl font-semibold leading-tight md:text-6xl">{block.heading}</h2>
            )}
            {block.body && (
              <p className="mt-4 max-w-xl whitespace-pre-line text-lg opacity-80">{block.body}</p>
            )}
          </div>
          <Actions links={block.links} inverted={dark} />
        </div>
      </div>
    </section>
  )
}
