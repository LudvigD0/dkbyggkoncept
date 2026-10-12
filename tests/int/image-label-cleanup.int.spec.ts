import { describe, expect, it } from 'vitest'
import { removeExampleImageLabels } from '../../scripts/data/removeExampleImageLabels'
import { buildPageContent } from '../../scripts/data/buildPageBlocks'
import sourcePages from '../../scripts/data/lovable-pages.json'
import { buildServicePage, buildServiceHero, servicePages } from '../../scripts/data/servicePages'

describe('Example image label cleanup', () => {
  it('cleans nested image labels while preserving photos, captions, links and other page content', () => {
    const original = {
      hero: { media: 'image-id', mediaLabel: 'Exempelbild', richText: { text: 'Vår historia' } },
      layout: [
        {
          id: 'block-1',
          imageLabel: 'exempelbild',
          imageAlt: 'Beskrivning av bilden',
          image: 'photo',
        },
        {
          entries: [
            { imageLabel: 'Efter', caption: 'Kunden nämner en exempelbild', url: '/projekt' },
          ],
        },
        {
          emptyImageLabel: 'Inspiration · exempelbild',
          projects: [{ imageNotice: 'Exempelbilder' }],
        },
      ],
    }
    const cleaned = removeExampleImageLabels(original)
    expect(cleaned).toEqual({
      hero: { media: 'image-id', mediaLabel: null, richText: { text: 'Vår historia' } },
      layout: [
        { id: 'block-1', imageLabel: null, imageAlt: 'Beskrivning av bilden', image: 'photo' },
        {
          entries: [
            { imageLabel: 'Efter', caption: 'Kunden nämner en exempelbild', url: '/projekt' },
          ],
        },
        { emptyImageLabel: null, projects: [{ imageNotice: null }] },
      ],
    })
    expect(original.hero.mediaLabel).toBe('Exempelbild')
    expect(cleaned.layout[1]).toBe(original.layout[1])
    expect(removeExampleImageLabels(cleaned)).toBe(cleaned)
  })

  it('keeps future page seeds free from example image labels', () => {
    const contents = [
      ...sourcePages.map((page) => buildPageContent({ slug: page.slug }, {}, {})),
      ...servicePages.map((page) => ({
        hero: buildServiceHero(page, {}),
        layout: buildServicePage(page, {}, { phone: '010-1234567', phoneHref: 'tel:0101234567' }),
      })),
    ]
    for (const content of contents) expect(removeExampleImageLabels(content)).toBe(content)
  })
})
