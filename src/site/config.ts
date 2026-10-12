import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidatePath, revalidateTag } from 'next/cache'
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Webbplats',
  access: { read: () => true, update: authenticated },
  hooks: {
    afterChange: [
      ({ doc, context }) => {
        if (!context.disableRevalidate) {
          revalidateTag('site-settings', { expire: 0 })
          revalidatePath('/', 'layout')
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Inställningar',
          fields: [
            {
              name: 'quoteRecipientEmail',
              label: 'Mottagare av offertförfrågningar',
              type: 'email',
              access: { read: ({ req }) => Boolean(req.user) },
              admin: {
                description:
                  'Offertformuläret skickar till denna adress. Ändringar gäller nästa förfrågan utan ombyggnad av webbplatsen.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'company',
      label: 'Företag',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'organizationNumber',
          label: 'Organisationsnummer',
          type: 'text',
          admin: {
            description:
              'Visas i blocket Företagsuppgifter. Ange tio siffror, med eller utan bindestreck.',
          },
          validate: (value: unknown) =>
            !value ||
            (typeof value === 'string' && /^\d{6}-?\d{4}$/.test(value)) ||
            'Ange organisationsnummer som 559463-0682.',
        },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'phoneHref', type: 'text', required: true },
        { name: 'areas', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
      ],
    },
  ],
}
