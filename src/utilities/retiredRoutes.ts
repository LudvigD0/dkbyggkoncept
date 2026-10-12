const retiredSlugs = new Set(['posts', 'search', 'posts-sitemap.xml'])

export function isRetiredPageSlug(slug?: string | null): boolean {
  return Boolean(slug && retiredSlugs.has(slug.split('/')[0]))
}
