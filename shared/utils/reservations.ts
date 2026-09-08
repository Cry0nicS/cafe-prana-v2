// When the cafe takes reservations, and for which times.
//
// Deliberately not derived from `content/opening-hours.yml`. The opening hours
// are what the cafe is normally open to walk-ins, and events regularly fall
// outside them - a dinner starting at 18:30 on a day the counter closes at
// 15:00. While the booking form followed the opening hours, those guests had
// no slot to pick, so the two are now separate: the content file says what the
// site displays, this file says what can be booked.
//
// The trade-off is that these values are not editable from Studio. That is the
// point - they change roughly once a year, and a wrong booking window is worse
// than a small developer task. When the cafe's closing day changes, it has to
// be changed in BOTH places: here, and in the content file that displays it.
import { slotRange, toDateKey, toLabel, toMinutes, weekdayOf } from './calendar'
import type { DateParts, TimeParts, Weekday } from './calendar'

// `from` is the first bookable slot and `to` the last one - both inclusive,
// both on the `SLOT_MINUTES` grid.
export type BookingWindow = { from: string, to: string }

// The weekdays the cafe never takes a booking on. This list is the switch: to
// add a second weekly closing day, add it here and drop that day's entry from
// `BOOKING_WINDOWS` below.
export const CLOSED_WEEKDAYS: readonly Weekday[] = ['monday']

// One-off closures - a public holiday, a vacation week, a private event. Berlin
// dates as `YYYY-MM-DD`, e.g. '2026-12-24'. Entries in the past are harmless
// (the form cannot offer a past date anyway) but worth clearing out when this
// file is next touched.
export const CLOSED_DATES: readonly string[] = []

// The bookable range per open weekday. Wider than the opening hours on purpose,
// so an evening event can be booked; a weekday that is closed has no entry.
export const BOOKING_WINDOWS: Partial<Record<Weekday, BookingWindow>> = {
  tuesday: { from: '07:00', to: '18:00' },
  wednesday: { from: '07:00', to: '18:00' },
  thursday: { from: '07:00', to: '21:00' },
  friday: { from: '07:00', to: '21:00' },
  saturday: { from: '09:00', to: '21:00' },
  sunday: { from: '09:00', to: '18:00' }
}

// Exported so the one-off-closure mechanism can be tested against arbitrary
// dates while `CLOSED_DATES` stays empty until the cafe actually declares one.
export const isClosedDateIn = (closedDates: readonly string[], date: DateParts) =>
  closedDates.includes(toDateKey(date))

export const isClosedOn = (date: DateParts) =>
  CLOSED_WEEKDAYS.includes(weekdayOf(date)) || isClosedDateIn(CLOSED_DATES, date)

// The window in force on a date, or `undefined` when nothing can be booked -
// the day is closed, or its weekday has no window configured.
export const bookingWindowOn = (date: DateParts) =>
  isClosedOn(date) ? undefined : BOOKING_WINDOWS[weekdayOf(date)]

// The slots the form offers on a given date. Empty when the cafe is closed.
export const reservationSlotsOn = (date: DateParts) => {
  const window = bookingWindowOn(date)

  return window ? slotRange(toMinutes(window.from), toMinutes(window.to)) : []
}

export type ReservationSlotIssue = { path: 'date' | 'time', message: string }

// Checks a date and time against the booking configuration. The message is an
// i18n key the form translates and the API passes through, like the schema
// messages.
export const validateReservationSlot = (
  date: DateParts,
  time: TimeParts
): ReservationSlotIssue | null => {
  const slots = reservationSlotsOn(date)

  if (slots.length === 0) {
    return { path: 'date', message: 'reservations.form.errors.date.closed' }
  }

  if (!slots.includes(toLabel(time.hour * 60 + time.minute))) {
    return { path: 'time', message: 'reservations.form.errors.time.unavailable' }
  }

  return null
}
