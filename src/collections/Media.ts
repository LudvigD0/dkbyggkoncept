import type { CollectionConfig } from 'payload'
import type { ResizeOptions } from 'sharp'
import { revalidatePath, revalidateTag } from 'next/cache'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
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
    afterDelete: [
      ({ doc, context }) => {
        if (!context.disableRevalidate) {
          revalidateTag('site-settings', { expire: 0 })
          revalidatePath('/', 'layout')
        }
        return doc
      },
    ],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    { name: 'seedKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 80 } },
    resizeOptions: {
      width: 1920,
      height: 2500,
      fit: 'inside',
      withoutEnlargement: true,
    } satisfies ResizeOptions,
    imageSizes: [
      {
        formatOptions: { format: 'webp' },
        name: 'thumbnail',
        width: 300,
      },
      {
        formatOptions: { format: 'webp' },
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        formatOptions: { format: 'webp' },
        name: 'small',
        width: 600,
      },
      {
        formatOptions: { format: 'webp' },
        name: 'medium',
        width: 900,
      },
      {
        formatOptions: { format: 'webp' },
        name: 'large',
        width: 1400,
      },
      {
        formatOptions: { format: 'webp' },
        name: 'xlarge',
        width: 1920,
      },
      {
        formatOptions: { format: 'webp' },
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
