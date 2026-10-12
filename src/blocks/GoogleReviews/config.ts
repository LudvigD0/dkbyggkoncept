import type { Block } from 'payload'
import { sectionFields } from '../siteFields'

const optionalHTTPSURL = (value: unknown) => {
  if (!value) return true
  try {
    return new URL(String(value)).protocol === 'https:' || 'Använd en fullständig https-länk.'
  } catch {
    return 'Använd en fullständig https-länk.'
  }
}

export const GoogleReviews: Block = {
  slug: 'googleReviews',
  interfaceName: 'GoogleReviewsBlock',
  labels: { singular: 'Google-recensioner', plural: 'Google-recensioner' },
  fields: [
    ...sectionFields,
    {
      name: 'sourceLabel',
      label: 'Källtext under recensionen',
      type: 'text',
      defaultValue: 'Skrivet på Google',
    },
    {
      name: 'googleURL',
      label: 'Länk till företagets Google-recensioner (valfri)',
      type: 'text',
      validate: optionalHTTPSURL,
    },
    {
      name: 'linkLabel',
      label: 'Text för länken till alla recensioner',
      type: 'text',
      defaultValue: 'Läs fler recensioner på Google',
      admin: { condition: (_, sibling) => Boolean(sibling.googleURL) },
    },
    {
      name: 'reviews',
      label: 'Recensioner',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Recension', plural: 'Recensioner' },
      admin: {
        initCollapsed: true,
        description:
          'Lägg in upp till tre recensioner manuellt. De visas på en rad på dator och under varandra på mobil. Blocket döljs tills namn och recensionstext är ifyllda.',
      },
      fields: [
        { name: 'author', label: 'Recensentens namn', type: 'text', required: true },
        {
          name: 'rating',
          label: 'Stjärnbetyg',
          type: 'select',
          required: true,
          defaultValue: '5',
          options: [
            { label: '5 stjärnor', value: '5' },
            { label: '4 stjärnor', value: '4' },
            { label: '3 stjärnor', value: '3' },
            { label: '2 stjärnor', value: '2' },
            { label: '1 stjärna', value: '1' },
          ],
        },
        { name: 'text', label: 'Recensionstext', type: 'textarea', required: true },
        {
          name: 'dateLabel',
          label: 'Datum (valfritt, t.ex. september 2026)',
          type: 'text',
        },
        {
          name: 'googleURL',
          label: 'Länk till denna recension på Google (valfri)',
          type: 'text',
          validate: optionalHTTPSURL,
        },
      ],
    },
  ],
}
