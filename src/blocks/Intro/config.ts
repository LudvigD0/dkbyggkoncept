import type { Block } from 'payload'
import { sectionFields, actions } from '../siteFields'
export const Intro: Block = {
  slug: 'intro',
  interfaceName: 'IntroBlock',
  labels: { singular: 'Introduktion', plural: 'Introduktion' },
  fields: [
    ...sectionFields,
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      defaultValue: 'split',
      options: [
        { label: 'Två kolumner', value: 'split' },
        { label: 'Samlad text', value: 'stacked' },
      ],
    },
    actions(),
  ],
}
