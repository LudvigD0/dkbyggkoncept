import type { Block } from 'payload'
import { sectionFields } from '../siteFields'

export const InstagramFeed: Block = {
  slug: 'instagramFeed',
  interfaceName: 'InstagramFeedBlock',
  labels: { singular: 'Instagram-inlägg', plural: 'Instagram-inlägg' },
  fields: [
    ...sectionFields,
    {
      name: 'accountURL',
      type: 'text',
      label: 'Länk till Instagram-kontot',
      required: true,
      defaultValue: 'https://www.instagram.com/dkbyggkoncept_ab/',
      validate: (value: unknown) => {
        try {
          const url = new URL(String(value))
          return (
            (url.protocol === 'https:' &&
              ['instagram.com', 'www.instagram.com'].includes(url.hostname) &&
              !url.username &&
              !url.password) ||
            'Använd en https-länk till Instagram.'
          )
        } catch {
          return 'Använd en https-länk till Instagram.'
        }
      },
    },
    { name: 'accountLabel', type: 'text', label: 'Kontonamn', defaultValue: '@dkbyggkoncept_ab' },
    { name: 'linkLabel', type: 'text', label: 'Knapptext', defaultValue: 'Följ oss på Instagram' },
    {
      name: 'postCount',
      type: 'select',
      label: 'Antal inlägg',
      defaultValue: '6',
      options: [
        { label: '3 inlägg', value: '3' },
        { label: '6 inlägg', value: '6' },
      ],
    },
    {
      name: 'emptyText',
      type: 'textarea',
      label: 'Text om inläggen inte är tillgängliga',
      defaultValue: 'Se fler bilder från våra projekt och följ arbetet på Instagram.',
      admin: {
        description:
          'Visas tillsammans med kontolänken om Instagram inte kan nås. Inga påhittade inlägg visas.',
      },
    },
  ],
}
