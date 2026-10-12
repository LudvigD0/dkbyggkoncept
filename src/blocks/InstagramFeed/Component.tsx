import Image from 'next/image'
import { ArrowUpRight, Images, Instagram, Play } from 'lucide-react'
import type { InstagramFeedBlock } from '@/payload-types'
import { getCachedInstagramPosts } from '@/instagram/cache'
import { SectionHeading } from '../siteComponents'

const imageURL = (value: string | null) => {
  if (!value) return null
  const hostname = new URL(value).hostname
  return ['cdninstagram.com', 'fbcdn.net'].some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  )
    ? value
    : null
}
const dateLabel = (value: string | null) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Stockholm',
      }).format(date)
    : null
}

function InstagramFeedHeader({ block }: { block: InstagramFeedBlock }) {
  const accountURL = block.accountURL || 'https://www.instagram.com/dkbyggkoncept_ab/'
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <a
          href={accountURL}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-5 inline-flex min-h-8 items-center gap-2.5 text-sm font-semibold underline-offset-4 hover:underline"
        >
          <Instagram size={21} aria-hidden="true" />
          {block.accountLabel || '@dkbyggkoncept_ab'}
        </a>
        <SectionHeading {...block} />
      </div>
      <a
        href={accountURL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-md border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary md:self-auto"
      >
        {block.linkLabel || 'Följ oss på Instagram'}
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </div>
  )
}

export function InstagramFeedSkeleton(block: InstagramFeedBlock) {
  return (
    <section
      id={block.anchor || undefined}
      className="container-site scroll-mt-28"
      aria-busy="true"
    >
      <InstagramFeedHeader block={block} />
      <p role="status" className="sr-only">
        Laddar Instagram-inlägg.
      </p>
      <div aria-hidden="true" className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: Number(block.postCount || '6') }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-md border border-border bg-card">
            <div className="aspect-[4/5] bg-secondary" />
            <div className="h-[132px] p-5">
              <div className="h-3 w-3/4 bg-secondary" />
              <div className="mt-3 h-3 w-1/2 bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export async function InstagramFeedComponent(block: InstagramFeedBlock) {
  const posts = await getCachedInstagramPosts(Number(block.postCount || '6'))
  const accountURL = block.accountURL || 'https://www.instagram.com/dkbyggkoncept_ab/'
  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <InstagramFeedHeader block={block} />
      {posts.length ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const src = imageURL(post.mediaType === 'VIDEO' ? post.thumbnailUrl : post.mediaUrl)
            const published = dateLabel(post.timestamp)
            return (
              <a
                key={post.id}
                href={post.permalink || accountURL}
                target="_blank"
                rel="noopener noreferrer"
                className="group min-w-0 overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-foreground/40"
                aria-label={`Se inlägg på Instagram${post.caption ? `: ${post.caption.slice(0, 120)}` : ''}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  {src ? (
                    <Image
                      src={src}
                      alt={
                        post.caption.slice(0, 180) || 'Byggprojekt från DK Byggkoncept på Instagram'
                      }
                      fill
                      sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      loading="lazy"
                      quality={75}
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Instagram size={40} className="text-muted-foreground" aria-hidden="true" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-background/95 px-2.5 py-1.5 text-xs font-semibold">
                    <Instagram size={14} aria-hidden="true" />
                    Instagram
                  </span>
                  {post.mediaType !== 'IMAGE' && (
                    <span
                      className="absolute right-3 top-3 rounded-sm bg-background/95 p-2"
                      aria-label={post.mediaType === 'VIDEO' ? 'Video' : 'Flera bilder'}
                    >
                      {post.mediaType === 'VIDEO' ? (
                        <Play size={16} aria-hidden="true" />
                      ) : (
                        <Images size={16} aria-hidden="true" />
                      )}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {post.caption && (
                    <p className="line-clamp-2 min-h-12 whitespace-pre-line break-words text-sm leading-6">
                      {post.caption}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    {published ? (
                      <time dateTime={post.timestamp || undefined}>{published}</time>
                    ) : (
                      <span>{block.accountLabel || '@dkbyggkoncept_ab'}</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      Visa på Instagram
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-5 rounded-md border border-border bg-secondary/40 p-6 md:p-8">
          <Instagram size={32} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="max-w-2xl text-muted-foreground">
            {block.emptyText || 'Se fler bilder från våra projekt och följ arbetet på Instagram.'}
          </p>
        </div>
      )}
    </section>
  )
}
