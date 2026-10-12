import { ArrowUpRight, Star } from 'lucide-react'
import type { GoogleReviewsBlock } from '@/payload-types'
import { SectionHeading } from '../siteComponents'

export function getGoogleReviews(block: GoogleReviewsBlock) {
  return block.reviews?.filter((review) => review.author?.trim() && review.text?.trim()) || []
}

export function GoogleReviewsComponent(block: GoogleReviewsBlock) {
  const reviews = getGoogleReviews(block)
  if (!reviews.length) return null
  const sourceLabel = block.sourceLabel ?? 'Skrivet på Google'

  return (
    <section id={block.anchor || undefined} className="container-site scroll-mt-28">
      <div className="max-w-3xl">
        <SectionHeading {...block} />
      </div>
      <div className="mt-8 grid items-stretch gap-5 md:grid-cols-3">
        {reviews.map((review, index) => {
          const rating = Number(review.rating || '5')
          return (
            <figure
              key={review.id || index}
              className="flex min-w-0 flex-col rounded-md border border-border bg-card p-6 md:p-7"
            >
              <div role="img" aria-label={`${rating} av 5 stjärnor`} className="flex gap-1">
                {Array.from({ length: 5 }, (_, star) => (
                  <Star
                    key={star}
                    size={18}
                    aria-hidden="true"
                    className={star < rating ? 'fill-current text-[#b07813]' : 'text-border'}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <blockquote className="mt-5 text-base leading-relaxed">
                <p className="whitespace-pre-line break-words">{review.text}</p>
              </blockquote>
              <figcaption className="mt-auto pt-7">
                <div className="border-t border-border pt-5">
                  <p className="break-words font-semibold">{review.author}</p>
                  {review.dateLabel && (
                    <p className="mt-1 text-sm text-muted-foreground">{review.dateLabel}</p>
                  )}
                  {sourceLabel &&
                    (review.googleURL ? (
                      <a
                        href={review.googleURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex min-h-6 items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        aria-label={`${sourceLabel} – ${review.author}`}
                      >
                        {sourceLabel}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">{sourceLabel}</p>
                    ))}
                </div>
              </figcaption>
            </figure>
          )
        })}
      </div>
      {block.googleURL && (
        <a
          href={block.googleURL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
        >
          {block.linkLabel || 'Läs fler recensioner på Google'}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      )}
    </section>
  )
}
