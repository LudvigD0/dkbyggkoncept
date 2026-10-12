import type { Block } from 'payload'
import { sectionFields, image, actions } from '../siteFields'
export const SiteCTA: Block = {
  slug: 'siteCTA',
  interfaceName: 'SiteCTABlock',
  labels: { singular: 'Kontakt / CTA', plural: 'Kontakt / CTA' },
  fields: [
    ...sectionFields,
    image('backgroundImage', 'Bakgrundsbild'),
    {
      name: 'appearance',
      label: 'Utseende',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Mörkt bildband', value: 'dark' },
        { label: 'Ljust band', value: 'light' },
      ],
    },
    actions(),
  ],
}
