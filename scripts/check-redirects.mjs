import assert from 'node:assert/strict'

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const migration = [
  ['/intresseanmalan', '/offert'],
  ['/intresse-anmalan', '/offert'],
  ['/hem', '/'],
  ['/sitemap_index.xml', '/sitemap.xml'],
  ['/page-sitemap.xml', '/sitemap.xml'],
  ['/wp-sitemap.xml', '/sitemap.xml'],
]
const unchanged = [
  '/tjanster',
  '/kontakt',
  '/om-oss',
  '/totalentreprenad-goteborg',
  '/totalrenovering-goteborg',
  '/lagenhetsrenovering-goteborg',
  '/tillbyggnad-goteborg',
]
const request = (path, method = 'GET') =>
  fetch(new URL(path, base), {
    method,
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
  })

for (const [source, destination] of migration) {
  for (const suffix of ['', '/']) {
    const path = `${source}${suffix}?utm_source=url-migration&campaign=bygg`
    for (const method of ['GET', 'HEAD']) {
      const response = await request(path, method)
      assert.equal(response.status, 301, `${method} ${path}: permanent redirect`)
      const location = response.headers.get('location')
      assert.ok(location, `${path}: Location header`)
      const target = new URL(location, base)
      assert.equal(target.pathname, destination, `${path}: direct destination`)
      assert.equal(target.searchParams.get('utm_source'), 'url-migration')
      assert.equal(target.searchParams.get('campaign'), 'bygg')
      await response.body?.cancel()
    }
  }
  const target = await request(destination)
  assert.equal(target.status, 200, `${destination}: destination is available`)
  await target.body?.cancel()
  console.log(`OK 301 ${source} and ${source}/ → ${destination}`)
}

for (const path of unchanged) {
  const response = await request(`${path}/?utm_source=url-migration`)
  assert.equal(response.status, 308, `${path}/: slash normalization`)
  const target = new URL(response.headers.get('location'), base)
  assert.equal(target.pathname, path)
  assert.equal(target.searchParams.get('utm_source'), 'url-migration')
  await response.body?.cancel()
  const canonical = await request(path)
  assert.equal(canonical.status, 200, `${path}: retained page`)
  await canonical.body?.cancel()
  console.log(`OK retained ${path}, 308 from ${path}/`)
}

const missing = await request('/saknad-sida-url-migration')
assert.equal(missing.status, 404, 'Unknown pages keep their 404 response')
await missing.body?.cancel()
console.log('OK query parameters, GET/HEAD, destinations, slash normalization and 404')
