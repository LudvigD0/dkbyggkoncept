import type { ReactNode } from 'react'
import { HeroActions, HeroBreadcrumb, HeroContent, HeroPoints, type HeroProps } from '../shared'

export const LowImpactHero = (props: HeroProps & { children?: ReactNode }) => (
  <section id={props.anchor || undefined} className="container-site pt-12 pb-10 md:pt-16 md:pb-12">
    <HeroBreadcrumb {...props} />
    <div className="max-w-4xl border-l-2 border-oak pl-5 md:pl-8">
      {props.eyebrow && <p className="eyebrow mb-5">{props.eyebrow}</p>}
      {props.children || <HeroContent {...props} />}
      <HeroActions links={props.links} />
      <HeroPoints {...props} />
    </div>
  </section>
)
