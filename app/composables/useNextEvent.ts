import { nextUpcomingEvent } from '~/utils/events'

// The soonest upcoming event in the current locale, or `null` when nothing is
// coming up. Mirrors the events listing: the query returns the locale's events
// and "upcoming" is decided by the shared helper against the visitor's clock,
// in a computed rather than in `transform`, so a prerendered page re-evaluates
// on hydration instead of freezing the build-time answer into the payload.
export const useNextEvent = async () => {
  const { locale } = useI18n()

  // A reactive key rather than `watch: [locale]`: a locale switch then lands
  // in its own cache entry instead of overwriting the previous locale's.
  const { data: events, ...rest } = await useAsyncData(
    () => `next-event-${locale.value}`,
    () => queryCollection('events')
      .where('locale', '=', locale.value)
      .order('date', 'ASC')
      // Only what the poster reads. Without this every event's rendered body
      // would travel in the homepage payload.
      .select('stem', 'title', 'description', 'date', 'time', 'image', 'paid', 'price')
      .all(),
    { default: () => [] }
  )

  return {
    ...rest,
    data: computed(() => nextUpcomingEvent(events.value))
  }
}
