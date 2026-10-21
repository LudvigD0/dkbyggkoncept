import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Page from '@/app/(frontend)/[slug]/page'

const { findPage } = vi.hoisted(() => ({ findPage: vi.fn() }))

vi.mock('payload', () => ({ getPayload: async () => ({ find: findPage }) }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }))
vi.mock('@/components/PayloadRedirects', () => ({ PayloadRedirects: () => null }))
vi.mock('@/components/LivePreviewListener', () => ({ LivePreviewListener: () => null }))
vi.mock('@/heros/RenderHero', () => ({ RenderHero: () => null }))
vi.mock('@/blocks/RenderBlocks', () => ({
  RenderBlocks: ({ selectedService }: { selectedService?: string }) =>
    React.createElement('div', { 'data-selected-service': selectedService }),
}))

beforeEach(() => findPage.mockReset())

describe('Page prerendering and service selection', () => {
  it('does not read request-only query parameters for a regular content page', async () => {
    findPage.mockResolvedValue({
      docs: [{ slug: 'om-oss', title: 'Om oss', layout: [{ blockType: 'intro' }] }],
    })
    const readSearchParams = vi.fn(() => {
      throw new Error('Query parameters prevent static prerendering')
    })
    const searchParams = { then: readSearchParams } as unknown as Promise<{ tjanst?: string }>

    const page = await Page({ params: Promise.resolve({ slug: 'om-oss' }), searchParams })

    expect(renderToStaticMarkup(page)).toContain('Om oss')
    expect(readSearchParams).not.toHaveBeenCalled()
    expect(findPage).toHaveBeenCalledWith(
      expect.objectContaining({ draft: false, overrideAccess: false }),
    )
  })

  it('passes the requested service to quote forms', async () => {
    findPage.mockResolvedValue({
      docs: [{ slug: 'offert', title: 'Offert', layout: [{ blockType: 'quotePanel' }] }],
    })
    const page = await Page({
      params: Promise.resolve({ slug: 'offert' }),
      searchParams: Promise.resolve({ tjanst: 'fonsterbyte' }),
    })

    expect(renderToStaticMarkup(page)).toContain('data-selected-service="fonsterbyte"')
  })
})
