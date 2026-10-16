type EventDateValue = string | Date

export type EventLike = {
  date: EventDateValue
  time?: string
}

const getDateFormatter = (locale = 'en') =>
  new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

export const toEventDate = (value: EventDateValue) => {
  return value instanceof Date ? value : new Date(value)
}

export const getEventTime = (event: EventLike, fallback = 'Time to be announced') => {
  return event.time || fallback
}

export const formatEventDate = (event: EventLike, locale = 'en') => {
  return getDateFormatter(locale).format(toEventDate(event.date))
}

export const formatEventPrice = (amount: number, locale = 'en') => {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount)
}

export const isUpcomingEvent = (event: EventLike, now = new Date()) => {
  const today = new Date(now)

  today.setHours(0, 0, 0, 0)

  return toEventDate(event.date) >= today
}

export const compareEventsAsc = (a: EventLike, b: EventLike) => {
  return toEventDate(a.date).getTime() - toEventDate(b.date).getTime()
}

export const compareEventsDesc = (a: EventLike, b: EventLike) => {
  return toEventDate(b.date).getTime() - toEventDate(a.date).getTime()
}

type IdentifiedEvent = EventLike & { path?: string, title?: string }

// Same-day events are ordered by slug, falling back to title, so the pick does
// not depend on the order the query returned and both locales agree on it.
// `time` is deliberately not used: it is free text ("11:00-13:00", "Thursdays
// at 17:00 ..."), so comparing it would be alphabetical, not chronological.
const compareNextEvent = (a: IdentifiedEvent, b: IdentifiedEvent) => {
  return compareEventsAsc(a, b)
    || (eventSlug(a.path) || a.title || '').localeCompare(eventSlug(b.path) || b.title || '')
}

// The soonest event that is still to come, or `null`. "Upcoming" is decided by
// `isUpcomingEvent`, the same helper the events listing uses, so the homepage
// hero and `/events` cannot disagree about it.
export const nextUpcomingEvent = <T extends IdentifiedEvent>(events: T[], now = new Date()): T | null => {
  return events
    .filter(event => isUpcomingEvent(event, now))
    .sort(compareNextEvent)[0] ?? null
}

export const getEventDateIso = (value: EventDateValue) => {
  return toEventDate(value).toISOString().slice(0, 10)
}

// The last segment of an event's content `path`, which under the
// locale-prefixed tree is already its public URL (`/events/<slug>` or
// `/de/events/<slug>`). Not the `stem`: Studio names files with an ordering
// prefix (`1.foo.md`), which Nuxt Content strips from `path` and keeps in
// `stem`, so a stem-built link 404s.
export const eventSlug = (path?: string) => {
  return String(path ?? '').split('/').filter(Boolean).pop() ?? ''
}
