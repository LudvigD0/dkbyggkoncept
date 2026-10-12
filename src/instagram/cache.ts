import 'next/dist/compiled/server-only'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getInstagramPosts } from './posts'

// Cache only public post data. The token is neither an argument nor part of the cache key/result.
export const getCachedInstagramPosts = unstable_cache(
  async (limit: number) => {
    const payload = await getPayload({ config })
    return getInstagramPosts(payload, limit)
  },
  ['instagram-posts-v1'],
  { revalidate: 3600, tags: ['instagram-posts'] },
)
