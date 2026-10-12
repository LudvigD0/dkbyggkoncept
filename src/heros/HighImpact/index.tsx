import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { HeroActions, HeroContent, HeroPoints, type HeroProps } from '../shared'
import { isLocalHeroVideoPath } from '../localVideo'

export const HighImpactHero = (props: HeroProps) => {
  const { media, backgroundVideo, enableBackgroundVideo, pageSlug, height, overlay } = props
  const image =
    media && typeof media === 'object' && media.mimeType?.startsWith('image/') ? media : null
  const video =
    pageSlug === 'home' &&
    enableBackgroundVideo &&
    backgroundVideo &&
    typeof backgroundVideo === 'object' &&
    backgroundVideo.mimeType?.startsWith('video/')
      ? backgroundVideo
      : null
  const localVideoPath =
    pageSlug === 'home' && enableBackgroundVideo && isLocalHeroVideoPath(props.backgroundVideoPath)
      ? props.backgroundVideoPath
      : undefined
  return (
    <section
      id={props.anchor || undefined}
      className="relative isolate w-full overflow-hidden bg-ink text-white"
    >
      {image && (
        <Media
          className="absolute inset-0"
          resource={video || image}
          src={localVideoPath}
          fallbackResource={image}
          videoMode="background"
          pauseLabel={props.pauseLabel ?? undefined}
          playLabel={props.playLabel ?? undefined}
          fill
          priority
          size="100vw"
          alt={props.mediaAlt ?? ''}
          imgClassName="object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0',
          overlay === 'medium'
            ? 'bg-black/45'
            : 'bg-[linear-gradient(90deg,rgba(21,22,20,0.83),rgba(21,22,20,0.52)_55%,rgba(21,22,20,0.2))]',
        )}
      />
      <div
        className={cn(
          'container-site pointer-events-none relative flex flex-col justify-center py-20 md:py-28',
          height === 'viewport'
            ? 'min-h-[calc(100svh-5rem)]'
            : height === 'compact'
              ? 'min-h-[440px]'
              : 'min-h-[600px]',
        )}
      >
        <div className="pointer-events-auto max-w-3xl">
          {props.eyebrow && (
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/80">
              {props.eyebrow}
            </p>
          )}
          <HeroContent {...props} inverted />
          <HeroActions links={props.links} inverted />
          <HeroPoints {...props} inverted />
        </div>
        {props.footerText && (
          <p className="mt-12 border-l-2 border-accent pl-4 text-xs font-semibold uppercase tracking-widest text-white/75">
            {props.footerText}
          </p>
        )}
      </div>
    </section>
  )
}
