import type { Block } from 'payload'
import { sectionFields, image, actions } from '../siteFields'

export const ProjectShowcase: Block = {
  slug: 'projectShowcase',
  interfaceName: 'ProjectShowcaseBlock',
  labels: {
    singular: 'Projekt – bildslider med före och efter',
    plural: 'Projekt – bildsliders',
  },
  fields: [
    ...sectionFields,
    actions(),
    {
      name: 'scrollLabel',
      label: 'Hjälptext för bildslider',
      type: 'text',
      defaultValue: 'Bläddra eller svep för att se fler bilder.',
    },
    { name: 'beforeLabel', label: 'Etikett före', type: 'text', defaultValue: 'Före' },
    { name: 'afterLabel', label: 'Etikett efter', type: 'text', defaultValue: 'Efter' },
    {
      name: 'previousLabel',
      label: 'Föregående bild – knapptext',
      type: 'text',
      defaultValue: 'Föregående bild',
    },
    {
      name: 'nextLabel',
      label: 'Nästa bild – knapptext',
      type: 'text',
      defaultValue: 'Nästa bild',
    },
    {
      name: 'placeholderLabel',
      label: 'Text för bildplatshållare',
      type: 'text',
      defaultValue: 'Projektbild kommer snart',
    },
    {
      name: 'emptyText',
      label: 'Text när projekt saknas',
      type: 'textarea',
      defaultValue: 'Här visar vi snart våra projekt, från utgångsläge till färdigt resultat.',
    },
    image('emptyImage', 'Illustrationsbild när projekt saknas'),
    {
      name: 'emptyImageLabel',
      label: 'Illustrationsbildens etikett',
      type: 'text',
    },
    {
      name: 'projects',
      label: 'Projekt',
      type: 'array',
      admin: {
        initCollapsed: true,
        description:
          'Varje projekt har en bildslider. Lägg till valfritt antal före- och efterbilder och ordna dem som du vill.',
      },
      fields: [
        { name: 'title', label: 'Projektnamn', type: 'text', required: true },
        { name: 'description', label: 'Projektbeskrivning', type: 'textarea' },
        { name: 'category', label: 'Typ av arbete', type: 'text' },
        { name: 'place', label: 'Ort', type: 'text' },
        { name: 'imageNotice', label: 'Bildnotering', type: 'text' },
        actions(),
        {
          name: 'images',
          label: 'Bilder i slidern',
          type: 'array',
          minRows: 1,
          required: true,
          admin: {
            description:
              'Ordna bilderna fritt. Märk varje bild som Före eller Efter. Tomma bildfält visar platshållare.',
          },
          fields: [
            {
              name: 'stage',
              label: 'Före eller efter',
              type: 'select',
              required: true,
              defaultValue: 'after',
              options: [
                { label: 'Före', value: 'before' },
                { label: 'Efter', value: 'after' },
              ],
            },
            image(),
            { name: 'imageAlt', label: 'Alt-text', type: 'text' },
            { name: 'caption', label: 'Bildtext', type: 'text' },
          ],
        },
      ],
    },
  ],
}
