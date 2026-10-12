import type { Block } from 'payload'
import { sectionFields } from '../siteFields'
export const Process: Block = {
  slug: 'process',
  interfaceName: 'ProcessBlock',
  labels: { singular: 'Arbetsgång', plural: 'Arbetsgång' },
  fields: [
    ...sectionFields,
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      defaultValue: 'cards',
      options: [
        { label: 'Kort', value: 'cards' },
        { label: 'Rubrik till vänster / lista', value: 'split' },
      ],
    },
    {
      name: 'steps',
      label: 'Steg',
      type: 'array',
      fields: [
        { name: 'title', label: 'Rubrik', type: 'text' },
        { name: 'description', label: 'Text', type: 'textarea', required: true },
      ],
    },
  ],
}
