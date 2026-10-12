import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag, revalidatePath } from 'next/cache'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    revalidateTag('global_footer', { expire: 0 })
    revalidateTag('site-settings', { expire: 0 })
    revalidatePath('/', 'layout')
  }

  return doc
}
