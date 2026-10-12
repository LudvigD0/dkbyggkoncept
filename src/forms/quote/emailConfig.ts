import { resendAdapter } from '@payloadcms/email-resend'

export const quoteSenderAddress = () => process.env.RESEND_FROM_EMAIL?.trim()
export const quoteSenderName = () => process.env.RESEND_FROM_NAME?.trim() || 'DK Byggkoncept'
export const resendConfigured = () => Boolean(process.env.RESEND_API_KEY && quoteSenderAddress())

export const emailAdapter = resendConfigured()
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY!,
      defaultFromAddress: quoteSenderAddress()!,
      defaultFromName: quoteSenderName(),
    })
  : undefined
