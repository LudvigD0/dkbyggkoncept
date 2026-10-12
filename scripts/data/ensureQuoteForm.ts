import type { Payload } from 'payload'
import { quoteFormData } from './quoteForm'

export async function ensureQuoteForm(payload: Payload) {
  const existing = await payload.find({
    collection: 'forms',
    where: { seedKey: { equals: 'dk-quote-form' } },
    depth: 0,
    limit: 1,
  })
  const form =
    existing.docs[0] ||
    (await payload.create({
      collection: 'forms',
      context: { disableRevalidate: true },
      data: quoteFormData,
    }))
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (!settings.quoteRecipientEmail)
    await payload.updateGlobal({
      slug: 'site-settings',
      context: { disableRevalidate: true },
      data: { quoteRecipientEmail: 'info@dkbyggkoncept.se' },
    })
  return form
}
