import type { CardGridBlock, FeaturedServicesBlock, Page } from '../../src/payload-types'
import type { MediaRefs } from './buildPageBlocks'

export const featuredServiceDefaults = [
  {
    title: 'Badrumsrenovering',
    description: 'Ett badrum att trivas i varje dag, från tätskikt till sista detaljen.',
    icon: 'bathroom',
    imageKey: 'badrum',
    filename: 'fint-badrum-bra-vinkel.webp',
    seedKey: 'lovable-badrum',
    imageAlt: 'Badrum med badkar, träkommod och belyst spegel',
    url: '/tjanster#badrum',
  },
  {
    title: 'Köksrenovering',
    description: 'Mer arbetsyta och smartare förvaring, i ett kök som passar er vardag.',
    icon: 'kitchen',
    imageKey: 'kok',
    filename: 'kok-vargarda.webp',
    seedKey: 'lovable-kok',
    imageAlt: 'Kök med mörka luckor och ljus bänkskiva',
    url: '/tjanster#kok',
  },
  {
    title: 'Totalrenovering',
    description: 'Ge hela hemmet en ny start. Vi håller ihop arbetet från början till slut.',
    icon: 'renovation',
    imageKey: 'service-totalrenovering',
    filename: 'renovering.webp',
    seedKey: 'service-totalrenovering',
    imageAlt: 'Renovering pågår med nya väggar och isolering i taket',
    url: '/totalrenovering-goteborg',
  },
  {
    title: 'Tillbyggnad',
    description: 'Plats för familjen att växa, med en tillbyggnad som passar ert hus.',
    icon: 'house',
    imageKey: 'service-tillbyggnad',
    filename: 'Nybyggnation.webp',
    seedKey: 'service-tillbyggnad',
    imageAlt: 'Hus med vit träfasad och trädgård',
    url: '/tillbyggnad-goteborg',
  },
] as const

export function featuredServicesBlock(
  media: MediaRefs,
  previous?: CardGridBlock,
  imageAlts: Record<string, string> = {},
): FeaturedServicesBlock {
  return {
    id: previous?.id,
    blockType: 'featuredServices',
    blockName: 'Utvalda tjänster',
    anchor: previous?.anchor || 'tjanster',
    eyebrow: previous?.eyebrow || 'Tjänster',
    heading: 'Vad vill ni göra hemma?',
    body: 'Från ett nytt badrum till mer plats för familjen. Vi hjälper er att ta nästa steg.',
    links: previous?.links?.length
      ? previous.links
      : [{ link: { type: 'custom', label: 'Alla tjänster', url: '/tjanster' }, style: 'text' }],
    services: featuredServiceDefaults.map((service) => {
      const original = previous?.cards?.find((card) => card.title === service.title)
      const originalLink = original?.enableLink ? original.link : undefined
      const legacyDestination =
        originalLink?.url === '/tjanster#totalrenovering' ||
        originalLink?.url === '/tjanster#tillbyggnad'
      return {
        title: service.title,
        description: service.description,
        image: media[service.imageKey] || null,
        imageAlt: imageAlts[service.imageKey],
        icon: service.icon,
        link: originalLink
          ? {
              ...originalLink,
              url: legacyDestination ? service.url : originalLink.url,
              label: 'Läs mer',
            }
          : { type: 'custom', url: service.url, label: 'Läs mer' },
      }
    }),
  }
}

export function replaceHomeServices(
  layout: NonNullable<Page['layout']>,
  media: MediaRefs,
  imageAlts: Record<string, string> = {},
) {
  if (layout.some((block) => block.blockType === 'featuredServices')) return layout
  const index = layout.findIndex(
    (block) =>
      block.blockType === 'cardGrid' &&
      (block.blockName === 'Tjänster' ||
        (block.eyebrow?.toLowerCase() === 'tjänster' &&
          block.links?.some(({ link }) => link.url === '/tjanster'))),
  )
  if (index < 0) return layout
  return layout.map((block, position) =>
    position === index && block.blockType === 'cardGrid'
      ? featuredServicesBlock(media, block, imageAlts)
      : block,
  )
}
