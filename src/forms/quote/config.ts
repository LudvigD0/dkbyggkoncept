import type { Block, CollectionConfig, Field } from 'payload'
import { APIError } from 'payload'
import { revalidatePath } from 'next/cache'

const step: Field = {
  name: 'step',
  label: 'Formulärsteg',
  type: 'select',
  defaultValue: '1',
  options: [
    { label: '1 – Ditt projekt', value: '1' },
    { label: '2 – Omfattning', value: '2' },
    { label: '3 – Kontaktuppgifter', value: '3' },
  ],
}
const quoteImages: Block = {
  slug: 'quoteImages',
  labels: { singular: 'Offertbilder', plural: 'Offertbilder' },
  fields: [
    { name: 'name', label: 'Fältnamn', type: 'text', required: true, defaultValue: 'images' },
    { name: 'label', label: 'Rubrik', type: 'text', defaultValue: 'Bifoga bilder' },
    { name: 'helpText', label: 'Hjälptext', type: 'textarea' },
    step,
  ],
}

export function quoteFormFields(defaultFields: Field[]): Field[] {
  return [
    { name: 'seedKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    {
      name: 'formKind',
      label: 'Formulärtyp',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'Vanligt formulär', value: 'general' },
        { label: 'Offert i tre steg', value: 'quote' },
      ],
    },
    ...defaultFields.map((field) => {
      if (field.type === 'blocks' && field.name === 'fields')
        return {
          ...field,
          blocks: [
            ...field.blocks.map((block) => ({
              ...block,
              fields: [
                ...block.fields,
                step,
                ...(!block.fields.some(
                  (field) => 'name' in field && field.name === 'placeholder',
                ) && ['text', 'textarea', 'email'].includes(block.slug)
                  ? [{ name: 'placeholder', label: 'Platshållare', type: 'text' } as Field]
                  : []),
                ...(['text', 'email'].includes(block.slug)
                  ? [
                      {
                        name: 'inputType',
                        label: 'Inmatningstyp',
                        type: 'select',
                        defaultValue: block.slug === 'email' ? 'email' : 'text',
                        options: ['text', 'email', 'tel'],
                      } as Field,
                      {
                        name: 'autoComplete',
                        label: 'Autofyll (t.ex. name, email, tel)',
                        type: 'text',
                      } as Field,
                    ]
                  : []),
              ],
            })),
            quoteImages,
          ],
        }
      if (field.type === 'array' && field.name === 'emails')
        return {
          ...field,
          access: { ...field.access, read: ({ req }) => Boolean(req.user) },
          admin: { ...field.admin, condition: (_, data) => data.formKind !== 'quote' },
        } as Field
      return field
    }),
    {
      name: 'quoteSettings',
      label: 'Offertformulärets texter',
      type: 'group',
      admin: { condition: (_, data) => data.formKind === 'quote' },
      fields: [
        {
          name: 'steps',
          label: 'Steg',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          fields: [
            { name: 'title', label: 'Rubrik', type: 'text', required: true },
            { name: 'description', label: 'Beskrivning', type: 'textarea' },
          ],
        },
        { name: 'privacyText', label: 'Integritetstext', type: 'textarea', required: true },
        { name: 'requiredText', label: 'Text om obligatoriska fält', type: 'text' },
        { name: 'nextLabel', label: 'Nästa-knapp', type: 'text', defaultValue: 'Nästa steg' },
        { name: 'backLabel', label: 'Tillbaka-knapp', type: 'text', defaultValue: 'Tillbaka' },
        {
          name: 'optionalLabel',
          label: 'Etikett för frivilliga fält',
          type: 'text',
          defaultValue: 'valfritt',
        },
        {
          name: 'selectPlaceholder',
          label: 'Tomt val i listor',
          type: 'text',
          defaultValue: 'Välj ett alternativ',
        },
        {
          name: 'sendingLabel',
          label: 'Text när formuläret skickas',
          type: 'text',
          defaultValue: 'Skickar…',
        },
        {
          name: 'successTitle',
          label: 'Rubrik efter inskick',
          type: 'text',
          defaultValue: 'Tack för din förfrågan!',
        },
        {
          name: 'successText',
          label: 'Text efter inskick',
          type: 'textarea',
          defaultValue: 'Vi har fått din offertförfrågan och återkommer med nästa steg.',
        },
      ],
    },
  ]
}

export const quoteSubmissionFields = (defaultFields: Field[]): Field[] => [
  ...defaultFields,
  { name: 'quoteRequestID', type: 'text', unique: true, index: true, admin: { hidden: true } },
  {
    name: 'quoteDelivery',
    label: 'E-poststatus',
    type: 'select',
    options: [
      { label: 'Väntar', value: 'pending' },
      { label: 'Skickad till Resend', value: 'sent' },
      { label: 'Misslyckades', value: 'failed' },
    ],
    admin: { readOnly: true },
  },
  {
    name: 'resendMessageID',
    label: 'Resend meddelande-ID',
    type: 'text',
    admin: { readOnly: true },
  },
]

export const guardQuoteSubmission: NonNullable<CollectionConfig['hooks']>['beforeValidate'] = [
  async ({ data, req, context, operation }) => {
    if (operation === 'create' && data?.form) {
      const form = await req.payload.findByID({
        collection: 'forms',
        id: typeof data.form === 'object' ? data.form.id : data.form,
        depth: 0,
        req,
      })
      if (form.formKind === 'quote' && !context.validatedQuoteSubmission)
        throw new APIError('Använd offertformuläret för att skicka en offertförfrågan.', 403)
    }
    return data
  },
]

export const revalidateForm: NonNullable<CollectionConfig['hooks']>['afterChange'] = [
  ({ doc, context }) => {
    if (!context.disableRevalidate) revalidatePath('/', 'layout')
    return doc
  },
]
