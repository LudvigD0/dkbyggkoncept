import type {
  FeatureBlock,
  GoogleReviewsBlock,
  Page,
  TrustPointsBlock,
} from '../../src/payload-types'
import { trustPointsBlock } from './trustPoints'

type Layout = NonNullable<Page['layout']>
type AboutContent = {
  image?: string | null
  imageAlt?: string
  trust?: TrustPointsBlock
  reviews?: GoogleReviewsBlock
}

function copyBlock<T>(block: T): T {
  return JSON.parse(JSON.stringify(block, (key, value) => (key === 'id' ? undefined : value))) as T
}

export function enrichAboutPage(layout: Layout, content: AboutContent): Layout {
  let result = layout
  const placeholder = result.findIndex(
    (block) =>
      block.blockType === 'gallery' &&
      block.layout === 'team' &&
      block.entries?.some((entry) => entry.title === 'Plats för teamfoto'),
  )
  if (placeholder >= 0) {
    const profile: FeatureBlock = {
      id: result[placeholder].id,
      blockType: 'feature',
      blockName: 'Människorna bakom DK Byggkoncept',
      anchor: 'teamet',
      eyebrow: 'Dawid och teamet',
      heading: 'Människorna bakom hantverket',
      body: 'Bakom DK Byggkoncept står Dawid och ett team som är stolta över sitt hantverk. Vi hjälper privatpersoner och företag med allt från enstaka renoveringar till större om- och tillbyggnader.\n\nDawid är din kontaktperson när du vill diskutera ett projekt, få råd eller be om en offert. Vi går igenom vad du vill göra och håller kontakten under arbetets gång.',
      secondaryBody:
        'Vi tror på raka besked, god kontakt och att hålla det vi lovar. Det är lika viktigt att du känner dig trygg under arbetet som att du blir nöjd med resultatet.',
      image: content.image,
      imageAlt: content.imageAlt,
      imageSide: 'left',
      imageAspect: 'square',
      appearance: 'plain',
      links: [
        { link: { type: 'custom', label: 'Kontakta oss', url: '/kontakt' }, style: 'solid' },
        { link: { type: 'custom', label: 'Se våra projekt', url: '/projekt' }, style: 'text' },
      ],
    }
    result = result.map((block, index) => (index === placeholder ? profile : block))
  }
  if (!result.some((block) => block.blockType === 'trustPoints')) {
    const profile = result.findIndex(
      (block) => block.blockType === 'feature' && block.anchor === 'teamet',
    )
    result = [...result]
    result.splice(profile >= 0 ? profile + 1 : 0, 0, copyBlock(content.trust || trustPointsBlock()))
  }
  if (
    content.reviews?.reviews?.length &&
    !result.some((block) => block.blockType === 'googleReviews')
  ) {
    const cta = result.findIndex((block) => block.blockType === 'siteCTA')
    result = [...result]
    result.splice(cta >= 0 ? cta : result.length, 0, copyBlock(content.reviews))
  }
  if (!result.some((block) => block.blockType === 'companyDetails')) {
    const cta = result.findIndex((block) => block.blockType === 'siteCTA')
    result = [...result]
    result.splice(cta >= 0 ? cta : result.length, 0, {
      blockType: 'companyDetails',
      blockName: 'Företagsuppgifter',
      anchor: 'foretagsuppgifter',
      heading: 'Företaget i korthet',
      body: 'Vill du prata om ett projekt eller ställa en fråga? Ring eller mejla oss.',
    })
  }
  return result
}
