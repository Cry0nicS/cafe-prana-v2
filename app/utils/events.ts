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

type NamedEvent = EventLike & { title?: string }

// Same-day events are ordered by start time (an event without one goes last),
// then by title, so the pick does not depend on the order the query returned.
const compareNextEvent = (a: NamedEvent, b: NamedEvent) => {
  const byDate = compareEventsAsc(a, b)

  if (byDate) {
    return byDate
  }

  if (a.time !== b.time) {
    if (!a.time) {
      return 1
    }

    if (!b.time) {
      return -1
    }

    return a.time.localeCompare(b.time)
  }

  return (a.title ?? '').localeCompare(b.title ?? '')
}

// The soonest event that is still to come, or `null`. "Upcoming" is decided by
// `isUpcomingEvent`, the same helper the events listing uses, so the homepage
// hero and `/events` cannot disagree about it.
export const nextUpcomingEvent = <T extends NamedEvent>(events: T[], now = new Date()): T | null => {
  return events
    .filter(event => isUpcomingEvent(event, now))
    .sort(compareNextEvent)[0] ?? null
}

export const getEventDateIso = (value: EventDateValue) => {
  return toEventDate(value).toISOString().slice(0, 10)
}

// An event's URL slug is derived from its file name: `events/spring-brunch.md`
// and `events/spring-brunch.de.md` both resolve to the slug `spring-brunch`.
export const eventSlug = (stem?: string) => {
  return String(stem ?? '').replace(/^events\//, '').replace(/\.de$/, '')
}
