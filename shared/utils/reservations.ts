// When the cafe takes reservations, and for which times.
//
// Pure functions over the opening hours document (`content/opening-hours.yml`),
// which the owner edits in Studio. This module holds no configuration of its
// own: the form and the `/api/reservations` route hand it the same document, so
// what is offered and what is accepted cannot drift.
//
// The rules, in order:
//   1. An exception for the date wins entirely - it is not merged with the
//      weekday. Closed means no slots whatever the weekday says; a window means
//      exactly that window, even on a weekday that is normally closed. With two
//      rows for one date, the first wins.
//   2. Otherwise the weekday entry applies: slots from opening time up to
//      `lastReservationBeforeClosing` minutes before closing, and none on a
//      closed weekday.
//
// The margin applies to the weekday hours only. They are opening times, and a
// guest should not be seated as the counter shuts. An exception is already a
// bookable range - `bookableUntil` is the last slot offered, as written.
import { slotRange, toDateKey, toLabel, toMinutes, weekdayOf } from './calendar'
import type { DateParts, TimeParts } from './calendar'
import { isOpen } from './opening-hours'
import type { OpeningHours, ReservationException } from './opening-hours'

// First and last bookable slot, both inclusive, in minutes since midnight.
type BookingWindow = { from: number, to: number }

// The exception row in force on a date, if any. The first row for a date wins,
// which is what `Array.prototype.find` gives.
export const reservationExceptionOn = (openingHours: OpeningHours, date: DateParts): ReservationException | undefined => {
  const key = toDateKey(date)

  return openingHours.reservationExceptions?.find(exception => exception.date.trim() === key)
}

// A row that is not closed but has no complete range cannot open anything: the
// owner has written down a date without saying when guests may book. Treating
// it as closed is the safe reading, and the event guard reports the event that
// needed it.
const exceptionWindow = (exception: ReservationException): BookingWindow | undefined => {
  if (exception.closed || !exception.bookableFrom || !exception.bookableUntil) {
    return undefined
  }

  return { from: toMinutes(exception.bookableFrom), to: toMinutes(exception.bookableUntil) }
}

const weekdayWindow = (openingHours: OpeningHours, date: DateParts): BookingWindow | undefined => {
  const entry = openingHours.hours.find(entry => entry.day === weekdayOf(date))

  if (!entry || !isOpen(entry)) {
    return undefined
  }

  return { from: toMinutes(entry.opens), to: toMinutes(entry.closes) - openingHours.lastReservationBeforeClosing }
}

const bookingWindowOn = (openingHours: OpeningHours, date: DateParts): BookingWindow | undefined => {
  const exception = reservationExceptionOn(openingHours, date)
  const window = exception ? exceptionWindow(exception) : weekdayWindow(openingHours, date)

  return window && window.to >= window.from ? window : undefined
}

// The slots the form offers on a given date. Empty when nothing can be booked.
export const reservationSlotsOn = (openingHours: OpeningHours, date: DateParts) => {
  const window = bookingWindowOn(openingHours, date)

  return window ? slotRange(window.from, window.to) : []
}

export type ReservationSlotIssue = { path: 'date' | 'time', message: string }

// Checks a date and time against the opening hours. The message is an i18n key
// the form translates and the API passes through, like the schema messages;
// the path says whether the guest has to change the date or pick another slot.
export const validateReservationSlot = (
  openingHours: OpeningHours,
  date: DateParts,
  time: TimeParts
): ReservationSlotIssue | null => {
  const slots = reservationSlotsOn(openingHours, date)

  if (slots.length === 0) {
    return { path: 'date', message: 'reservations.form.errors.date.closed' }
  }

  if (!slots.includes(toLabel(time.hour * 60 + time.minute))) {
    return { path: 'time', message: 'reservations.form.errors.time.unavailable' }
  }

  return null
}
