import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { isRetiredPageSlug } from '@/utilities/retiredRoutes'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home' && !isRetiredPageSlug(doc.slug)
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  searchParams?: Promise<{ tjanst?: string }>
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise, searchParams }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  const page = await queryPageBySlug(decodedSlug)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  // Only the quote form uses URL parameters. Reading them on every page disables prerendering.
  const selectedService = layout?.some((block) => block.blockType === 'quotePanel')
    ? (await searchParams)?.tjanst
    : undefined

  return (
    <article>
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={slug === 'home' ? '/' : url} />

      {draft && <LivePreviewListener />}

      {hero?.type && hero.type !== 'none' ? (
        <RenderHero {...hero} pageSlug={slug} title={page.title} />
      ) : (
        <h1 className="container-site pt-14 text-5xl font-semibold">{page.title}</h1>
      )}
      <div className={decodedSlug === 'home' ? 'pt-12 md:pt-20' : undefined}>
        <RenderBlocks
          blocks={layout ?? []}
          selectedService={selectedService}
          heroType={hero?.type}
        />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug(decodedSlug)

  return generateMeta({ doc: page })
}

// A primitive argument lets the page and generateMetadata share the same query per render.
const queryPageBySlug = cache(async (slug: string) => {
  if (isRetiredPageSlug(slug)) notFound()

  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
