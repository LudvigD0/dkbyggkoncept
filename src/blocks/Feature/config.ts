import type { Block } from 'payload'
import { sectionFields, imageFields, items, actions } from '../siteFields'
export const Feature: Block = {
  slug: 'feature',
  interfaceName: 'FeatureBlock',
  labels: { singular: 'Bild och text', plural: 'Bild och text' },
  fields: [
    ...sectionFields,
    ...imageFields,
    {
      name: 'imageSide',
      label: 'Bildplacering',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Vänster', value: 'left' },
        { label: 'Höger', value: 'right' },
      ],
    },
    {
      name: 'imageAspect',
      label: 'Bildformat',
      type: 'select',
      defaultValue: 'landscape',
      options: [
        { label: 'Liggande', value: 'landscape' },
        { label: 'Kvadrat', value: 'square' },
      ],
    },
    {
      name: 'appearance',
      label: 'Utseende',
      type: 'select',
      defaultValue: 'card',
      options: [
        { label: 'Kort', value: 'card' },
        { label: 'Öppet avsnitt', value: 'plain' },
      ],
    },
    { name: 'badge', label: 'Märkning', type: 'text' },
    { name: 'secondaryBody', label: 'Extra text', type: 'textarea' },
    items,
    actions(),
  ],
}
