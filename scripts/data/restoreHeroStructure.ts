import type { Page, SiteCTABlock } from '../../src/payload-types'

// Only used to import the previous block schema, never to render page content.
export type LegacyHeroBlock = {
  blockType: 'siteHero' | 'serviceHero'
  heading: string
  blockName?: string | null
  id?: string | null
  anchor?: string | null
  eyebrow?: string | null
  accentHeading?: string | null
  lead?: string | null
  body?: string | null
  variant?: 'simple' | 'image' | 'video' | null
  backgroundImage?: Page['hero']['media']
  image?: Page['hero']['media']
  video?: Page['hero']['media']
  backgroundVideoPath?: string | null
  backgroundAlt?: string | null
  imageAlt?: string | null
  imageLabel?: string | null
  links?: SiteCTABlock['links']
  items?: Page['hero']['items']
  breadcrumbLabel?: string | null
  breadcrumbURL?: string | null
  footerText?: string | null
  height?: Page['hero']['height']
  overlay?: Page['hero']['overlay']
  pauseLabel?: string | null
  playLabel?: string | null
  fullWidth?: boolean | null
}

export function heroRichText(
  heading: string,
  ...paragraphs: Array<string | null | undefined>
): NonNullable<Page['hero']['richText']> {
  const text = (value: string) => ({
    type: 'text',
    version: 1,
    text: value,
    format: 0,
    detail: 0,
    mode: 'normal',
    style: '',
  })
  return {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'heading',
          tag: 'h1',
          version: 1,
          direction: null,
          format: '',
          indent: 0,
          children: [text(heading)],
        },
        ...paragraphs
          .filter((value): value is string => Boolean(value))
          .map((value) => ({
            type: 'paragraph',
            version: 1,
            direction: null,
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            children: [text(value)],
          })),
      ],
    },
  }
}

export function heroFromBlock(block: LegacyHeroBlock, slug?: string | null): Page['hero'] {
  const image = block.blockType === 'serviceHero' ? block.image : block.backgroundImage
  const isHomeVideo = slug === 'home' && block.variant === 'video'
  return {
    type: isHomeVideo ? 'highImpact' : image ? 'mediumImpact' : 'lowImpact',
    anchor: block.anchor,
    eyebrow: block.eyebrow,
    richText: heroRichText(
      [block.heading, block.accentHeading].filter(Boolean).join(' '),
      block.lead,
      block.body,
    ),
    media: image,
    mediaAlt: block.imageAlt || block.backgroundAlt,
    mediaLabel: block.imageLabel,
    links: block.links?.map(({ link, style, id }) => ({
      id,
      link: {
        ...link,
        appearance: ['outline', 'text', 'pill'].includes(style || '') ? 'outline' : 'default',
      },
    })),
    items: block.items,
    breadcrumbLabel: block.breadcrumbLabel,
    breadcrumbURL: block.breadcrumbURL,
    footerText: block.footerText,
    height: block.height,
    overlay: block.overlay,
    enableBackgroundVideo: isHomeVideo,
    backgroundVideo: isHomeVideo ? block.video : null,
    backgroundVideoPath: isHomeVideo ? block.backgroundVideoPath : null,
    pauseLabel: block.pauseLabel,
    playLabel: block.playLabel,
  }
}

type RawBlock = Record<string, unknown> & { blockType: string }
export function restoreHeroStructure(page: {
  slug?: string | null
  hero?: Page['hero']
  layout?: unknown
}) {
  const original = Array.isArray(page.layout) ? (page.layout as RawBlock[]) : []
  const first = original.findIndex((block) => ['siteHero', 'serviceHero'].includes(block.blockType))
  const hero =
    first < 0
      ? page.hero || { type: 'none' as const }
      : heroFromBlock(original[first] as unknown as LegacyHeroBlock, page.slug)
  const layout = original.flatMap((block, index): RawBlock[] => {
    if (index === first) return []
    if (['siteHero', 'serviceHero'].includes(block.blockType)) {
      const extra = block as unknown as LegacyHeroBlock
      const image = extra.image || extra.backgroundImage
      return [
        {
          blockType: image ? 'feature' : 'intro',
          blockName: extra.blockName,
          id: extra.id,
          anchor: extra.anchor,
          eyebrow: extra.eyebrow,
          heading: [extra.heading, extra.accentHeading].filter(Boolean).join(' '),
          body: [extra.lead, extra.body].filter(Boolean).join('\n\n'),
          image,
          imageAlt: extra.imageAlt || extra.backgroundAlt,
          imageLabel: extra.imageLabel,
          links: extra.links,
          items: extra.items,
          appearance: 'plain',
          layout: 'stacked',
        },
      ]
    }
    if (block.blockType !== 'projectShowcase') return [block]
    const projects = (block.projects || []) as Array<Record<string, unknown>>
    const updated = { ...block }
    delete updated.chooseLabel
    return [
      {
        ...updated,
        heading:
          block.heading === 'En förändring. Flera perspektiv.'
            ? 'Före och efter – våra projekt'
            : block.heading,
        body:
          block.body ===
          'Se vad vi utgår från och upptäck det färdiga resultatet från fler vinklar.'
            ? 'Se utgångsläget och bläddra vidare till det färdiga arbetet.'
            : block.body,
        previousLabel:
          block.previousLabel === 'Föregående efterbild' ? 'Föregående bild' : block.previousLabel,
        nextLabel: block.nextLabel === 'Nästa efterbild' ? 'Nästa bild' : block.nextLabel,
        scrollLabel: block.scrollLabel || 'Bläddra eller svep för att se fler bilder.',
        projects: projects.map((project) => {
          const { beforeImage, beforeAlt, beforeCaption, afterImages, ...rest } = project
          if (Array.isArray(project.images) && project.images.length) return rest
          const after = (afterImages || []) as Array<Record<string, unknown>>
          return {
            ...rest,
            images: [
              { stage: 'before', image: beforeImage, imageAlt: beforeAlt, caption: beforeCaption },
              ...after.map((photo) => ({ ...photo, stage: 'after' })),
            ],
          }
        }),
      },
    ]
  }) as NonNullable<Page['layout']>
  return { hero, layout }
}
