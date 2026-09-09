// Decides whether a published event can be booked at its start time, given the
// opening hours document. Split out of `check-event-bookability.ts` so the
// decision is unit-testable: this module owns the reading of an event's
// free-form fields and the verdict, the script owns the filesystem and the
// reporting.
//
// The rules are the reservation form's own (`shared/utils/reservations.ts`), so
// "bookable" here means exactly that a guest could pick the slot.
//
// Where the event's own fields do not say when it starts, the verdict is
// `unchecked` rather than a guess: the `time` field is free text, and a wrong
// green is worse than an honest gap.
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

const TIME = /(?<!\d)(\d{1,2}):(\d{2})(?!\d)/g

// A range: the first time is the start, the second the end. Covers the dash
// forms the content uses and the words either language writes them with.
const RANGE = /(?<!\d)\d{1,2}:\d{2}\s*(?:[-–—]|to|till|until|bis)\s*\d{1,2}:\d{2}(?!\d)/i

// A time field describing a repeating event. Only the document's own date can
// be checked, so the other sessions would be waved through unexamined - the
// plural weekday ("Thursdays", "Donnerstags") is what gives that away.
const RECURRING = new RegExp(
  '\\b(?:mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)\\b'
  + '|\\b(?:montags|dienstags|mittwochs|donnerstags|freitags|samstags|sonntags)\\b'
  + '|\\b(?:weekly|fortnightly|monthly|every|each)\\b'
  + '|\\b(?:woechentlich|wöchentlich|monatlich|jeden|jede|jeweils)\\b',
  'i'
)

export const looksRecurring = (time: string | undefined) => Boolean(time && RECURRING.test(time))

// Every valid `HH:MM` in the field, in the order written.
export const timesIn = (time: string | undefined): TimeParts[] =>
  [...(time ?? '').matchAll(TIME)]
    .map(match => ({ hour: Number(match[1]), minute: Number(match[2]) }))
    .filter(parts => parts.hour <= 23 && parts.minute <= 59)

export type StartTimeReading = { time: TimeParts } | { problem: 'none' | 'ambiguous' }

// The event's start time. One time is the start; two in a range are a start
// and an end. Anything else - "Einlass 17:30, Beginn 18:30" - names several
// moments without saying which begins the event, and guessing the first would
// pass or fail the event for the wrong reason.
export const readStartTime = (time: string | undefined): StartTimeReading => {
  const times = timesIn(time)

  if (times.length === 0) {
    return { problem: 'none' }
  }

  if (times.length === 1 || RANGE.test(time ?? '')) {
    return { time: times[0]! }
  }

  return { problem: 'ambiguous' }
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

// Today as the cafe counts it. `en-CA` formats as `YYYY-MM-DD`, so these keys
// compare as strings.
//
// Deliberately not the events page's `isUpcomingEvent`: that truncates to the
// *visitor's* midnight, which is what a browser wants and what makes a check
// disagree with itself between a developer's machine and a UTC CI runner. An
// event on today's date counts as upcoming, exactly as the page treats it.
const BERLIN_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

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

  const key = toDateKey(date)

  if (key < BERLIN_DAY.format(now)) {
    return verdict('skipped', `in the past (${key})`)
  }

  if (looksRecurring(event.time)) {
    return verdict(
      'unchecked',
      `${JSON.stringify(event.time)} describes a repeating event, and only ${key} is written down, `
      + 'so the other sessions cannot be checked'
    )
  }

  const reading = readStartTime(event.time)

  if ('problem' in reading) {
    return verdict(
      'unchecked',
      reading.problem === 'none'
        ? `no HH:MM start time found in ${JSON.stringify(event.time ?? '')}`
        : `${JSON.stringify(event.time)} names several times without saying which one the event starts at`
    )
  }

  const time = reading.time
  const issue = validateReservationSlot(openingHours, date, time)

  if (!issue) {
    return verdict('bookable', `${event.time} on ${describeDate(date)}`)
  }

  const slots = reservationSlotsOn(openingHours, date)

  if (slots.length === 0) {
    return verdict('unbookable', `the cafe takes no bookings on ${describeDate(date)}`)
  }

  return verdict(
    'unbookable',
    `${toLabel(time.hour * 60 + time.minute)} is not a bookable slot on ${describeDate(date)}; `
    + `bookings run ${slots[0]} to ${slots.at(-1)}`
  )
}
