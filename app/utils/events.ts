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

export type EventReservation = 'required' | 'recommended' | 'walkin'

// The i18n key for an event's booking note. An event that says nothing is
// treated as "recommended", the owner's default in Studio.
export const eventReservationKey = (reservation?: EventReservation) => {
  switch (reservation) {
    case 'required':
      return 'event.reservationRequired'
    case 'walkin':
      return 'event.noBookingNeeded'
    default:
      return 'event.reservationRecommended'
  }
}

// The pieces of an event's date that the listing sets separately: a large day
// numeral with the weekday above and the month and short year below. Read in
// UTC because an event's `date` is a calendar day (`2026-02-22`), which parses
// to UTC midnight - local time would move it to the 21st west of Greenwich.
export const eventDateParts = (event: EventLike, locale = 'en') => {
  const date = toEventDate(event.date)
  const tag = locale === 'de' ? 'de-DE' : 'en-GB'
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(tag, { timeZone: 'UTC', ...options }).format(date).replace('.', '')

  return {
    day: date.getUTCDate(),
    weekday: part({ weekday: 'short' }),
    month: part({ month: 'short' }),
    year: String(date.getUTCFullYear()).slice(2)
  }
}

// The date as the event page's heading sets it: "Sunday, 22 February 2026".
// In UTC for the same reason as `eventDateParts`.
export const formatEventDateLong = (event: EventLike, locale = 'en') => {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(toEventDate(event.date))
}

// The `sizes` for an event's poster where it is shown on its own: the event
// page's figure and the homepage's next-event hero. They must stay identical.
// `ipxStatic` only bakes the image variants that were rendered during
// prerender, and every event page renders this one - so whichever event
// becomes "next" after a date rollover still has its homepage variants.
export const EVENT_POSTER_SIZES = 'sm:256px md:320px'
