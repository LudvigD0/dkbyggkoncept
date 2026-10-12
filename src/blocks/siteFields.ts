import type { Field, ArrayField, UploadField, TextField } from 'payload'
import { link } from '@/fields/link'
export const anchor: TextField = {
  name: 'anchor',
  label: 'Ankare (för länkar till avsnittet)',
  type: 'text',
  validate: (value: unknown) =>
    !value ||
    (typeof value === 'string' && /^[a-zA-Z][\w-]*$/.test(value)) ||
    'Använd bokstäver, siffror och bindestreck.',
}
export const heading: TextField = { name: 'heading', label: 'Rubrik', type: 'text' }
export const eyebrow: Field = { name: 'eyebrow', label: 'Överrubrik', type: 'text' }
export const body: Field = { name: 'body', label: 'Text', type: 'textarea' }
export const sectionFields: Field[] = [anchor, eyebrow, heading, body]
export const image = (name = 'image', label = 'Bild'): UploadField => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
  filterOptions: { mimeType: { contains: 'image/' } },
})
export const imageFields: Field[] = [
  image(),
  { name: 'imageAlt', label: 'Bildbeskrivning (lämna tom för medias alt-text)', type: 'text' },
  { name: 'imageLabel', label: 'Bildetikett', type: 'text' },
]
export const items: ArrayField = {
  name: 'items',
  label: 'Punkter',
  type: 'array',
  fields: [{ name: 'text', label: 'Text', type: 'text', required: true }],
}
export const actions = (name = 'links', label = 'Knappar och länkar'): ArrayField => ({
  name,
  label,
  type: 'array',
  fields: [
    link({ appearances: false }),
    {
      name: 'style',
      label: 'Utseende',
      type: 'select',
      defaultValue: 'solid',
      options: [
        { label: 'Mörk knapp', value: 'solid' },
        { label: 'Blå knapp', value: 'accent' },
        { label: 'Konturknapp', value: 'outline' },
        { label: 'Textlänk', value: 'text' },
        { label: 'Navigeringspiller', value: 'pill' },
      ],
    },
  ],
})
export const icon: Field = {
  name: 'icon',
  label: 'Ikon',
  type: 'select',
  options: [
    { label: 'Ingen', value: 'none' },
    { label: 'Löv', value: 'leaf' },
    { label: 'Öra', value: 'ear' },
    { label: 'Sol', value: 'sun' },
    { label: 'Verktyg', value: 'wrench' },
    { label: 'Telefon', value: 'phone' },
    { label: 'Mejl', value: 'mail' },
    { label: 'Plats', value: 'mapPin' },
    { label: 'Bock', value: 'check' },
  ],
  defaultValue: 'none',
}
export const optionalLink: Field[] = [
  { name: 'enableLink', label: 'Länka kortet', type: 'checkbox' },
  link({
    appearances: false,
    overrides: { admin: { condition: (_, data) => Boolean(data.enableLink) } },
  }),
]
