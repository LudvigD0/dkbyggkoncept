import type { Block } from 'payload'
import { sectionFields, image, imageFields, optionalLink, actions } from '../siteFields'
export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Bilder och projekt', plural: 'Bilder och projekt' },
  fields: [
    ...sectionFields,
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Rutnät', value: 'grid' },
        { label: 'Bildmosaik', value: 'mosaic' },
        { label: 'Team / två kolumner', value: 'team' },
      ],
    },
    {
      name: 'columns',
      label: 'Kolumner',
      type: 'select',
      defaultValue: '2',
      options: ['1', '2', '3'],
    },
    {
      ...actions(),
      admin: {
        description:
          'Visas under bilderna. Länka exempelvis till projektsidan och välj Textlänk för samma utseende som i övriga sektioner.',
      },
    },
    {
      name: 'entries',
      label: 'Bilder och kort',
      type: 'array',
      fields: [
        ...imageFields,
        image('beforeImage', 'Före-bild'),
        image('afterImage', 'Efter-bild'),
        { name: 'beforeLabel', label: 'Etikett före', type: 'text', defaultValue: 'Före' },
        { name: 'afterLabel', label: 'Etikett efter', type: 'text', defaultValue: 'Efter' },
        {
          name: 'compareLabel',
          label: 'Text för jämförelsereglage',
          type: 'text',
          defaultValue: 'Jämför före och efter',
        },
        { name: 'title', label: 'Rubrik', type: 'text' },
        { name: 'description', label: 'Text', type: 'textarea' },
        { name: 'category', label: 'Kategori', type: 'text' },
        { name: 'place', label: 'Ort', type: 'text' },
        ...optionalLink,
      ],
    },
  ],
}
