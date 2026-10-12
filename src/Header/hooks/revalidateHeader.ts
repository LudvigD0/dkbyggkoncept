import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag, revalidatePath } from 'next/cache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    revalidateTag('global_header', { expire: 0 })
    revalidateTag('site-settings', { expire: 0 })
    revalidatePath('/', 'layout')
  }

  return doc
}
