import { s3Storage } from '@payloadcms/storage-s3'
const keys = [
  'S3_REGION',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET',
] as const
const configured = keys.filter((key) => Boolean(process.env[key]))
if (configured.length && configured.length !== keys.length)
  throw new Error(
    `Incomplete S3 configuration: ${keys.filter((key) => !process.env[key]).join(', ')}`,
  )
export const storagePlugins = configured.length
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.S3_BUCKET!,
        config: {
          region: process.env.S3_REGION!,
          endpoint: process.env.S3_ENDPOINT!,
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
        },
      }),
    ]
  : []
