import { describe, expect, it } from 'vitest'
import type { OpeningHours } from '#shared/utils/opening-hours'
import { reservationSlotsOn, validateReservationSlot } from '#shared/utils/reservations'
import { ReservationSchema } from '#shared/utils/schemas'
import { testOpeningHours } from '../utils/opening-hours'

const saturday = { year: 2026, month: 8, day: 8 }
const monday = { year: 2026, month: 8, day: 10 }
const tuesday = { year: 2026, month: 8, day: 11 }
const openedMonday = { year: 2026, month: 8, day: 17 }

const closedIssue = { path: 'date', message: 'reservations.form.errors.date.closed' }
const unavailableIssue = { path: 'time', message: 'reservations.form.errors.time.unavailable' }

const withExceptions = (reservationExceptions: OpeningHours['reservationExceptions']): OpeningHours =>
  ({ ...testOpeningHours, reservationExceptions })

describe('reservation slots from the weekday hours', () => {
  it('offers 15-minute slots from opening until the margin before closing', () => {
    const slots = reservationSlotsOn(testOpeningHours, saturday)

    expect(slots[0]).toBe('09:00')
    expect(slots.at(-1)).toBe('16:00')
    expect(slots).toHaveLength(29)
    expect(slots.slice(0, 3)).toEqual(['09:00', '09:15', '09:30'])
  })

  it('offers no slots on a closed weekday', () => {
    expect(reservationSlotsOn(testOpeningHours, monday)).toEqual([])
  })

  it('follows the margin the owner sets', () => {
    expect(reservationSlotsOn({ ...testOpeningHours, lastReservationBeforeClosing: 0 }, saturday).at(-1)).toBe('17:00')
    expect(reservationSlotsOn({ ...testOpeningHours, lastReservationBeforeClosing: 120 }, saturday).at(-1)).toBe('15:00')
  })

  it('keeps the slots on the grid when the margin is not a multiple of 15', () => {
    const slots = reservationSlotsOn({ ...testOpeningHours, lastReservationBeforeClosing: 50 }, saturday)

    expect(slots.at(-1)).toBe('16:00')
    expect(slots.every(slot => Number(slot.slice(3)) % 15 === 0)).toBe(true)
  })

  it('offers nothing when the margin swallows the whole day', () => {
    expect(reservationSlotsOn({ ...testOpeningHours, lastReservationBeforeClosing: 600 }, saturday)).toEqual([])
  })

  it('flags a closed day on the date and an off-hours time on the time', () => {
    expect(validateReservationSlot(testOpeningHours, monday, { hour: 12, minute: 0 })).toEqual(closedIssue)
    expect(validateReservationSlot(testOpeningHours, saturday, { hour: 8, minute: 0 })).toEqual(unavailableIssue)
    expect(validateReservationSlot(testOpeningHours, saturday, { hour: 16, minute: 15 })).toEqual(unavailableIssue)
    expect(validateReservationSlot(testOpeningHours, saturday, { hour: 12, minute: 30 })).toBeNull()
  })
})

describe('reservation exceptions', () => {
  it('opens a closed weekday for exactly the window the owner set', () => {
    const slots = reservationSlotsOn(testOpeningHours, openedMonday)

    expect(slots[0]).toBe('17:00')
    expect(slots.at(-1)).toBe('20:00')
    expect(slots).toHaveLength(13)
    expect(validateReservationSlot(testOpeningHours, openedMonday, { hour: 18, minute: 30 })).toBeNull()
  })

  // The margin is for the counter closing; an exception says when guests may
  // book, so its last slot is the time written down, not an hour earlier.
  it('does not apply the closing margin to an exception window', () => {
    expect(reservationSlotsOn(testOpeningHours, openedMonday)).toContain('20:00')
    expect(validateReservationSlot(testOpeningHours, openedMonday, { hour: 20, minute: 0 })).toBeNull()
    expect(validateReservationSlot(testOpeningHours, openedMonday, { hour: 20, minute: 15 })).toEqual(unavailableIssue)
  })

  it('replaces an open weekday\'s hours rather than merging with them', () => {
    const openingHours = withExceptions([{ date: '2026-08-08', bookableFrom: '10:00', bookableUntil: '12:00' }])

    expect(reservationSlotsOn(openingHours, saturday)).toEqual([
      '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00'
    ])
    expect(validateReservationSlot(openingHours, saturday, { hour: 9, minute: 0 })).toEqual(unavailableIssue)
    expect(validateReservationSlot(openingHours, saturday, { hour: 16, minute: 0 })).toEqual(unavailableIssue)
  })

  it('closes an open weekday and reports the date, not the time', () => {
    expect(reservationSlotsOn(testOpeningHours, tuesday)).toEqual([])
    expect(validateReservationSlot(testOpeningHours, tuesday, { hour: 12, minute: 0 })).toEqual(closedIssue)
  })

  it('takes a closed flag over a window written on the same row', () => {
    const openingHours = withExceptions([{ date: '2026-08-08', closed: true, bookableFrom: '10:00', bookableUntil: '12:00' }])

    expect(reservationSlotsOn(openingHours, saturday)).toEqual([])
  })

  it('treats a row without a usable window as closed rather than inventing hours', () => {
    expect(reservationSlotsOn(withExceptions([{ date: '2026-08-08' }]), saturday)).toEqual([])
    expect(reservationSlotsOn(withExceptions([{ date: '2026-08-08', bookableFrom: '10:00' }]), saturday)).toEqual([])
    expect(reservationSlotsOn(withExceptions([{ date: '2026-08-08', bookableFrom: '12:00', bookableUntil: '10:00' }]), saturday)).toEqual([])
  })

  it('lets the first of two rows for the same date win', () => {
    const rows = [
      { date: '2026-08-17', bookableFrom: '17:00', bookableUntil: '18:00' },
      { date: '2026-08-17', closed: true }
    ]

    expect(reservationSlotsOn(withExceptions(rows), openedMonday)).toEqual(['17:00', '17:15', '17:30', '17:45', '18:00'])
    expect(reservationSlotsOn(withExceptions(rows.slice().reverse()), openedMonday)).toEqual([])
  })

  it('leaves every other date to the weekday hours', () => {
    expect(reservationSlotsOn(testOpeningHours, saturday)).toHaveLength(29)
    expect(reservationSlotsOn(testOpeningHours, { year: 2026, month: 8, day: 24 })).toEqual([])
  })

  it('behaves like the plain weekday hours with an empty or absent list', () => {
    for (const openingHours of [withExceptions([]), withExceptions(undefined)]) {
      expect(reservationSlotsOn(openingHours, saturday)).toHaveLength(29)
      expect(reservationSlotsOn(openingHours, monday)).toEqual([])
      expect(reservationSlotsOn(openingHours, tuesday)).toHaveLength(31)
    }
  })
})

// The form can only submit what it offers, so every slot has to survive the
// shared schema, or a guest would be stuck with an error they cannot fix.
describe('offered slots and the reservation schema', () => {
  it.each([
    ...reservationSlotsOn(testOpeningHours, saturday),
    ...reservationSlotsOn(testOpeningHours, openedMonday)
  ])('slot %j passes the schema', (time) => {
    expect(ReservationSchema.shape.time.safeParse(time).success).toBe(true)
  })
})
