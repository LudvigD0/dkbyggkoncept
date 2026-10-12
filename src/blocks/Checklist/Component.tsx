import type { ChecklistBlock } from '@/payload-types'
import { SectionHeading } from '../siteComponents'
import { Check } from 'lucide-react'
export function ChecklistComponent(block: ChecklistBlock) {
  return (
    <section id={block.anchor || undefined} className="container-site">
      <div className={block.background === 'none' ? '' : 'rounded-4xl bg-secondary p-8 sm:p-12'}>
        <SectionHeading {...block} />
        <ul className={`mt-6 grid gap-3 ${block.columns === '2' ? 'sm:grid-cols-2' : ''}`}>
          {block.items?.map((item, i) => (
            <li key={item.id || i} className="flex items-start gap-2 font-medium">
              <Check size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
