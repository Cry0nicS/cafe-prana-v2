type EventDateValue = string | Date

export type EventLike = {
  startDate: EventDateValue
  endDate?: EventDateValue
  time?: string
  category?: string
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

export const toEventDate = (value: EventDateValue) => {
  return value instanceof Date ? value : new Date(value)
}

export const getEventTime = (event: EventLike) => {
  return event.time || 'Time to be announced'
}

export const formatEventDate = (event: EventLike) => {
  const start = toEventDate(event.startDate)

  if (!event.endDate) {
    return dateFormatter.format(start)
  }

  const end = toEventDate(event.endDate)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return dateFormatter.format(start)
  }

  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`
}

export const isUpcomingEvent = (event: EventLike, now = new Date()) => {
  const comparisonDate = event.endDate ? toEventDate(event.endDate) : toEventDate(event.startDate)
  const today = new Date(now)

  today.setHours(0, 0, 0, 0)

  return comparisonDate >= today
}

export const compareEventsAsc = (a: EventLike, b: EventLike) => {
  return toEventDate(a.startDate).getTime() - toEventDate(b.startDate).getTime()
}

export const compareEventsDesc = (a: EventLike, b: EventLike) => {
  return toEventDate(b.startDate).getTime() - toEventDate(a.startDate).getTime()
}

export const getEventCategoryLabel = (category?: string) => {
  const labels: Record<string, string> = {
    breakfast: 'Breakfast',
    brunch: 'Brunch',
    dinner: 'Dinner',
    workshop: 'Workshop',
    community: 'Community',
    seasonal: 'Seasonal'
  }

  return category ? labels[category] || category : 'Event'
}

export const getEventDateIso = (value: EventDateValue) => {
  return toEventDate(value).toISOString().slice(0, 10)
}
