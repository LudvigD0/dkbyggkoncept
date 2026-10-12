import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { IntroComponent } from '@/blocks/Intro/Component'
import { CardGridComponent } from '@/blocks/CardGrid/Component'
import { buildPageBlocks, buildPageContent } from '../../scripts/data/buildPageBlocks'
import type { IntroBlock } from '@/payload-types'

describe('Editable page blocks', () => {
  it.each([
    { label: 'empty array', links: [] },
    { label: 'null', links: null },
    { label: 'missing', links: undefined },
  ])(
    'does not display a stray zero when a card section has no heading or links ($label)',
    ({ links }) => {
      const html = renderToStaticMarkup(
        React.createElement(CardGridComponent, {
          blockType: 'cardGrid',
          links,
          cards: [
            {
              title: 'Tystare inomhus',
              description: 'Bättre glas dämpar ljud utifrån.',
              icon: 'ear',
            },
          ],
        }),
      )
      const root = document.createElement('div')
      root.innerHTML = html
      expect(root.textContent).toBe('Tystare inomhusBättre glas dämpar ljud utifrån.')
    },
  )

  it('renders changed text and destinations directly from block data', () => {
    const html = renderToStaticMarkup(
      React.createElement(CardGridComponent, {
        blockType: 'cardGrid',
        heading: 'Nya tjänster',
        columns: '2',
        cards: [
          {
            title: 'Ny tjänst',
            description: 'Redigerad beskrivning',
            enableLink: true,
            link: { type: 'custom', label: 'Läs mer', url: '/ny-sida' },
          },
        ],
      }),
    )
    expect(html).toContain('Nya tjänster')
    expect(html).toContain('Redigerad beskrivning')
    expect(html).toContain('href="/ny-sida"')
  })
  it('allows independent sections to be reordered and removed', () => {
    const blocks: IntroBlock[] = [
      { blockType: 'intro', heading: 'Första avsnittet' },
      { blockType: 'intro', heading: 'Andra avsnittet' },
    ]
    const render = (items: IntroBlock[]) =>
      renderToStaticMarkup(
        React.createElement(
          React.Fragment,
          null,
          ...items.map((block, index) =>
            React.createElement(IntroComponent, { ...block, key: index }),
          ),
        ),
      )
    const reordered = render([...blocks].reverse())
    expect(reordered.indexOf('Andra avsnittet')).toBeLessThan(reordered.indexOf('Första avsnittet'))
    expect(render(blocks.slice(1))).not.toContain('Första avsnittet')
  })
  it('preserves edited legacy content when converting to independent blocks', () => {
    const content = buildPageContent(
      { slug: 'home', siteContent: [{ key: 'text-011', value: 'Min redigerade rubrik' }] },
      {},
      { heroPoster: 'poster-id', heroVideo: 'video-id' },
    )
    expect(content.hero.type).toBe('highImpact')
    expect(JSON.stringify(content.hero.richText)).toContain('Min redigerade rubrik')
    expect(content.hero.media).toBe('poster-id')
    expect(content.hero.backgroundVideo).toBeNull()
    expect(content.hero.backgroundVideoPath).toBe('/design/hero-background.mp4')
    expect(
      content.layout.some((block) => ['siteHero', 'serviceHero'].includes(block.blockType)),
    ).toBe(false)
  })
  it('keeps the published page and a draft with a different template separate', () => {
    const published = buildPageBlocks({ slug: 'offert', siteTemplate: 'offert' }, {}, {})
    const draft = buildPageBlocks({ slug: 'offert', siteTemplate: 'home' }, {}, {})
    expect(published.some((block) => block.blockType === 'quotePanel')).toBe(true)
    expect(draft.some((block) => block.blockType === 'quotePanel')).toBe(false)
    expect(draft.length).toBeGreaterThan(published.length)
  })
})
