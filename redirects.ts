import type { NextConfig } from 'next'

// Verified against the WordPress sitemap and published page URLs on 2026-10-12.
export const legacyRedirects = [
  { source: '/intresseanmalan', destination: '/offert' },
  // Also accept the spelling with a hyphen.
  { source: '/intresse-anmalan', destination: '/offert' },
  { source: '/hem', destination: '/' },
  { source: '/sitemap_index.xml', destination: '/sitemap.xml' },
  { source: '/page-sitemap.xml', destination: '/sitemap.xml' },
  { source: '/wp-sitemap.xml', destination: '/sitemap.xml' },
] as const

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  return [
    ...legacyRedirects.flatMap(({ source, destination }) =>
      [source, `${source}/`].map((path) => ({
        source: path,
        destination,
        statusCode: 301 as const,
      })),
    ),
    internetExplorerRedirect,
    // Keep Next.js's usual slash normalization after the migration redirects.
    // Old /intresseanmalan/ should go straight to /offert, without an extra hop.
    { source: '/:path+/', destination: '/:path+', permanent: true },
  ]
}
