import type { Block } from 'payload'
import { sectionFields, image, actions } from '../siteFields'

export const BeforeAfter: Block = {
  slug: 'beforeAfter',
  interfaceName: 'BeforeAfterBlock',
  labels: { singular: 'Före och efter – två bilder', plural: 'Före och efter – bildpar' },
  fields: [
    ...sectionFields,
    { name: 'beforeLabel', label: 'Etikett före', type: 'text', defaultValue: 'Före' },
    { name: 'afterLabel', label: 'Etikett efter', type: 'text', defaultValue: 'Efter' },
    {
      name: 'placeholderLabel',
      label: 'Text för bildplatshållare',
      type: 'text',
      defaultValue: 'Projektbild kommer snart',
    },
    image('beforeImage', 'Före-bild'),
    { name: 'beforeAlt', label: 'Alt-text före', type: 'text' },
    { name: 'beforeCaption', label: 'Bildtext före', type: 'text' },
    image('afterImage', 'Efter-bild'),
    { name: 'afterAlt', label: 'Alt-text efter', type: 'text' },
    { name: 'afterCaption', label: 'Bildtext efter', type: 'text' },
    actions(),
  ],
}
