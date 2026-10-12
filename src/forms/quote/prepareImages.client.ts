import { MAX_IMAGE_BYTES, MAX_IMAGES, imageTypes } from './shared'

export async function prepareBrowserImages(files: File[]) {
  if (files.length > MAX_IMAGES) throw new Error(`Välj högst ${MAX_IMAGES} bilder.`)
  const prepared: File[] = []
  for (const file of files) {
    if (!imageTypes.includes(file.type) || file.size > 20 * 1024 * 1024)
      throw new Error('Välj JPG, PNG eller WebP. Originalbilden får vara högst 20 MB.')
    let bitmap: ImageBitmap | undefined
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Image canvas unavailable')
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      let blob: Blob | null = null
      for (const quality of [0.82, 0.7, 0.55]) {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/webp', quality),
        )
        if (blob && blob.size <= MAX_IMAGE_BYTES) break
      }
      if (!blob || blob.size > MAX_IMAGE_BYTES || blob.type !== 'image/webp')
        throw new Error('Image too large')
      prepared.push(
        new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' }),
      )
    } catch {
      throw new Error(
        `Bilden ”${file.name}” kunde inte förberedas. Välj en annan JPG-, PNG- eller WebP-bild.`,
      )
    } finally {
      bitmap?.close()
    }
  }
  return prepared
}
