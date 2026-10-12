import type { Page, SiteCTABlock } from '../../src/payload-types'
import { restoreHeroStructure, type LegacyHeroBlock } from './restoreHeroStructure'
import sourcePages from './lovable-pages.json'
import { company as originalCompany, services as originalServices } from './site'
import { addHomeReviews } from './googleReviews'
import { addHomeInstagram } from './instagram'
import { addHomeTrustPoints } from './trustPoints'
import { replaceHomeServices } from './featuredServices'
import { enrichAboutPage } from './aboutPage'
import { HOME_HERO_VIDEO_PATH } from '../../src/heros/localVideo'
import { removeExampleImageLabels } from './removeExampleImageLabels'

type Layout = Array<NonNullable<Page['layout']>[number] | LegacyHeroBlock>
type LinkData = NonNullable<SiteCTABlock['links']>[number]
export type LegacyPage = {
  siteTemplate?: string | null
  siteContent?: Array<{ key: string; value: string }> | null
  slug?: string | null
}
export type LegacySettings = {
  company?: {
    name?: string
    phone?: string
    phoneHref?: string
    email?: string
    areas?: Array<{ name: string }>
  } | null
  shared?: { ctaTitle?: string | null; ctaText?: string | null; footerText?: string | null } | null
  images?: Record<string, string | null> | null
  services?: Array<{
    slug: string
    title: string
    short: string
    body: string
    image: string
    includes?: Array<{ text: string }> | null
  }> | null
  projects?: Array<{
    title: string
    category: string
    place: string
    image: string
    before?: string | null
    after?: string | null
  }> | null
  nav?: Array<{ to: string; label: string }> | null
}
export type MediaRefs = Record<string, string | null>
export const action = (
  label: string,
  url: string,
  style: LinkData['style'] = 'solid',
): LinkData => ({ link: { type: 'custom', label, url }, style })
export function buildPageContent(page: LegacyPage, settings: LegacySettings, media: MediaRefs) {
  const content = restoreHeroStructure({
    slug: page.slug,
    layout: buildLegacyPageBlocks(page, settings, media),
  })
  return removeExampleImageLabels(
    page.slug === 'home'
      ? {
          ...content,
          layout: addHomeTrustPoints(
            addHomeInstagram(addHomeReviews(replaceHomeServices(content.layout, media))),
          ),
        }
      : page.slug === 'om-oss'
        ? {
            ...content,
            layout: enrichAboutPage(content.layout, {
              image: media.team || media.hantverk,
              imageAlt: 'Hantverkare i arbete',
            }),
          }
        : content,
  )
}
export function buildPageBlocks(
  page: LegacyPage,
  settings: LegacySettings,
  media: MediaRefs,
): NonNullable<Page['layout']> {
  return buildPageContent(page, settings, media).layout
}
function buildLegacyPageBlocks(
  page: LegacyPage,
  settings: LegacySettings,
  media: MediaRefs,
): Layout {
  const template = page.siteTemplate || page.slug
  const source = sourcePages.find((item) => item.slug === template)
  if (!source) return []
  const text = new Map(source.content.map((item) => [item.key, item.value]))
  page.siteContent?.forEach((item) => text.set(item.key, item.value))
  const t = (number: number) => text.get(`text-${String(number).padStart(3, '0')}`) || ''
  const company = {
    ...originalCompany,
    ...settings.company,
    areas: settings.company?.areas?.map((area) => area.name) || originalCompany.areas,
  }
  const images = { ...media, ...settings.images }
  const services =
    settings.services ??
    originalServices.map((service) => ({
      ...service,
      includes: service.includes.map((text) => ({ text })),
    }))
  const image = (key: string) => images[key] ?? null
  const quote = (label = 'Begär offert', service?: string, style: LinkData['style'] = 'solid') =>
    action(label, service ? `/offert?tjanst=${encodeURIComponent(service)}` : '/offert', style)
  const cta = (
    heading = settings.shared?.ctaTitle || 'Berätta om ert projekt',
    body = settings.shared?.ctaText ||
      'Beskriv vad du vill göra så återkommer vi med ett upplägg och en offert. Det kostar ingenting att fråga.',
  ): Layout[number] => ({
    blockType: 'siteCTA',
    blockName: 'Kontakt / CTA',
    heading,
    body,
    appearance: 'dark',
    backgroundImage: image('hantverk'),
    links: [
      quote('Begär offert', undefined, 'accent'),
      action(`eller ring ${company.phone}`, company.phoneHref, 'text'),
    ],
  })
  const hero = (eyebrow: string, heading: string, body: string): LegacyHeroBlock => ({
    blockType: 'siteHero',
    blockName: heading,
    eyebrow,
    heading,
    body,
    variant: 'simple',
  })
  switch (template) {
    case 'home':
      return [
        {
          ...hero(t(10), t(11), t(12)),
          variant: 'video',
          backgroundImage: media.heroPoster,
          video: null,
          backgroundVideoPath: HOME_HERO_VIDEO_PATH,
          fullWidth: true,
          height: 'viewport',
          overlay: 'strong',
          footerText: company.name,
          pauseLabel: 'Pausa bakgrundsvideo',
          playLabel: 'Spela bakgrundsvideo',
          links: [
            quote('Begär offert', undefined, 'accent'),
            action(t(13), '/tjanster', 'outline'),
          ],
        },
        {
          blockType: 'intro',
          blockName: 'Introduktion',
          eyebrow: t(15),
          heading: t(16),
          body: t(17),
          layout: 'split',
        },
        {
          blockType: 'feature',
          blockName: 'Fönsterbyte i fokus',
          heading: t(20),
          body: t(21),
          badge: t(19),
          image: image('fonster'),
          imageAlt: t(18),
          imageLabel: t(14),
          imageSide: 'left',
          imageAspect: 'landscape',
          appearance: 'card',
          items: services.find((service) => service.slug === 'fonsterbyte')?.includes,
          links: [quote(t(22), 'fonsterbyte'), action(t(23), '/fonsterbyte', 'text')],
        },
        {
          blockType: 'cardGrid',
          blockName: 'Tjänster',
          eyebrow: t(24),
          heading: t(25),
          columns: '4',
          showNumbers: true,
          links: [action(t(26), '/tjanster', 'text')],
          cards: services
            .filter((service) => service.slug !== 'fonsterbyte')
            .map((service) => ({
              title: service.title,
              description: service.short,
              enableLink: true,
              link: action(service.title, `/tjanster#${service.slug}`).link,
            })),
        },
        {
          blockType: 'gallery',
          blockName: 'Bildmosaik',
          layout: 'mosaic',
          entries: [
            { image: image('kok'), imageAlt: t(27), imageLabel: t(14) },
            { image: image('badrum'), imageAlt: t(28), imageLabel: t(14) },
            { title: t(29), enableLink: true, link: action(t(30), '/projekt', 'text').link },
          ],
        },
        {
          blockType: 'process',
          blockName: 'Så går det till',
          eyebrow: t(31),
          heading: t(32),
          layout: 'cards',
          steps: [0, 1, 2, 3].map((i) => ({ title: t(i * 2 + 1), description: t(i * 2 + 2) })),
        },
        {
          blockType: 'feature',
          blockName: 'Människorna bakom',
          eyebrow: t(34),
          heading: t(35),
          body: t(36),
          secondaryBody: `${t(37)} ${company.areas.join(t(38) || ', ')} ${t(39)}`,
          image: image('hantverk'),
          imageAlt: t(33),
          imageLabel: t(14),
          imageAspect: 'square',
          imageSide: 'left',
          appearance: 'plain',
          links: [action(t(40), '/om-oss', 'text')],
        },
        cta(),
      ]
    case 'tjanster':
      return [
        {
          ...hero(t(1), t(2), t(3)),
          links: services.map((service) =>
            action(
              service.title,
              service.slug === 'fonsterbyte' ? '/fonsterbyte' : `#${service.slug}`,
              'pill',
            ),
          ),
        },
        ...services.map((service, i): Layout[number] => ({
          blockType: 'feature',
          blockName: service.title,
          anchor: service.slug,
          heading: service.title,
          body: service.body,
          image: image(service.image),
          imageAlt: service.title,
          imageSide: i % 2 ? 'right' : 'left',
          imageAspect: 'landscape',
          appearance: 'card',
          badge: String(i + 1).padStart(2, '0'),
          items: service.includes,
          links: [quote(`Offert på ${service.title.toLowerCase()}`, service.slug)],
        })),
        cta(t(4), t(5)),
      ]
    case 'fonsterbyte':
      return [
        {
          ...hero(t(14), t(15), t(17)),
          accentHeading: t(16),
          links: [quote(t(18), 'fonsterbyte')],
        },
        {
          blockType: 'gallery',
          blockName: 'Fönsterbild',
          layout: 'grid',
          columns: '1',
          entries: [{ image: image('fonster'), imageAlt: t(19) }],
        },
        {
          blockType: 'cardGrid',
          blockName: 'Fördelar med nya fönster',
          columns: '4',
          cards: ['leaf', 'ear', 'sun', 'wrench'].map((icon, i) => ({
            title: t(i * 2 + 1),
            description: t(i * 2 + 2),
            icon: icon as 'leaf',
            enableLink: false,
          })),
        },
        {
          blockType: 'process',
          blockName: 'Arbetsgång',
          eyebrow: t(20),
          heading: t(21),
          body: t(22),
          layout: 'split',
          steps: [9, 10, 11, 12, 13].map((i) => ({ description: t(i) })),
        },
        {
          blockType: 'checklist',
          blockName: 'Inför offert',
          heading: t(23),
          columns: '2',
          background: 'light',
          items: [24, 25, 26, 27].map((i) => ({ text: t(i) })),
        },
        cta(t(28), t(29)),
      ]
    case 'om-oss':
      return [
        hero(
          t(9),
          t(10),
          `${company.name} hjälper privatpersoner och företag i ${company.areas.join(t(11) || ', ')} och närområdet – med allt från renoveringar till tillbyggnader och nybyggnation.`,
        ),
        {
          blockType: 'gallery',
          blockName: 'Hantverk och team',
          layout: 'team',
          entries: [
            { image: image('hantverk'), imageAlt: t(12) },
            { title: t(13), description: t(14) },
          ],
        },
        {
          blockType: 'cardGrid',
          blockName: 'Så arbetar vi',
          heading: t(15),
          layout: 'split',
          columns: '2',
          cards: [0, 1, 2, 3].map((i) => ({
            title: t(i * 2 + 1),
            description: t(i * 2 + 2),
            enableLink: false,
          })),
        },
        cta(),
      ]
    case 'projekt':
      return [
        hero(t(3), t(4), t(5)),
        {
          blockType: 'gallery',
          blockName: 'Projekt',
          layout: 'grid',
          columns: '2',
          entries: (
            settings.projects ?? [
              {
                title: 'Projektnamn',
                category: 'Badrum',
                place: 'Ort',
                image: 'badrum',
                before: 'badrum',
                after: 'badrum',
              },
              { title: 'Projektnamn', category: t(1), place: 'Ort', image: 'kok' },
              {
                title: 'Projektnamn',
                category: t(2),
                place: 'Ort',
                image: 'fonster',
                before: 'fonster',
                after: 'fonster',
              },
              { title: 'Projektnamn', category: 'Tillbyggnad', place: 'Ort', image: 'hantverk' },
            ]
          ).map((project) => ({
            title: project.title,
            category: project.category,
            place: project.place,
            image: image(project.image),
            imageAlt: project.category,
            beforeImage: project.before ? image(project.before) : null,
            afterImage: project.after ? image(project.after) : null,
            beforeLabel: 'Före',
            afterLabel: 'Efter',
            compareLabel: 'Jämför före och efter',
          })),
        },
        cta(t(6)),
      ]
    case 'kontakt':
      return [
        hero(t(3), t(4), t(5)),
        {
          blockType: 'contactCards',
          blockName: 'Kontaktuppgifter',
          cards: [
            {
              label: t(1),
              value: company.phone,
              icon: 'phone',
              enableLink: true,
              link: action(company.phone, company.phoneHref).link,
            },
            {
              label: t(2),
              value: company.email,
              icon: 'mail',
              enableLink: true,
              link: action(company.email, `mailto:${company.email}`).link,
            },
            {
              label: t(6),
              value: `${company.areas.join(t(7) || ', ')} ${t(8)}`,
              icon: 'mapPin',
              dark: true,
              enableLink: false,
            },
          ],
        },
        {
          blockType: 'siteCTA',
          blockName: 'Offert',
          heading: t(9),
          appearance: 'light',
          links: [quote()],
        },
      ]
    case 'offert':
      return [
        hero(
          t(1),
          'Berätta om ditt projekt – få en kostnadsfri offert',
          'Fyll i dina uppgifter så återkommer vi med nästa steg mot en kostnadsfri offert.',
        ),
        {
          blockType: 'quotePanel',
          blockName: 'Offert och kontakt',
          anchor: 'formular',
          placeholderTitle: t(5),
          placeholderText: t(6),
          selectedLabel: t(4),
          services: services.map((service) => ({ slug: service.slug, title: service.title })),
          contacts: [
            {
              label: t(7),
              value: company.email,
              url: `mailto:${company.email}`,
              icon: 'mail',
              dark: true,
            },
            { label: t(8), value: company.phone, url: company.phoneHref, icon: 'phone' },
          ],
          checklistTitle: t(9),
          items: [10, 11, 12, 13].map((i) => ({ text: t(i) })),
        },
      ]
    default:
      return []
  }
}
