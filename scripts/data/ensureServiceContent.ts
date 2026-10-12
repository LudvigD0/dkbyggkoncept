import type { Payload } from 'payload'
import type { Page, ProjectShowcaseBlock } from '../../src/payload-types'
import { servicePages, buildServicePage, buildServiceHero, serviceLinks } from './servicePages'
import { ensureServiceMedia } from './serviceMedia'
import { action } from './buildPageBlocks'

type Layout = NonNullable<Page['layout']>
export function projectShowcasePlaceholder(): ProjectShowcaseBlock {
  return {
    blockType: 'projectShowcase',
    blockName: 'Projekt – före och efter',
    anchor: 'fore-och-efter',
    eyebrow: 'Från utgångsläge till resultat',
    heading: 'Före och efter – våra projekt',
    body: 'Se utgångsläget och bläddra vidare till det färdiga arbetet.',
    links: [action('Fler projekt', '/projekt', 'text')],
    beforeLabel: 'Före',
    afterLabel: 'Efter',
    previousLabel: 'Föregående bild',
    nextLabel: 'Nästa bild',
    scrollLabel: 'Bläddra eller svep för att se fler bilder.',
    placeholderLabel: 'Projektbild kommer snart',
    emptyText: 'Här visar vi snart våra projekt, från utgångsläge till färdigt resultat.',
    projects: [
      {
        title: 'Våra projekt, från början till slut.',
        description: 'Här kommer före- och efterbilder från våra projekt.',
        images: [
          { stage: 'before', caption: 'Utgångsläget' },
          { stage: 'after', caption: 'Det färdiga resultatet' },
          { stage: 'after', caption: 'En annan vinkel' },
          { stage: 'after', caption: 'Omsorg om detaljerna' },
        ],
      },
    ],
  }
}

export function addHomeServiceContent(layout: Layout, exampleImageIDs: string[] = []): Layout {
  const result = layout.map((block) => {
    if (block.blockType !== 'cardGrid') return block
    return {
      ...block,
      cards: block.cards?.map((card) => {
        const destination = card.link?.type === 'custom' && card.link.url
        const slug =
          destination === '/tjanster#totalrenovering'
            ? 'totalrenovering-goteborg'
            : destination === '/tjanster#tillbyggnad'
              ? 'tillbyggnad-goteborg'
              : null
        return slug && card.link ? { ...card, link: { ...card.link, url: `/${slug}` } } : card
      }),
    }
  })
  if (result.some((block) => block.blockType === 'projectShowcase')) return result
  const placeholder = result.findIndex(
    (block) =>
      block.blockType === 'gallery' &&
      block.blockName === 'Bildmosaik' &&
      block.entries?.every(
        (entry) =>
          !entry.beforeImage &&
          !entry.afterImage &&
          (!entry.image ||
            (typeof entry.image === 'string' && exampleImageIDs.includes(entry.image))),
      ) &&
      block.entries?.some(
        (entry) => entry.title === 'Här visas snart våra egna projekt – med före- och efterbilder.',
      ),
  )
  if (placeholder >= 0) result.splice(placeholder, 1, projectShowcasePlaceholder())
  else {
    const process = result.findIndex((block) => block.blockType === 'process')
    result.splice(process >= 0 ? process : result.length, 0, projectShowcasePlaceholder())
  }
  return result
}

export async function ensureServiceContent(payload: Payload) {
  const context = { disableRevalidate: true }
  const media = await ensureServiceMedia(payload)
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const examples = await payload.find({
    collection: 'media',
    where: { seedKey: { in: ['lovable-kok', 'lovable-badrum'] } },
    depth: 0,
    limit: 10,
  })
  const created: string[] = []
  const transactionID = await payload.db.beginTransaction()
  const req = transactionID ? { transactionID } : {}
  try {
    // Start the Mongo transaction with one awaited read before Payload validates several image relationships in parallel.
    await payload.find({ collection: 'media', depth: 0, limit: 1, select: { filename: true }, req })
    for (const page of servicePages) {
      const found = await payload.find({
        collection: 'pages',
        where: { slug: { equals: page.slug } },
        depth: 0,
        limit: 1,
        req,
      })
      if (found.docs.length) continue
      await payload.create({
        collection: 'pages',
        context,
        req,
        data: {
          slug: page.slug,
          title: page.title,
          hero: buildServiceHero(page, media),
          layout: buildServicePage(page, media, settings.company),
          meta: {
            title: `${page.title} | DK Byggkoncept`,
            description: page.description,
            image: media[page.image],
          },
          _status: 'published',
        },
      })
      created.push(page.slug)
    }
    for (const slug of ['home', 'tjanster']) {
      const found = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        draft: false,
        limit: 1,
        depth: 0,
        req,
      })
      const page = found.docs[0]
      if (!page) continue
      const draft = await payload.findByID({
        collection: 'pages',
        id: page.id,
        draft: true,
        depth: 0,
        req,
      })
      const transform = (layout: Layout): Layout => {
        if (slug === 'home')
          return addHomeServiceContent(
            layout,
            examples.docs.map((image) => image.id),
          )
        if (layout.some((block) => block.blockName === 'Fördjupade tjänster')) return layout
        const result = [...layout]
        result.splice(0, 0, serviceLinks())
        return result
      }
      const layout = transform(page.layout || [])
      if (JSON.stringify(layout) === JSON.stringify(page.layout || [])) continue
      // Publishing these additions must preserve a separate editorial draft.
      await payload.update({
        collection: 'pages',
        id: page.id,
        draft: false,
        context,
        req,
        data: { ...page, layout, _status: page._status },
      })
      if (draft._status === 'draft')
        await payload.update({
          collection: 'pages',
          id: draft.id,
          draft: true,
          publishAllLocales: false,
          context,
          req,
          data: { ...draft, layout: transform(draft.layout || []), _status: 'draft' },
        })
    }
    const footer = await payload.findGlobal({ slug: 'footer', depth: 0, req })
    const navItems = [...(footer.navItems || [])]
    for (const page of servicePages) {
      if (navItems.some((item) => item.link.type === 'custom' && item.link.url === `/${page.slug}`))
        continue
      navItems.push({ link: action(page.title.replace(' Göteborg', ''), `/${page.slug}`).link })
    }
    if (navItems.length !== footer.navItems?.length)
      await payload.updateGlobal({ slug: 'footer', context, data: { navItems }, req })
    if (transactionID) await payload.db.commitTransaction(transactionID)
    return created
  } catch (error) {
    if (transactionID) await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
