import assert from 'node:assert/strict'
const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const services = [
  'totalentreprenad-goteborg',
  'totalrenovering-goteborg',
  'lagenhetsrenovering-goteborg',
  'tillbyggnad-goteborg',
]
for (const route of [
  '/',
  '/tjanster',
  '/fonsterbyte',
  '/projekt',
  '/om-oss',
  '/kontakt',
  '/offert?tjanst=fonsterbyte',
  ...services.map((slug) => `/${slug}/`),
]) {
  const response = await fetch(new URL(route, base))
  assert.equal(response.status, 200, route)
  const html = await response.text()
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route}: one h1`)
  assert.match(html, /<html[^>]+lang="sv"/)
  assert.match(html, /<meta name="description" content="[^"]+"/)
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)
  assert.ok(ogImage, `${route}: OG image`)
  assert.ok(!ogImage[1].includes('website-template'), `${route}: no template OG image`)
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)
  assert.ok(canonical, `${route}: canonical`)
  assert.ok(!canonical[1].includes('?'), `${route}: canonical excludes query`)
  assert.ok(!html.includes('Payload Website Template'))
  assert.ok(!html.includes('An open-source website built with Payload'))
  assert.doesNotMatch(
    html,
    /<(?:span|p)[^>]*>[^<]*exempelbild/i,
    `${route}: no example image labels`,
  )
  if (route.includes('?')) assert.ok(html.includes('Gäller:') && html.includes('Fönsterbyte'))
  if (route === '/')
    assert.ok(html.includes('id="fore-och-efter"') && html.includes('href="/projekt"'))
  if (route !== '/') assert.ok(!html.includes('<video'), `${route}: no background video`)
  if (services.some((slug) => route.includes(slug))) {
    assert.ok(html.includes('id="fragor"'), `${route}: editable FAQ`)
    assert.ok(html.includes('id="arbetsgang"'), `${route}: project process`)
    assert.ok(canonical[1].endsWith(route.slice(0, -1)), `${route}: original slug in canonical`)
  }
  console.log(`OK ${route}`)
}
const robots = await fetch(new URL('/robots.txt', base))
assert.equal(robots.status, 200)
assert.match(await robots.text(), /Sitemap: .*\/sitemap.xml/)
const sitemap = await fetch(new URL('/sitemap.xml', base))
assert.equal(sitemap.status, 200)
const xml = await sitemap.text()
assert.doesNotMatch(xml, /<loc>[^<]*\/(?:posts|search)(?:[/?<]|$)/)
for (const slug of [
  'tjanster',
  'fonsterbyte',
  'projekt',
  'om-oss',
  'kontakt',
  'offert',
  ...services,
])
  assert.ok(xml.includes(`/${slug}</loc>`), `${slug}: sitemap entry`)
const legacySitemap = await fetch(new URL('/pages-sitemap.xml', base))
assert.equal(legacySitemap.status, 200)
assert.doesNotMatch(await legacySitemap.text(), /<loc>[^<]*\/(?:posts|search)(?:[/?<]|$)/)
for (const route of [
  '/posts',
  '/posts/old-post',
  '/posts/page/2',
  '/search?q=renovering',
  '/search/old',
  '/posts-sitemap.xml',
]) {
  for (const method of ['GET', 'HEAD']) {
    const response = await fetch(new URL(route, base), { method })
    assert.equal(response.status, 404, `${method} ${route}: retired route`)
    if (method === 'GET')
      assert.match(await response.text(), /<meta name="robots" content="noindex"/)
  }
}
for (const collection of ['posts', 'search', 'categories']) {
  const response = await fetch(new URL(`/api/${collection}`, base))
  assert.equal(response.status, 404, `${collection}: retired CMS collection`)
}
console.log('OK retired posts/search routes and clean sitemaps')
for (const filename of ['hero-fonster.webp', 'hantverk.webp', 'badrum.webp', 'kok.webp']) {
  const media = await fetch(new URL(`/api/media/file/${filename}`, base))
  assert.equal(media.status, 200, `${filename}: S3 delivery`)
  assert.match(media.headers.get('content-type'), /image\/webp/)
  assert.ok((await media.arrayBuffer()).byteLength > 1000)
}
const optimized = await fetch(
  new URL('/_next/image?url=%2Fapi%2Fmedia%2Ffile%2Fhero-fonster.webp&w=640&q=75', base),
)
assert.equal(optimized.status, 200)
assert.match(optimized.headers.get('content-type'), /image\//)
console.log('OK robots, sitemap, S3 media and Next.js Image')
