import sharp from 'sharp'
import { MAX_IMAGES, MAX_IMAGE_BYTES, imageTypes } from './shared'

export type QuoteAttachment = { filename: string; content: string }
export async function prepareQuoteAttachments(files: File[]): Promise<QuoteAttachment[]> {
  if (files.length > MAX_IMAGES) throw new Error(`Bifoga högst ${MAX_IMAGES} bilder.`)
  const attachments: QuoteAttachment[] = []
  for (const [index, file] of files.entries()) {
    if (!imageTypes.includes(file.type) || !file.size || file.size > MAX_IMAGE_BYTES)
      throw new Error(
        'En bild har fel format eller är för stor. Välj JPG, PNG eller WebP och försök igen.',
      )
    const input = Buffer.from(await file.arrayBuffer())
    let output: Buffer
    try {
      const options = { limitInputPixels: 40_000_000, animated: false }
      const metadata = await sharp(input, options).metadata()
      if (
        !metadata.format ||
        !['jpeg', 'png', 'webp'].includes(metadata.format) ||
        (metadata.pages || 1) > 1
      )
        throw new Error('Unsupported image')
      // Auto-orient and re-encode to strip EXIF/GPS and prevent disguised file uploads.
      output = await sharp(input, options)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
      if (output.length > MAX_IMAGE_BYTES) throw new Error('Image too large')
    } catch {
      throw new Error('Bilden kunde inte läsas. Välj en annan JPG-, PNG- eller WebP-bild.')
    }
    attachments.push({
      filename: `projektbild-${index + 1}.webp`,
      content: output.toString('base64'),
    })
  }
  return attachments
}
