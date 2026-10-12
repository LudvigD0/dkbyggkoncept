import { APIError, type GlobalConfig, type GlobalBeforeChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'
import { encryptInstagramToken, InstagramEncryptionError } from './encryption'

// This project's CMS administrators authenticate through the users collection.
const adminOnly: NonNullable<GlobalConfig['access']>['read'] = ({ req }) =>
  req.user?.collection === 'users'

export const prepareInstagramSettings: GlobalBeforeChangeHook = ({ data, originalDoc }) => {
  const token = typeof data.accessToken === 'string' ? data.accessToken.trim() : ''
  if (!token) {
    // The token is write-only in Admin. Saving an empty field keeps the stored token.
    data.accessToken = originalDoc?.accessToken ?? null
    return data
  }

  try {
    data.accessToken = encryptInstagramToken(token)
  } catch (error) {
    if (error instanceof InstagramEncryptionError) throw new APIError(error.message, 503)
    throw new APIError('Instagram-token kunde inte sparas.', 503)
  }
  data.tokenRegisteredAt = new Date().toISOString()
  data.lastRefreshedAt = null
  data.refreshError = null
  // Do not carry the previous token's dates over to a replacement token.
  if (!data.tokenExpiresAt || data.tokenExpiresAt === originalDoc?.tokenExpiresAt)
    data.tokenExpiresAt = null
  if (!data.tokenIssuedAt || data.tokenIssuedAt === originalDoc?.tokenIssuedAt)
    data.tokenIssuedAt = null
  return data
}

export const InstagramSettings: GlobalConfig = {
  slug: 'instagram-settings',
  label: 'Instagram-inställningar',
  admin: { group: 'Inställningar' },
  access: { read: adminOnly, update: adminOnly },
  hooks: {
    beforeChange: [prepareInstagramSettings],
    afterRead: [
      ({ doc }) => ({
        ...doc,
        hasAccessToken: Boolean(doc.accessToken),
        // Even an authenticated API response or ordinary Local API read omits the secret.
        accessToken: null,
      }),
    ],
    afterChange: [
      ({ doc, req }) => {
        if (!req.context.disableRevalidate) revalidateTag('instagram-posts', { expire: 0 })
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'accessToken',
      type: 'text',
      label: 'Ny Instagram Access Token',
      access: { read: ({ req }) => req.user?.collection === 'users' },
      admin: {
        description:
          'Klistra in en långlivad Instagram Login-token med instagram_business_basic. Token krypteras och visas aldrig igen. Lämna tomt för att behålla den sparade token.',
        components: { Field: '@/instagram/TokenField#TokenField' },
      },
    },
    {
      name: 'hasAccessToken',
      type: 'checkbox',
      label: 'Token finns sparad',
      virtual: true,
      admin: { readOnly: true },
    },
    {
      name: 'tokenIssuedAt',
      type: 'date',
      label: 'Token skapad (om känt)',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Ange det verkliga skapandedatumet om du känner till det. Okänd ålder hanteras genom att vänta minst 24 timmar efter registrering, sedan försöka förnya. Vi antar inte att token är nyskapad.',
      },
      validate: (value) =>
        !value || new Date(value).getTime() <= Date.now() || 'Datumet får inte ligga i framtiden.',
    },
    {
      name: 'tokenExpiresAt',
      type: 'date',
      label: 'Token löper ut',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'Ange ett verifierat utgångsdatum om känt. Lämna annars tomt; Meta bekräftar giltighetstiden vid första lyckade förnyelsen.',
      },
    },
    {
      name: 'lastRefreshedAt',
      type: 'date',
      label: 'Senast förnyad',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'refreshError',
      type: 'textarea',
      label: 'Senaste förnyelsefel',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'tokenRegisteredAt',
      type: 'date',
      label: 'Token registrerad i CMS',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
