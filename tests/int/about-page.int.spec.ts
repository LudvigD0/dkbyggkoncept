import { describe, expect, it } from 'vitest'
import type { GoogleReviewsBlock, Page } from '@/payload-types'
import { enrichAboutPage } from '../../scripts/data/aboutPage'
import { buildPageContent } from '../../scripts/data/buildPageBlocks'

describe('About page content', () => {
  it('replaces the team placeholder and preserves existing sections and genuine reviews', () => {
    const layout: NonNullable<Page['layout']> = [
      {
        blockType: 'gallery',
        layout: 'team',
        id: 'team-id',
        entries: [{ title: 'Plats för teamfoto' }],
      },
      {
        blockType: 'cardGrid',
        heading: 'Våra egna värderingar',
        cards: [{ title: 'Personligt ansvar' }],
      },
      { blockType: 'siteCTA', heading: 'Vår kontaktsektion' },
    ]
    const reviews: GoogleReviewsBlock = {
      blockType: 'googleReviews',
      id: 'home-reviews',
      reviews: [{ id: 'review-id', author: 'Vår kund', rating: '5', text: 'Vår kunds egna ord.' }],
    }
    const result = enrichAboutPage(layout, { image: 'team-photo', reviews })
    expect(result.map((block) => block.blockType)).toEqual([
      'feature',
      'trustPoints',
      'cardGrid',
      'googleReviews',
      'companyDetails',
      'siteCTA',
    ])
    expect(result[2]).toBe(layout[1])
    expect(result[5]).toBe(layout[2])
    expect(result[0]).toMatchObject({ id: 'team-id', image: 'team-photo' })
    const copiedReviews = result[3] as GoogleReviewsBlock
    expect(copiedReviews.id).toBeUndefined()
    expect(copiedReviews.reviews?.[0]).toEqual({
      author: 'Vår kund',
      rating: '5',
      text: 'Vår kunds egna ord.',
    })
    expect(reviews.id).toBe('home-reviews')
    expect(reviews.reviews?.[0].id).toBe('review-id')
  })

  it('preserves subsequent edits and does not duplicate sections when run again', () => {
    const content = buildPageContent({ slug: 'om-oss' }, {}, { hantverk: 'photo-id' })
    const edited = content.layout.map((block) =>
      block.blockType === 'feature' ? { ...block, heading: 'Vår redigerade presentation' } : block,
    )
    expect(enrichAboutPage(edited, { image: 'different-photo' })).toBe(edited)
    expect(JSON.stringify(content.layout)).not.toContain('Plats för teamfoto')
    expect(JSON.stringify(content.layout)).not.toContain('Här passar en bild')
    expect(content.hero.type).toBe('lowImpact')
    expect(content.layout.filter((block) => block.blockType === 'trustPoints')).toHaveLength(1)
    expect(content.layout.filter((block) => block.blockType === 'companyDetails')).toHaveLength(1)
  })
})
