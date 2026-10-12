import type { GoogleReviewsBlock, Page } from '../../src/payload-types'

export function googleReviewsBlock(): GoogleReviewsBlock {
  return {
    blockType: 'googleReviews',
    blockName: 'Google-recensioner',
    anchor: 'recensioner',
    eyebrow: 'Kundernas ord',
    heading: 'Omdömen från våra kunder',
    sourceLabel: 'Skrivet på Google',
    linkLabel: 'Läs fler recensioner på Google',
    reviews: [],
  }
}

export function addHomeReviews(layout: NonNullable<Page['layout']>) {
  if (layout.some((block) => block.blockType === 'googleReviews')) return layout
  const result = [...layout]
  const cta = result.findIndex((block) => block.blockType === 'siteCTA')
  result.splice(cta < 0 ? result.length : cta, 0, googleReviewsBlock())
  return result
}
