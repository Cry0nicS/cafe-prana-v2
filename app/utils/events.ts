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

export const getEventDateIso = (value: EventDateValue) => {
  return toEventDate(value).toISOString().slice(0, 10)
}
