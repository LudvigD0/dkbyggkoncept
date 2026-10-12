import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { image, actions } from '@/blocks/siteFields'
import { authenticated } from '@/access/authenticated'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    image('logo', 'Logotyp'),
    { name: 'logoAlt', label: 'Logotypens bildbeskrivning', type: 'text' },
    actions(),
    { name: 'homeURL', label: 'Logotypens länk', type: 'text', defaultValue: '/' },
    { name: 'showPhone', label: 'Visa telefon', type: 'checkbox', defaultValue: true },
    { name: 'openMenuLabel', label: 'Öppna meny – text', type: 'text', defaultValue: 'Öppna meny' },
    {
      name: 'closeMenuLabel',
      label: 'Stäng meny – text',
      type: 'text',
      defaultValue: 'Stäng meny',
    },
    {
      name: 'phonePrefix',
      label: 'Text före telefonnummer på mobil',
      type: 'text',
      defaultValue: 'Ring',
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
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
