import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { Page } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { authenticated } from '@/access/authenticated'
import {
  quoteFormFields,
  quoteSubmissionFields,
  guardQuoteSubmission,
  revalidateForm,
} from '@/forms/quote/config'

const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | DK Byggkoncept` : 'DK Byggkoncept'
}

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug && doc.slug !== 'home' ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      access: { create: authenticated, update: authenticated, delete: authenticated },
      hooks: { afterChange: revalidateForm },
      fields: ({ defaultFields }) => {
        return quoteFormFields(defaultFields).map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      fields: ({ defaultFields }) => quoteSubmissionFields(defaultFields),
      access: { read: authenticated, update: authenticated, delete: authenticated },
      hooks: { beforeValidate: guardQuoteSubmission },
    },
    beforeEmail: async (emails, { data, req }) => {
      const form = await req.payload.findByID({ collection: 'forms', id: data.form, depth: 0, req })
      return form.formKind === 'quote' ? [] : emails
    },
  }),
]
