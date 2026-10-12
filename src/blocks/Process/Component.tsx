import type { ProcessBlock } from '@/payload-types'
import { SectionHeading } from '../siteComponents'
export function ProcessComponent(block: ProcessBlock) {
  const split = block.layout === 'split'
  return (
    <section
      id={block.anchor || undefined}
      className={`container-site ${split ? 'grid gap-10 md:grid-cols-2' : ''}`}
    >
      <SectionHeading {...block} />
      <ol className={split ? 'space-y-3' : 'mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
        {block.steps?.map((step, i) => (
          <li
            key={step.id || i}
            className={
              split
                ? 'flex gap-4 rounded-3xl border border-border p-5'
                : 'rounded-3xl border border-border p-6'
            }
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary font-display font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <div className={split ? 'pt-1' : 'mt-6'}>
              {step.title && <h3 className="text-xl font-semibold">{step.title}</h3>}
              <p
                className={`${step.title ? 'mt-2 ' : ''}whitespace-pre-line text-muted-foreground`}
              >
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
