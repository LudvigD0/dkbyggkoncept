import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectSlider } from '@/blocks/ProjectShowcase/Gallery.client'
import { ProjectShowcaseComponent } from '@/blocks/ProjectShowcase/Component'
import { BeforeAfterComponent } from '@/blocks/BeforeAfter/Component'
import { HighImpactHero } from '@/heros/HighImpact'
import {
  projectShowcasePlaceholder,
  addHomeServiceContent,
} from '../../scripts/data/ensureServiceContent'
import { buildServicePage, buildServiceHero, servicePages } from '../../scripts/data/servicePages'
import { heroRichText, restoreHeroStructure } from '../../scripts/data/restoreHeroStructure'
import type { Media, Page } from '@/payload-types'

// Exercise Lexical's real HTML conversion without importing unrelated admin SCSS.
vi.mock('@/components/RichText', async () => {
  const { RichText } = await import('@payloadcms/richtext-lexical/react')
  return {
    default: ({ data }: { data: NonNullable<Page['hero']['richText']> }) =>
      React.createElement(RichText, { data }),
  }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Payload heroes and project blocks', () => {
  it('keeps the original slugs and separates page heroes from editable content blocks', () => {
    expect(servicePages.map((page) => page.slug)).toEqual([
      'totalentreprenad-goteborg',
      'totalrenovering-goteborg',
      'lagenhetsrenovering-goteborg',
      'tillbyggnad-goteborg',
    ])
    expect(new Set(servicePages.map((page) => page.description)).size).toBe(4)
    for (const page of servicePages) {
      const layout = buildServicePage(
        page,
        {},
        { phone: '010-123 45 67', phoneHref: 'tel:0101234567' },
      )
      const hero = buildServiceHero(page, { [page.image]: 'image-id' })
      expect(hero.type).toBe('mediumImpact')
      expect(hero.enableBackgroundVideo).toBe(false)
      expect(JSON.stringify(hero.richText)).toContain(page.intro)
      expect(layout.some((block) => ['siteHero', 'serviceHero'].includes(block.blockType))).toBe(
        false,
      )
      expect(layout.filter((block) => block.blockType === 'serviceContent')).toHaveLength(2)
      expect(layout.some((block) => block.blockType === 'faq')).toBe(true)
    }
  })

  it('never renders a background video on another page, even with video data supplied', () => {
    const image: Media = {
      id: 'poster',
      alt: 'Byggprojekt',
      url: '/fallback.jpg',
      mimeType: 'image/jpeg',
      width: 1280,
      height: 720,
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    }
    const props = {
      type: 'highImpact' as const,
      richText: heroRichText('Ett byggprojekt'),
      media: image,
      backgroundVideo: { ...image, id: 'video', url: '/hero.mp4', mimeType: 'video/mp4' },
      enableBackgroundVideo: true,
    }
    const home = renderToStaticMarkup(
      React.createElement(HighImpactHero, { ...props, pageSlug: 'home' }),
    )
    const service = renderToStaticMarkup(
      React.createElement(HighImpactHero, { ...props, pageSlug: 'totalrenovering-goteborg' }),
    )
    expect(home).toContain('<video')
    expect(home).not.toContain('src="/hero.mp4')
    expect(service).not.toContain('<video')
    expect(service).toContain('fallback.jpg')
    expect((service.match(/<h1/g) || []).length).toBe(1)
  })

  it('preserves edited content, photo references and their before/after labels when migrating', () => {
    const page = {
      slug: 'home',
      layout: [
        {
          blockType: 'siteHero',
          heading: 'Vår egen rubrik',
          body: 'Vår introduktion',
          variant: 'video',
          backgroundImage: 'poster-id',
          video: 'video-id',
          links: [
            { link: { type: 'custom', label: 'Kontakt', url: '/egen-lank' }, style: 'outline' },
          ],
        },
        { blockType: 'intro', heading: 'Bevara detta avsnitt' },
        {
          blockType: 'projectShowcase',
          heading: 'Mitt projektgalleri',
          projects: [
            {
              title: 'Mitt projekt',
              beforeImage: 'before-id',
              beforeAlt: 'Utgångsläge',
              beforeCaption: 'Före arbetet',
              afterImages: [
                { id: 'after-row', image: 'after-id', imageAlt: 'Nytt rum', caption: 'Färdigt' },
              ],
            },
          ],
        },
      ],
    }
    const updated = restoreHeroStructure(page)
    expect(updated.hero.type).toBe('highImpact')
    expect(JSON.stringify(updated.hero.richText)).toContain('Vår egen rubrik')
    expect(updated.hero.links?.[0].link.url).toBe('/egen-lank')
    expect(updated.layout[0]).toEqual(page.layout[1])
    const project = updated.layout[1]
    expect(project.blockType).toBe('projectShowcase')
    if (project.blockType === 'projectShowcase') {
      expect(project.projects?.[0].images).toEqual([
        { stage: 'before', image: 'before-id', imageAlt: 'Utgångsläge', caption: 'Före arbetet' },
        {
          stage: 'after',
          id: 'after-row',
          image: 'after-id',
          imageAlt: 'Nytt rum',
          caption: 'Färdigt',
        },
      ])
    }
    expect(restoreHeroStructure({ slug: 'home', ...updated })).toEqual(updated)
  })

  it('renders two independent image views with editable labels and placeholders', () => {
    const html = renderToStaticMarkup(
      React.createElement(BeforeAfterComponent, {
        blockType: 'beforeAfter',
        heading: 'Ett bildpar',
        beforeLabel: 'Innan arbetet',
        afterLabel: 'Efter arbetet',
        placeholderLabel: 'Här kommer en egen bild',
        beforeCaption: 'Befintligt rum',
        afterCaption: 'Nytt rum',
      }),
    )
    expect((html.match(/<figure/g) || []).length).toBe(2)
    expect(html).toContain('Innan arbetet')
    expect(html).toContain('Efter arbetet')
    expect(html).toContain('Här kommer en egen bild')
    expect(html).not.toContain('<img')
  })

  it('server-renders all slider images so visitors can scroll without JavaScript', () => {
    const html = renderToStaticMarkup(
      React.createElement(ProjectShowcaseComponent, projectShowcasePlaceholder()),
    )
    expect((html.match(/<figure/g) || []).length).toBe(4)
    expect(html).toContain('Före')
    expect(html).toContain('Efter')
    expect(html).toContain('project-slider')
    expect(html).toContain('Omsorg om detaljerna')
    expect(html).not.toContain('<img')
  })

  it('scrolls one view at a time using buttons and keyboard, respecting reduced motion', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { getByRole } = render(
      React.createElement(
        ProjectSlider,
        {
          count: 3,
          label: 'Projektbilder',
          previousLabel: 'Föregående',
          nextLabel: 'Nästa',
        },
        ['Före', 'Efter', 'Detalj'].map((text, index) =>
          React.createElement('figure', { key: index }, text),
        ),
      ),
    )
    const region = getByRole('region', { name: 'Projektbilder' })
    Object.defineProperties(region, {
      clientWidth: { value: 300 },
      scrollWidth: { value: 940 },
      scrollLeft: { writable: true, value: 0 },
    })
    Array.from(region.children).forEach((photo, index) =>
      Object.defineProperty(photo, 'offsetLeft', { value: index * 320 }),
    )
    const scrollTo = vi.fn((options?: ScrollToOptions | number) => {
      region.scrollLeft = typeof options === 'number' ? options : options?.left || 0
      fireEvent.scroll(region)
    })
    region.scrollTo = scrollTo
    fireEvent.scroll(region)
    fireEvent.click(getByRole('button', { name: 'Nästa' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 320, behavior: 'auto' })
    fireEvent.keyDown(region, { key: 'End' })
    expect(region.scrollLeft).toBe(640)
    expect(getByRole('button', { name: 'Nästa' }).hasAttribute('disabled')).toBe(true)
    fireEvent.keyDown(region, { key: 'Home' })
    expect(region.scrollLeft).toBe(0)
    expect(getByRole('button', { name: 'Föregående' }).hasAttribute('disabled')).toBe(true)
  })

  it('preserves a custom project gallery and is safe to seed repeatedly', () => {
    const layout: NonNullable<Page['layout']> = [
      {
        blockType: 'gallery',
        blockName: 'Bildmosaik',
        entries: [{ image: 'own-image', title: 'Mitt riktiga projekt' }],
      },
    ]
    const updated = addHomeServiceContent(layout, ['example-image'])
    expect(updated[0]).toEqual(layout[0])
    expect(updated.filter((block) => block.blockType === 'projectShowcase')).toHaveLength(1)
    expect(addHomeServiceContent(updated, ['example-image'])).toEqual(updated)
  })
})
