/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 *
 * On Vercel production, CMS file URLs use the build-time public origin so
 * Image Optimization respects minimumCacheTTL. Development and preview
 * paths stay relative, avoiding private-IP fetches and preview authentication.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN
  if (mediaOrigin && url.startsWith('/api/media/file/')) {
    url = `${mediaOrigin}${url}`
  }

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  return cacheTag ? `${url}${url.includes('?') ? '&' : '?'}v=${cacheTag}` : url
}
