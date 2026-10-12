import { Photo } from '@/blocks/siteComponents'
import { HeroActions, HeroBreadcrumb, HeroContent, HeroPoints, type HeroProps } from '../shared'

export const MediumImpactHero = (props: HeroProps) => (
  <section id={props.anchor || undefined} className="container-site pt-8 pb-12 md:pt-12 md:pb-16">
    <HeroBreadcrumb {...props} />
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="min-w-0 py-3">
        {props.eyebrow && <p className="eyebrow mb-5">{props.eyebrow}</p>}
        <HeroContent {...props} />
        <HeroActions links={props.links} />
        <HeroPoints {...props} />
      </div>
      <Photo
        image={props.media}
        imageAlt={props.mediaAlt}
        imageLabel={props.mediaLabel}
        priority
        sizes="(max-width: 1023px) 100vw, 620px"
        className="aspect-[4/3] rounded-md lg:aspect-[5/4]"
      />
    </div>
  </section>
)
