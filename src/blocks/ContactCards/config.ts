import type { Block } from 'payload'
import { sectionFields, icon, optionalLink } from '../siteFields'
export const ContactCards: Block = {
  slug: 'contactCards',
  interfaceName: 'ContactCardsBlock',
  labels: { singular: 'Kontaktkort', plural: 'Kontaktkort' },
  fields: [
    ...sectionFields,
    {
      name: 'cards',
      label: 'Kontaktkort',
      type: 'array',
      fields: [
        { name: 'label', label: 'Rubrik', type: 'text', required: true },
        { name: 'value', label: 'Kontaktuppgift / text', type: 'textarea', required: true },
        icon,
        { name: 'dark', label: 'Mörk bakgrund', type: 'checkbox' },
        ...optionalLink,
      ],
    },
  ],
}
