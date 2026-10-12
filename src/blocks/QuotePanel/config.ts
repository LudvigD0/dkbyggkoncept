import type { Block } from 'payload'
import { anchor, items, icon } from '../siteFields'
export const QuotePanel: Block = {
  slug: 'quotePanel',
  interfaceName: 'QuotePanelBlock',
  labels: { singular: 'Offert och formulär', plural: 'Offert och formulär' },
  fields: [
    anchor,
    {
      name: 'form',
      label: 'Formulär',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        description:
          'Välj ett Payload-formulär. Utan formulär visas den redigerbara informationstexten.',
      },
    },
    { name: 'placeholderTitle', label: 'Rubrik utan formulär', type: 'text' },
    { name: 'placeholderText', label: 'Text utan formulär', type: 'textarea' },
    {
      name: 'selectedLabel',
      label: 'Etikett för vald tjänst',
      type: 'text',
      defaultValue: 'Gäller:',
    },
    {
      name: 'services',
      label: 'Valbara tjänster',
      type: 'array',
      fields: [
        { name: 'slug', label: 'Tjänstens URL-nyckel', type: 'text', required: true },
        { name: 'title', label: 'Tjänstens namn', type: 'text', required: true },
      ],
    },
    {
      name: 'contacts',
      label: 'Kontaktlänkar',
      type: 'array',
      fields: [
        { name: 'label', label: 'Rubrik', type: 'text', required: true },
        { name: 'value', label: 'Kontaktuppgift', type: 'text', required: true },
        { name: 'url', label: 'Länk', type: 'text', required: true },
        icon,
        { name: 'dark', label: 'Mörk bakgrund', type: 'checkbox' },
      ],
    },
    { name: 'checklistTitle', label: 'Rubrik för tips', type: 'text' },
    items,
  ],
}
