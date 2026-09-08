import { toOpeningHours } from '#shared/utils/opening-hours'
import type { OpeningHours } from '#shared/utils/opening-hours'

const EMPTY: OpeningHours = toOpeningHours({ hours: [] })

// Shared between app.vue (structured data), the Directions block and the
// reservation form. The key is locale-independent on purpose: the hours are
// the same in every language.
export const useOpeningHours = () => useAsyncData(
  'opening-hours',
  () => queryCollection('openingHours').first(),
  {
    transform: (document): OpeningHours => document ? toOpeningHours(document) : EMPTY,
    default: () => EMPTY
  }
)
