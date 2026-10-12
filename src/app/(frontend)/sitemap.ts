import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { isRetiredPageSlug } from '@/utilities/retiredRoutes'
export default unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const payload = await getPayload({ config })
    const pages = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      pagination: false,
      depth: 0,
      limit: 1000,
      where: { _status: { equals: 'published' } },
    })
    return pages.docs
      .filter((page) => page.slug && !isRetiredPageSlug(page.slug))
      .map((page) => ({
        url: new URL(page.slug === 'home' ? '/' : `/${page.slug}`, getServerSideURL()).href,
        lastModified: new Date(page.updatedAt),
      }))
  },
  ['website-sitemap', getServerSideURL()],
  { tags: ['pages-sitemap'] },
)
