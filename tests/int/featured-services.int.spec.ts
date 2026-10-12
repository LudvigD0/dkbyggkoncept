import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FeaturedServicesComponent } from '@/blocks/FeaturedServices/Component'
import type { FeaturedServicesBlock, Media, Page } from '@/payload-types'
import { replaceHomeServices } from '../../scripts/data/featuredServices'
import { buildPageContent } from '../../scripts/data/buildPageBlocks'

describe('Featured services', () => {
  it('replaces only the homepage service section and preserves its position and edited links', () => {
    const layout: NonNullable<Page['layout']> = [
      { blockType: 'intro', heading: 'Vår introduktion' },
      {
        blockType: 'cardGrid',
        id: 'services-id',
        blockName: 'Tjänster',
        links: [
          { link: { type: 'custom', label: 'Se alla tjänster', url: '/tjanster' }, style: 'text' },
        ],
        cards: [
          {
            title: 'Badrumsrenovering',
            enableLink: true,
            link: { type: 'custom', label: 'Badrum', url: '/egen-badrumssida' },
          },
        ],
      },
      { blockType: 'cardGrid', heading: 'Våra fördelar', cards: [{ title: 'Garanti' }] },
      { blockType: 'gallery', entries: [{ image: 'own-project-id' }] },
    ]
    const result = replaceHomeServices(layout, { badrum: 'bathroom-image' })
    expect(result).toHaveLength(layout.length)
    expect(result[0]).toBe(layout[0])
    expect(result[2]).toBe(layout[2])
    expect(result[3]).toBe(layout[3])
    const featured = result[1] as FeaturedServicesBlock
    expect(featured.id).toBe('services-id')
    expect(featured.blockType).toBe('featuredServices')
    expect(featured.services).toHaveLength(4)
    expect(featured.services?.[0].link.url).toBe('/egen-badrumssida')
    expect(featured.services?.[0].image).toBe('bathroom-image')
    expect(featured.links).toEqual((layout[1] as { links: unknown }).links)
    const edited = result.map((block) =>
      block.blockType === 'featuredServices'
        ? { ...block, heading: 'Min redigerade rubrik' }
        : block,
    )
    expect(replaceHomeServices(edited, {})).toBe(edited)
    expect(replaceHomeServices([layout[2]], {})).toEqual([layout[2]])
  })

  it('seeds four services with links to their existing destinations and all services', () => {
    const home = buildPageContent({ slug: 'home' }, {}, {})
    const featured = home.layout.find((block) => block.blockType === 'featuredServices')
    expect(featured?.services?.map((service) => service.link.url)).toEqual([
      '/tjanster#badrum',
      '/tjanster#kok',
      '/totalrenovering-goteborg',
      '/tillbyggnad-goteborg',
    ])
    expect(featured?.links?.[0].link.url).toBe('/tjanster')
    expect(
      home.layout.some((block) => block.blockType === 'cardGrid' && block.blockName === 'Tjänster'),
    ).toBe(false)
  })

  it('renders edited content, lazy images and icon fallbacks with working links', () => {
    const image: Media = {
      id: 'image',
      url: '/own-project.webp',
      alt: 'Medias beskrivning',
      mimeType: 'image/webp',
      width: 1200,
      height: 900,
      createdAt: '',
      updatedAt: '',
    }
    const html = renderToStaticMarkup(
      React.createElement(FeaturedServicesComponent, {
        blockType: 'featuredServices',
        heading: 'Våra tjänster',
        links: [
          { link: { type: 'custom', label: 'Alla tjänster', url: '/tjanster' }, style: 'text' },
        ],
        services: [
          {
            title: 'Mitt kök',
            description: 'Min beskrivning',
            image,
            imageAlt: 'Min bildbeskrivning',
            icon: 'kitchen',
            link: { type: 'custom', label: 'Läs om kök', url: '/mitt-kok' },
          },
          {
            title: 'Mitt badrum',
            icon: 'bathroom',
            link: { type: 'custom', label: 'Läs om badrum', url: '/mitt-badrum' },
          },
        ],
      }),
    )
    const root = document.createElement('div')
    root.innerHTML = html
    expect(root.querySelector('h2')?.textContent).toBe('Våra tjänster')
    expect(Array.from(root.querySelectorAll('h3')).map((heading) => heading.textContent)).toEqual([
      'Mitt kök',
      'Mitt badrum',
    ])
    expect(root.textContent).toContain('Min beskrivning')
    expect(Array.from(root.querySelectorAll('a')).map((link) => link.getAttribute('href'))).toEqual(
      ['/tjanster', '/mitt-kok', '/mitt-badrum'],
    )
    expect(root.querySelectorAll('img')).toHaveLength(1)
    expect(root.querySelector('img')?.alt).toBe('Min bildbeskrivning')
    expect(root.querySelector('img')?.getAttribute('loading')).toBe('lazy')
    expect(root.querySelectorAll('li')[1].querySelector('svg')).not.toBeNull()
  })
})
