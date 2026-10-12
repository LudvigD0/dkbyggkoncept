import { createHash } from 'node:crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  MAX_REQUEST_BYTES,
  MAX_TEXT_LENGTH,
  quoteFormSupportsFields,
  validateQuoteValues,
  type QuoteValues,
} from '@/forms/quote/shared'
import { prepareQuoteAttachments } from '@/forms/quote/images'
import { buildQuoteEmail, deliverQuoteEmail, QuoteDeliveryError } from '@/forms/quote/email'
import { resendConfigured } from '@/forms/quote/emailConfig'
import { allowQuoteRequest } from '@/forms/quote/rateLimit'

export const runtime = 'nodejs'
export const maxDuration = 60
const reply = (body: object, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
async function readFormData(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data'))
    throw new Error('Invalid content type')
  if (Number(request.headers.get('content-length') || 0) > MAX_REQUEST_BYTES)
    throw new Error('Request too large')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing body')
  const chunks: Uint8Array[] = []
  let length = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > MAX_REQUEST_BYTES) {
      await reader.cancel()
      throw new Error('Request too large')
    }
    chunks.push(value)
  }
  return new Response(Buffer.concat(chunks), {
    headers: { 'Content-Type': request.headers.get('content-type')! },
  }).formData()
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin)
    return reply({ error: 'Förfrågan kunde inte verifieras. Ladda om sidan och försök igen.' }, 403)
  let body: FormData
  try {
    body = await readFormData(request)
  } catch {
    return reply(
      { error: 'Formuläret kunde inte läsas. Kontrollera bilderna och försök igen.' },
      400,
    )
  }
  if (body.get('website')) return reply({ error: 'Förfrågan kunde inte skickas.' }, 400)
  const formID = body.get('formID')
  const requestID = body.get('requestID')
  if (
    typeof formID !== 'string' ||
    !/^[a-f\d]{24}$/i.test(formID) ||
    typeof requestID !== 'string' ||
    !/^[a-f\d-]{36}$/i.test(requestID)
  )
    return reply({ error: 'Ladda om sidan och försök igen.' }, 400)
  let payload: Awaited<ReturnType<typeof getPayload>> | undefined
  try {
    payload = await getPayload({ config })
    const form = await payload.findByID({
      collection: 'forms',
      id: formID,
      depth: 0,
      overrideAccess: false,
    })
    if (form.formKind !== 'quote' || !form.fields?.length || !quoteFormSupportsFields(form.fields))
      return reply(
        { error: 'Offertformuläret är inte tillgängligt. Kontakta oss via telefon eller mejl.' },
        400,
      )
    const values: QuoteValues = {}
    for (const field of form.fields) {
      if (!('name' in field) || field.blockType === 'quoteImages') continue
      const entries = body.getAll(field.name)
      if (entries.length > 1 || entries.some((entry) => typeof entry !== 'string'))
        return reply({ error: 'Kontrollera formulärets uppgifter.' }, 400)
      values[field.name] = String(entries[0] || '')
        .trim()
        .slice(0, MAX_TEXT_LENGTH + 1)
    }
    const errors = validateQuoteValues(form.fields, values)
    if (Object.keys(errors).length)
      return reply({ error: 'Kontrollera de markerade fälten.', errors }, 400)
    const emailField = form.fields.find((field) => field.blockType === 'email')!
    const email = 'name' in emailField ? values[emailField.name] : ''
    if (!(await allowQuoteRequest(payload, request, email)))
      return reply(
        { error: 'Du har skickat flera förfrågningar. Vänta en stund och försök igen.' },
        429,
      )
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    })
    const recipient = settings.quoteRecipientEmail
    if (!resendConfigured() || !recipient)
      return reply(
        {
          error:
            'Formuläret kan inte skicka just nu. Försök senare eller kontakta oss via telefon eller mejl.',
        },
        503,
      )
    const imageFields = form.fields.filter((field) => field.blockType === 'quoteImages')
    const files: File[] = []
    for (const field of imageFields) {
      for (const value of body.getAll(field.name)) {
        if (typeof value === 'string')
          return reply({ error: 'Välj bilderna igen och försök på nytt.' }, 400)
        if (value.size) files.push(value)
      }
    }
    let attachments: Awaited<ReturnType<typeof prepareQuoteAttachments>>
    try {
      attachments = await prepareQuoteAttachments(files)
    } catch (error) {
      return reply({ error: error instanceof Error ? error.message : 'Kontrollera bilderna.' }, 400)
    }
    const message = buildQuoteEmail(form.fields, values, recipient, attachments)
    const key = `quote/${requestID}/${createHash('sha256').update(JSON.stringify(message)).digest('hex')}`
    // Only this validated endpoint may create quote submissions. These server-side writes intentionally bypass public collection access.
    const existing = await payload.find({
      collection: 'form-submissions',
      where: { quoteRequestID: { equals: key } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]?.quoteDelivery === 'sent') return reply({ success: true })
    let submission = existing.docs[0]
    if (!submission) {
      try {
        submission = await payload.create({
          collection: 'form-submissions',
          overrideAccess: true,
          context: { validatedQuoteSubmission: true },
          data: {
            form: formID,
            quoteRequestID: key,
            quoteDelivery: 'pending',
            submissionData: [
              ...Object.entries(values).map(([field, value]) => ({ field, value })),
              { field: 'bifogadeBilder', value: String(attachments.length) },
            ],
          },
        })
      } catch (error) {
        const concurrent = await payload.find({
          collection: 'form-submissions',
          where: { quoteRequestID: { equals: key } },
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
        if (!concurrent.docs[0]) throw error
        submission = concurrent.docs[0]
      }
    }
    try {
      const messageID = await deliverQuoteEmail(message, key)
      await payload.update({
        collection: 'form-submissions',
        id: submission.id,
        overrideAccess: true,
        data: { quoteDelivery: 'sent', resendMessageID: messageID },
      })
    } catch (error) {
      await payload
        .update({
          collection: 'form-submissions',
          id: submission.id,
          overrideAccess: true,
          data: { quoteDelivery: 'failed' },
        })
        .catch(() => {})
      throw error
    }
    return reply({ success: true })
  } catch (error) {
    payload?.logger.error({
      msg: 'Quote submission failed',
      providerStatus: error instanceof QuoteDeliveryError ? error.status : undefined,
    })
    return reply(
      {
        error:
          'Förfrågan kunde inte skickas just nu. Dina uppgifter finns kvar så att du kan försöka igen.',
      },
      503,
    )
  }
}
