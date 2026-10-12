import type { Block } from 'payload'
import { link } from '@/fields/link'
import { actions, imageFields, sectionFields } from '../siteFields'

export const FeaturedServices: Block = {
  slug: 'featuredServices',
  interfaceName: 'FeaturedServicesBlock',
  labels: { singular: 'Utvalda tjänster', plural: 'Utvalda tjänster' },
  fields: [
    ...sectionFields,
    actions(),
    {
      name: 'services',
      label: 'Tjänster',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Tjänst', plural: 'Tjänster' },
      admin: {
        initCollapsed: true,
        description:
          'Visa upp till fyra tjänster med egna bilder och länkar. Om en bild saknas visas den valda ikonen.',
      },
      fields: [
        { name: 'title', label: 'Tjänstens namn', type: 'text', required: true },
        { name: 'description', label: 'Kort beskrivning', type: 'textarea' },
        ...imageFields,
        {
          name: 'icon',
          label: 'Ikon när bild saknas',
          type: 'select',
          defaultValue: 'renovation',
          options: [
            { label: 'Badrum', value: 'bathroom' },
            { label: 'Kök', value: 'kitchen' },
            { label: 'Renovering', value: 'renovation' },
            { label: 'Hus / tillbyggnad', value: 'house' },
            { label: 'Fönster', value: 'window' },
          ],
        },
        link({ appearances: false }),
      ],
    },
  ],
}
