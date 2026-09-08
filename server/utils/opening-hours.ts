import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import { toOpeningHours } from '#shared/utils/opening-hours'
import type { OpeningHours } from '#shared/utils/opening-hours'

// The same file the homepage renders, read from the content database at
// request time so the API enforces exactly what the form offers. A missing
// document is a content problem and fails the request loudly, rather than
// quietly making every date unbookable.
export const getOpeningHours = async (event: H3Event): Promise<OpeningHours> => {
  const document = await queryCollection(event, 'openingHours').first()

  if (!document) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Opening hours are not configured'
    })
  }

  return toOpeningHours(document)
}
