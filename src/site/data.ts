import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { SiteData } from './types'
export const getSiteData = unstable_cache(
  async (): Promise<SiteData> => {
    const payload = await getPayload({ config })
    const [settings, header, footer] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false }),
      payload.findGlobal({ slug: 'header', depth: 2, overrideAccess: false }),
      payload.findGlobal({ slug: 'footer', depth: 2, overrideAccess: false }),
    ])
    return { company: settings.company, header, footer }
  },
  // The public company data now includes the organization number.
  ['site-settings', 'header', 'footer', 'v2'],
  { tags: ['site-settings', 'global_header', 'global_footer'] },
)
