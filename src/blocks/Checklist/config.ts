import type { Block } from 'payload'
import { sectionFields, items } from '../siteFields'
export const Checklist: Block = {
  slug: 'checklist',
  interfaceName: 'ChecklistBlock',
  labels: { singular: 'Punktlista', plural: 'Punktlista' },
  fields: [
    ...sectionFields,
    items,
    { name: 'columns', label: 'Kolumner', type: 'select', defaultValue: '2', options: ['1', '2'] },
    {
      name: 'background',
      label: 'Bakgrund',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Ljus yta', value: 'light' },
        { label: 'Ingen', value: 'none' },
      ],
    },
  ],
}
