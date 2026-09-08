import type { OpeningHours } from '#shared/utils/opening-hours'

const EMPTY: OpeningHours = { hours: [] }

// Shared between app.vue (structured data) and the Directions block. The key is
// locale-independent on purpose: the hours are the same in every language. The
// reservation form deliberately does not read this - see
// `shared/utils/reservations.ts`.
export const useOpeningHours = () => useAsyncData(
  'opening-hours',
  () => queryCollection('openingHours').first(),
  {
    transform: (document): OpeningHours => document ? { hours: document.hours } : EMPTY,
    default: () => EMPTY
  }
)
