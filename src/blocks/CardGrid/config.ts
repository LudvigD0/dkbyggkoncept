import type { Block } from 'payload'
import { sectionFields, actions, icon, optionalLink } from '../siteFields'
export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: { singular: 'Kort', plural: 'Kort' },
  fields: [
    ...sectionFields,
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Rutnät', value: 'grid' },
        { label: 'Rubrik till vänster', value: 'split' },
      ],
    },
    {
      name: 'columns',
      label: 'Kolumner på stor skärm',
      type: 'select',
      defaultValue: '4',
      options: ['2', '3', '4'],
    },
    { name: 'showNumbers', label: 'Numrera korten', type: 'checkbox' },
    actions(),
    {
      name: 'cards',
      label: 'Kort',
      type: 'array',
      fields: [
        { name: 'title', label: 'Rubrik', type: 'text', required: true },
        { name: 'description', label: 'Text', type: 'textarea' },
        icon,
        ...optionalLink,
      ],
    },
  ],
}
