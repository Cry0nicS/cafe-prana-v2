import type { OpeningHoursEntry } from '#shared/utils/opening-hours'

// Shared between app.vue (structured data) and the Directions block. The key is
// locale-independent on purpose: the hours are the same in every language.
export const useOpeningHours = () => useAsyncData(
  'opening-hours',
  () => queryCollection('openingHours').first(),
  {
    transform: document => (document?.hours ?? []) as OpeningHoursEntry[],
    default: () => [] as OpeningHoursEntry[]
  }
)
