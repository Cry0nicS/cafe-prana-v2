// Weekday, date and 15-minute-grid primitives.
//
// The hours the site displays and the windows it takes bookings in are
// deliberately independent of one another - an event can run outside opening
// hours, and a guest still has to be able to book a slot for it. So the pieces
// both of them need live here, rather than in `opening-hours.ts` (display) or
// `reservations.ts` (booking), and neither of those two imports the other.

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const

export type Weekday = typeof WEEKDAYS[number]

export type DateParts = { year: number, month: number, day: number }
export type TimeParts = { hour: number, minute: number }

// Every time on the site sits on this grid: the opening and closing times in
// the content file, the booking windows in code, and the slots offered to
// guests.
export const SLOT_MINUTES = 15

export const toMinutes = (value: string) => {
  const [hours = 0, minutes = 0] = value.split(':').map(Number)

  return hours * 60 + minutes
}

export const toLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

// Inclusive of both ends, so a range's `to` is a real, bookable time rather
// than the moment after the last one.
export const slotRange = (fromMinutes: number, toMinutes: number) => {
  const slots: string[] = []

  for (let minutes = fromMinutes; minutes <= toMinutes; minutes += SLOT_MINUTES) {
    slots.push(toLabel(minutes))
  }

  return slots
}

// 2024-01-01 was a Monday. Formatting a fixed week in UTC gives the localized
// weekday names without depending on the visitor's clock or time zone.
const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1)
const DAY_MS = 24 * 60 * 60 * 1000

export const weekdayLabel = (day: Weekday, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(REFERENCE_MONDAY_UTC + WEEKDAYS.indexOf(day) * DAY_MS))

export const weekdayOf = (date: DateParts): Weekday =>
  WEEKDAYS[(new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7]!

// `YYYY-MM-DD`, which is both what a date input hands over and how one-off
// closures are written down.
export const toDateKey = (date: DateParts) =>
  `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
