import 'dotenv/config'
import { setServers } from 'node:dns/promises'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import pages from './data/lovable-pages.json'
import { company, nav } from './data/site'
import { buildPageContent, action } from './data/buildPageBlocks'
import { ensureMedia } from './data/ensureMedia'
import { ensureServiceMedia } from './data/serviceMedia'
import { ensureQuoteForm } from './data/ensureQuoteForm'
import { ensureServiceContent } from './data/ensureServiceContent'
import { clearLocalContentCache } from './data/clearLocalContentCache'
if (process.env.MIGRATION_DNS_SERVERS) setServers(process.env.MIGRATION_DNS_SERVERS.split(','))
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const media = { ...(await ensureMedia(payload)), ...(await ensureServiceMedia(payload)) }
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (!settings.createdAt)
    await payload.updateGlobal({
      slug: 'site-settings',
      context,
      data: { company: { ...company, areas: company.areas.map((name) => ({ name })) } },
    })
  const quoteForm = await ensureQuoteForm(payload)
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  if (!header.createdAt)
    await payload.updateGlobal({
      slug: 'header',
      context,
      data: {
        logo: media.headerLogo,
        logoAlt: company.name,
        homeURL: '/',
        showPhone: true,
        links: [action('Begär offert', '/offert')],
        navItems: nav.map((item) => ({ link: action(item.label, item.to).link })),
      },
    })
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  if (!footer.createdAt)
    await payload.updateGlobal({
      slug: 'footer',
      context,
      data: {
        logo: media.footerLogo,
        logoAlt: company.name,
        description: 'Byggfirman för hem och företag i Göteborg med omnejd.',
        links: [action('Begär offert', '/offert', 'accent')],
        navItems: nav.map((item) => ({ link: action(item.label, item.to).link })),
      },
    })
  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length) continue
    const content = buildPageContent(
      { slug: page.slug },
      { company: { ...company, areas: company.areas.map((name) => ({ name })) } },
      media,
    )
    await payload.create({
      collection: 'pages',
      context,
      data: {
        slug: page.slug,
        title: page.title,
        hero: content.hero,
        layout: content.layout.map((block) =>
          block.blockType === 'quotePanel' ? { ...block, form: quoteForm.id } : block,
        ),
        meta: {
          title: page.title,
          description: page.description,
          image: page.slug === 'home' ? media.heroPoster : media.hero,
        },
        _status: 'published',
      },
    })
  }
  await ensureServiceContent(payload)
  await clearLocalContentCache()
  console.log(
    'Block seed complete. Existing content preserved; service pages and project showcase ensured.',
  )
} finally {
  await payload.destroy()
}
process.exit(0)
