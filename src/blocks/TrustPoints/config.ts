import type { Block } from 'payload'
import { actions, optionalLink, sectionFields } from '../siteFields'

export const TrustPoints: Block = {
  slug: 'trustPoints',
  interfaceName: 'TrustPointsBlock',
  labels: { singular: 'Bra att veta – trygghet och arbetsområden', plural: 'Trygghetssektioner' },
  fields: [
    ...sectionFields,
    {
      name: 'items',
      label: 'Trygghetspunkter',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'title', label: 'Rubrik', type: 'text', required: true },
        { name: 'description', label: 'Kort förklaring', type: 'text' },
        {
          name: 'icon',
          label: 'Symbol',
          type: 'select',
          defaultValue: 'check',
          options: [
            { label: 'Bock', value: 'check' },
            { label: 'Pris', value: 'price' },
            { label: 'Bygghjälm', value: 'experience' },
            { label: 'Garanti', value: 'guarantee' },
            { label: 'Avdrag', value: 'rot' },
          ],
        },
        ...optionalLink,
      ],
    },
    { name: 'areasLabel', label: 'Text före orterna', type: 'text', defaultValue: 'Vi arbetar i' },
    {
      name: 'areas',
      label: 'Orter och arbetsområden',
      type: 'array',
      fields: [{ name: 'name', label: 'Ort', type: 'text', required: true }],
    },
    actions(),
  ],
}
