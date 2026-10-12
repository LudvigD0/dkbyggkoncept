import type { IntroBlock } from '@/payload-types'
import { SectionHeading, Actions } from '../siteComponents'
export function IntroComponent(block: IntroBlock) {
  return (
    <section
      id={block.anchor || undefined}
      className={`container-site ${block.layout === 'split' ? 'grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end' : ''}`}
    >
      <SectionHeading {...block} body={block.layout === 'split' ? undefined : block.body}>
        <Actions links={block.links} />
      </SectionHeading>
      {block.layout === 'split' && block.body && (
        <p className="whitespace-pre-line text-lg text-muted-foreground md:text-xl">{block.body}</p>
      )}
    </section>
  )
}
