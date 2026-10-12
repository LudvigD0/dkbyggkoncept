import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { image, actions } from '@/blocks/siteFields'
import { authenticated } from '@/access/authenticated'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    image('logo', 'Logotyp'),
    { name: 'logoAlt', label: 'Logotypens bildbeskrivning', type: 'text' },
    actions(),
    { name: 'description', label: 'Presentation', type: 'textarea' },
    { name: 'navigationHeading', label: 'Rubrik över länkar', type: 'text', defaultValue: 'Sidor' },
    { name: 'contactHeading', label: 'Rubrik över kontakt', type: 'text', defaultValue: 'Kontakt' },
    { name: 'areasHeading', label: 'Rubrik över orter', type: 'text', defaultValue: 'Område' },
    {
      name: 'areasSuffix',
      label: 'Text efter orter',
      type: 'text',
      defaultValue: 'och närområdet.',
    },
    {
      name: 'copyrightText',
      label: 'Rättighetstext',
      type: 'text',
      defaultValue: 'Alla rättigheter förbehållna',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],

      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
