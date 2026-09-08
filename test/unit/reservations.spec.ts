import { describe, expect, it } from 'vitest'
import { WEEKDAYS, toMinutes } from '#shared/utils/calendar'
import {
  BOOKING_WINDOWS,
  CLOSED_DATES,
  CLOSED_WEEKDAYS,
  bookingWindowOn,
  isClosedDateIn,
  isClosedOn,
  reservationSlotsOn,
  validateReservationSlot
} from '#shared/utils/reservations'
import { ReservationSchema } from '#shared/utils/schemas'

const saturday = { year: 2026, month: 8, day: 8 }
const monday = { year: 2026, month: 8, day: 10 }
const tuesday = { year: 2026, month: 8, day: 11 }

describe('booking configuration', () => {
  // The closed list and the windows are authored by hand in two places. If they
  // disagree, a day either silently stops taking bookings or starts taking them
  // on a day the cafe is shut.
  it('gives every weekday either a window or a closure, never both', () => {
    for (const day of WEEKDAYS) {
      const closed = CLOSED_WEEKDAYS.includes(day)

      expect(Boolean(BOOKING_WINDOWS[day]), `${day} window vs closure`).toBe(!closed)
    }
  })

  it('keeps every window on the slot grid and the right way round', () => {
    for (const [day, window] of Object.entries(BOOKING_WINDOWS)) {
      expect(window!.from, `${day} from`).toMatch(/^\d{2}:(00|15|30|45)$/)
      expect(window!.to, `${day} to`).toMatch(/^\d{2}:(00|15|30|45)$/)
      expect(toMinutes(window!.to), `${day} range`).toBeGreaterThan(toMinutes(window!.from))
    }
  })

  it('keeps one-off closures written as YYYY-MM-DD', () => {
    for (const date of CLOSED_DATES) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('reservation slots', () => {
  it('offers 15-minute slots across the whole window', () => {
    const slots = reservationSlotsOn(saturday)
    const window = BOOKING_WINDOWS.saturday!

    expect(slots[0]).toBe(window.from)
    expect(slots.at(-1)).toBe(window.to)
    expect(slots.slice(0, 3)).toEqual(['09:00', '09:15', '09:30'])
  })

  it('reaches past the hours the site displays, so an evening event is bookable', () => {
    // The cafe closes at 15:00 on a Friday; the dinner events start at 18:30.
    expect(reservationSlotsOn({ year: 2026, month: 8, day: 14 })).toContain('18:30')
  })

  it('offers no slots on a closed weekday', () => {
    expect(isClosedOn(monday)).toBe(true)
    expect(bookingWindowOn(monday)).toBeUndefined()
    expect(reservationSlotsOn(monday)).toEqual([])
  })

  it('offers no slots on a one-off closure', () => {
    expect(isClosedDateIn(['2026-08-08'], saturday)).toBe(true)
    expect(isClosedDateIn(['2026-08-08'], tuesday)).toBe(false)
    // Nothing is declared closed today, so an open weekday stays open.
    expect(isClosedOn(saturday)).toBe(false)
  })

  it('flags a closed day on the date and an unoffered time on the time', () => {
    expect(validateReservationSlot(monday, { hour: 12, minute: 0 }))
      .toEqual({ path: 'date', message: 'reservations.form.errors.date.closed' })
    expect(validateReservationSlot(saturday, { hour: 8, minute: 0 }))
      .toEqual({ path: 'time', message: 'reservations.form.errors.time.unavailable' })
    expect(validateReservationSlot(saturday, { hour: 21, minute: 15 }))
      .toEqual({ path: 'time', message: 'reservations.form.errors.time.unavailable' })
    expect(validateReservationSlot(saturday, { hour: 12, minute: 30 })).toBeNull()
  })

  // The form can only submit what it offers, so every slot has to survive the
  // shared schema, or a guest would be stuck with an error they cannot fix.
  it.each(reservationSlotsOn(saturday))('slot %j passes the schema', (time) => {
    expect(ReservationSchema.shape.time.safeParse(time).success).toBe(true)
  })
})
