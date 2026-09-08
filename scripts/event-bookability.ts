// Decides whether a published event can be booked at its start time, given the
// opening hours document. Split out of `check-event-bookability.ts` so the
// decision is unit-testable: this module owns the reading of an event's
// free-form fields and the verdict, the script owns the filesystem and the
// reporting.
//
// The rules are the reservation form's own (`shared/utils/reservations.ts`), so
// "bookable" here means exactly that a guest could pick the slot.
import { isUpcomingEvent } from '../app/utils/events'
import { toDateKey, toLabel, weekdayOf } from '../shared/utils/calendar'
import type { DateParts, TimeParts } from '../shared/utils/calendar'
import type { OpeningHours } from '../shared/utils/opening-hours'
import { reservationSlotsOn, validateReservationSlot } from '../shared/utils/reservations'

// The frontmatter of an event file, as far as the check needs it. `time` is
// free text in this repo - "18:00", "11:00-13:00", "Thursdays at 17:00 (...)".
export type EventFrontmatter = {
  path: string
  title?: string
  date: string | Date
  time?: string
  reservation?: string
}

export type EventCheckStatus = 'bookable' | 'unbookable' | 'unchecked' | 'skipped'

export type EventCheck = {
  path: string
  title: string
  status: EventCheckStatus
  detail: string
}

const TIME = /(?<!\d)(\d{1,2}):(\d{2})(?!\d)/

// The first `HH:MM` in the time field, or null when there is none to read.
export const firstTimeIn = (time: string | undefined): TimeParts | null => {
  const match = time?.match(TIME)

  if (!match) {
    return null
  }

  const hour = Number(match[1])
  const minute = Number(match[2])

  return hour <= 23 && minute <= 59 ? { hour, minute } : null
}

const DATE = /^(\d{4})-(\d{2})-(\d{2})/

// The event's calendar date. A YAML parser may hand over either the string
// from the file or a Date at UTC midnight; both name the same Berlin day.
const eventDateParts = (date: string | Date): DateParts | null => {
  if (date instanceof Date) {
    return Number.isNaN(date.getTime())
      ? null
      : { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
  }

  const match = date.trim().match(DATE)

  return match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null
}

const describeDate = (date: DateParts) => `${toDateKey(date)} (a ${weekdayOf(date)})`

export const checkEventBookability = (event: EventFrontmatter, openingHours: OpeningHours, now: Date): EventCheck => {
  const title = event.title ?? event.path
  const verdict = (status: EventCheckStatus, detail: string): EventCheck => ({ path: event.path, title, status, detail })

  if (event.reservation === 'walkin') {
    return verdict('skipped', 'walk-in event, no booking needed')
  }

  const date = eventDateParts(event.date)

  if (!date) {
    return verdict('unchecked', `cannot read the date ${JSON.stringify(event.date)}`)
  }

  if (!isUpcomingEvent({ date: toDateKey(date) }, now)) {
    return verdict('skipped', `in the past (${toDateKey(date)})`)
  }

  const time = firstTimeIn(event.time)

  if (!time) {
    return verdict('unchecked', `no HH:MM start time found in ${JSON.stringify(event.time ?? '')}`)
  }

  const issue = validateReservationSlot(openingHours, date, time)

  if (!issue) {
    return verdict('bookable', `${event.time} on ${describeDate(date)}`)
  }

  if (issue.path === 'date') {
    return verdict('unbookable', `the cafe takes no bookings on ${describeDate(date)}`)
  }

  const slots = reservationSlotsOn(openingHours, date)
  const start = toLabel(time.hour * 60 + time.minute)

  return verdict(
    'unbookable',
    `${start} is not a bookable slot on ${describeDate(date)}; bookings run ${slots[0]} to ${slots.at(-1)}`
  )
}
