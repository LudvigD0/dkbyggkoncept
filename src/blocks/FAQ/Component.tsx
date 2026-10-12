import { Plus } from 'lucide-react'
import type { FAQBlock } from '@/payload-types'
import { Actions, SectionHeading } from '../siteComponents'

export function FAQComponent(block: FAQBlock) {
  return (
    <section
      id={block.anchor || undefined}
      className="container-site grid items-start gap-10 scroll-mt-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
    >
      <div className="lg:sticky lg:top-28">
        <SectionHeading {...block} />
        <Actions links={block.links} />
      </div>
      <div className="divide-y divide-border border-y border-border">
        {block.questions?.map((question, index) => (
          <details key={question.id || index} className="group py-6" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 rounded-lg text-lg font-semibold outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent sm:text-xl [&::-webkit-details-marker]:hidden">
              <h3 className="font-inherit text-inherit">{question.question}</h3>
              <Plus
                className="mt-0.5 h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-4 max-w-2xl whitespace-pre-line leading-relaxed text-muted-foreground">
              {question.answer}
            </p>
            <Actions links={question.links} />
          </details>
        ))}
      </div>
    </section>
  )
}
