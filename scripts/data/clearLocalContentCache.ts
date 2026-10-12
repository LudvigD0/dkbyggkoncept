import { rm } from 'node:fs/promises'
import path from 'node:path'

// CLI imports run outside Next.js, so its revalidation hooks cannot run here.
// Drop generated data before the next build, which otherwise reuses stale CMS data.
export async function clearLocalContentCache() {
  await rm(path.resolve('.next/cache/fetch-cache'), { recursive: true, force: true })
}
