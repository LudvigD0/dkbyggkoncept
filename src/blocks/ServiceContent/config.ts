import type { Block } from 'payload'
import { sectionFields, imageFields, actions } from '../siteFields'

export const ServiceContent: Block = {
  slug: 'serviceContent',
  interfaceName: 'ServiceContentBlock',
  labels: { singular: 'Tjänsteinnehåll – bild och fördjupning', plural: 'Tjänsteinnehåll' },
  fields: [
    ...sectionFields,
    ...imageFields,
    {
      name: 'imageSide',
      label: 'Bildplacering',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Vänster', value: 'left' },
        { label: 'Höger', value: 'right' },
      ],
    },
    {
      name: 'note',
      label: 'Notering under bilden',
      type: 'group',
      fields: [
        { name: 'heading', label: 'Rubrik', type: 'text' },
        { name: 'body', label: 'Text', type: 'textarea' },
      ],
    },
    {
      name: 'topics',
      label: 'Fördjupningar',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'heading', label: 'Underrubrik', type: 'text', required: true },
        { name: 'body', label: 'Text', type: 'textarea', required: true },
      ],
    },
    actions(),
  ],
}
