import React, { Fragment, Suspense } from 'react'
import { IntroComponent } from './Intro/Component'
import { FeatureComponent } from './Feature/Component'
import { CardGridComponent } from './CardGrid/Component'
import { GalleryComponent } from './Gallery/Component'
import { ProcessComponent } from './Process/Component'
import { ChecklistComponent } from './Checklist/Component'
import { SiteCTAComponent } from './SiteCTA/Component'
import { ContactCardsComponent } from './ContactCards/Component'
import { QuotePanelComponent } from './QuotePanel/Component'
import { ServiceContentComponent } from './ServiceContent/Component'
import { FAQComponent } from './FAQ/Component'
import { ProjectShowcaseComponent } from './ProjectShowcase/Component'
import { BeforeAfterComponent } from './BeforeAfter/Component'
import { GoogleReviewsComponent, getGoogleReviews } from './GoogleReviews/Component'
import { InstagramFeedComponent, InstagramFeedSkeleton } from './InstagramFeed/Component'
import { TrustPointsComponent } from './TrustPoints/Component'
import { FeaturedServicesComponent } from './FeaturedServices/Component'
import { CompanyDetailsComponent } from './CompanyDetails/Component'

import type { Page } from '@/payload-types'

import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

const blockComponents = {
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>
  selectedService?: string
  heroType?: Page['hero']['type']
}> = (props) => {
  const { blocks, selectedService, heroType } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          const priority = index === 0 && (!heroType || ['none', 'lowImpact'].includes(heroType))
          let component: React.ReactNode
          switch (block.blockType) {
            case 'intro':
              component = <IntroComponent {...block} />
              break
            case 'feature':
              component = <FeatureComponent {...block} priority={priority} />
              break
            case 'cardGrid':
              component = <CardGridComponent {...block} />
              break
            case 'featuredServices':
              component = <FeaturedServicesComponent {...block} priority={priority} />
              break
            case 'gallery':
              component = <GalleryComponent {...block} priority={priority} />
              break
            case 'process':
              component = <ProcessComponent {...block} />
              break
            case 'checklist':
              component = <ChecklistComponent {...block} />
              break
            case 'siteCTA':
              component = <SiteCTAComponent {...block} />
              break
            case 'contactCards':
              component = <ContactCardsComponent {...block} />
              break
            case 'quotePanel':
              component = <QuotePanelComponent {...block} selectedService={selectedService} />
              break
            case 'serviceContent':
              component = <ServiceContentComponent {...block} priority={priority} />
              break
            case 'faq':
              component = <FAQComponent {...block} />
              break
            case 'projectShowcase':
              component = <ProjectShowcaseComponent {...block} />
              break
            case 'beforeAfter':
              component = <BeforeAfterComponent {...block} />
              break
            case 'googleReviews':
              if (getGoogleReviews(block).length) component = <GoogleReviewsComponent {...block} />
              break
            case 'instagramFeed':
              component = (
                <Suspense fallback={<InstagramFeedSkeleton {...block} />}>
                  <InstagramFeedComponent {...block} />
                </Suspense>
              )
              break
            case 'trustPoints':
              component = <TrustPointsComponent {...block} />
              break
            case 'companyDetails':
              component = <CompanyDetailsComponent {...block} />
              break
          }
          if (component) {
            const flush = index === 0
            return (
              <div key={block.id || index} className={flush ? undefined : 'mt-20 md:mt-24'}>
                {component}
              </div>
            )
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
