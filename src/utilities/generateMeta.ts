import type { Metadata } from 'next'
import type { Media, Page, Config } from '../payload-types'
import { getServerSideURL } from './getURL'
const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const path =
    image && typeof image === 'object'
      ? image.sizes?.og?.url || image.url
      : '/bakgrundsvideo-frame-1.jpg'
  return new URL(path || '/bakgrundsvideo-frame-1.jpg', getServerSideURL()).href
}
export const generateMeta = async ({ doc }: { doc: Partial<Page> | null }): Promise<Metadata> => {
  const title =
    doc?.meta?.title || (doc?.title ? `${doc.title} – DK Byggkoncept` : 'DK Byggkoncept')
  const description =
    doc?.meta?.description || 'Renovering, fönsterbyte och nybyggnation i Göteborg med omnejd.'
  const path = doc?.slug && doc.slug !== 'home' ? `/${doc.slug}` : '/'
  const url = new URL(path, getServerSideURL()).href
  const image = getImageURL(doc?.meta?.image)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: 'sv_SE',
      siteName: 'DK Byggkoncept',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
