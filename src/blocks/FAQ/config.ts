import type { Block } from 'payload'
import { sectionFields, actions } from '../siteFields'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: { singular: 'Vanliga frågor', plural: 'Vanliga frågor' },
  fields: [
    ...sectionFields,
    actions(),
    {
      name: 'questions',
      label: 'Frågor och svar',
      type: 'array',
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        { name: 'question', label: 'Fråga', type: 'text', required: true },
        { name: 'answer', label: 'Svar', type: 'textarea', required: true },
        actions('links', 'Läs mer / källor'),
      ],
    },
  ],
}
