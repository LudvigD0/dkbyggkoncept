import type { Form } from '@/payload-types'

export const MAX_IMAGES = 5
export const MAX_IMAGE_BYTES = 700 * 1024
export const MAX_REQUEST_BYTES = 4 * 1024 * 1024
export const MAX_TEXT_LENGTH = 5000
export const imageTypes = ['image/jpeg', 'image/png', 'image/webp']
export type QuoteField = NonNullable<Form['fields']>[number]
export type QuoteFormData = Pick<
  Form,
  'id' | 'fields' | 'quoteSettings' | 'submitButtonLabel' | 'title'
>
export type QuoteValues = Record<string, string>
export type QuoteErrors = Record<string, string>

export function validateQuoteValues(fields: QuoteField[], values: QuoteValues): QuoteErrors {
  const errors: QuoteErrors = {}
  for (const field of fields) {
    if (!('name' in field) || field.blockType === 'quoteImages') continue
    const value = (values[field.name] || '').trim()
    if ('required' in field && field.required && !value) {
      errors[field.name] = 'Fyll i detta fält.'
      continue
    }
    if (!value) continue
    const limit = field.blockType === 'textarea' ? MAX_TEXT_LENGTH : 250
    if (value.length > limit) {
      errors[field.name] = `Använd högst ${limit} tecken.`
      continue
    }
    if (
      field.blockType === 'select' &&
      !(field.options || []).some((option) => option.value === value)
    )
      errors[field.name] = 'Välj ett alternativ i listan.'
    if (field.blockType === 'email' && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value))
      errors[field.name] = 'Ange en giltig e-postadress.'
    if (
      'inputType' in field &&
      field.inputType === 'tel' &&
      (!/^[+\d\s().-]+$/.test(value) ||
        value.replace(/\D/g, '').length < 6 ||
        value.replace(/\D/g, '').length > 20)
    )
      errors[field.name] = 'Ange ett giltigt telefonnummer.'
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value))
      errors[field.name] = 'Ta bort ogiltiga tecken.'
  }
  return errors
}

export function quoteFormSupportsFields(fields: QuoteField[]) {
  const names = new Set<string>()
  return (
    fields.every((field) => {
      if (
        !['text', 'email', 'textarea', 'select', 'quoteImages'].includes(field.blockType) ||
        !('name' in field) ||
        !/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/.test(field.name) ||
        names.has(field.name)
      )
        return false
      names.add(field.name)
      if (field.blockType === 'select' && !field.options?.length) return false
      return field.step === '1' || field.step === '2' || field.step === '3'
    }) && fields.some((field) => field.blockType === 'email')
  )
}
