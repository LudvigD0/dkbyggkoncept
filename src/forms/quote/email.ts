import type { QuoteAttachment } from './images'
import type { QuoteField, QuoteValues } from './shared'
import { quoteSenderAddress, quoteSenderName } from './emailConfig'

const escapeHTML = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  )
export function buildQuoteEmail(
  fields: QuoteField[],
  values: QuoteValues,
  recipient: string,
  attachments: QuoteAttachment[],
) {
  const rows = fields.flatMap((field) => {
    if (!('name' in field) || field.blockType === 'quoteImages') return []
    const value = values[field.name] || ''
    const display =
      field.blockType === 'select'
        ? (field.options || []).find((option) => option.value === value)?.label || 'Ej angivet'
        : value || 'Ej angivet'
    return [{ label: field.label || field.name, value: display }]
  })
  const emailField = fields.find((field) => field.blockType === 'email')
  const replyTo = emailField && 'name' in emailField ? values[emailField.name] : undefined
  return {
    from: `${quoteSenderName()} <${quoteSenderAddress()}>`,
    to: [recipient],
    reply_to: replyTo,
    subject: 'Ny offertförfrågan – DK Byggkoncept',
    text: [
      'Ny offertförfrågan',
      ...rows.map((row) => `${row.label}: ${row.value}`),
      `Bifogade bilder: ${attachments.length}`,
    ].join('\n\n'),
    html: `<!doctype html><html lang="sv"><body style="font-family:Arial,sans-serif;color:#1b211e;line-height:1.6"><h1 style="font-size:24px">Ny offertförfrågan</h1><table cellpadding="12" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:700px">${rows.map((row) => `<tr><th scope="row" style="text-align:left;vertical-align:top;border-bottom:1px solid #ddd">${escapeHTML(row.label)}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHTML(row.value)}</td></tr>`).join('')}</table><p>Bifogade bilder: ${attachments.length}. Svara på detta mejl för att kontakta avsändaren.</p></body></html>`,
    attachments,
  }
}

export class QuoteDeliveryError extends Error {
  constructor(public readonly status: number) {
    super('Resend did not accept the email')
  }
}
export async function deliverQuoteEmail(message: ReturnType<typeof buildQuoteEmail>, key: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new QuoteDeliveryError(response.status)
  const data: unknown = await response.json()
  if (!data || typeof data !== 'object' || !('id' in data) || typeof data.id !== 'string')
    throw new QuoteDeliveryError(502)
  return data.id
}
