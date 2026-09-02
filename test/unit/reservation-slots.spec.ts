import { describe, expect, it } from 'vitest'
import { OPENING_TIME_OPTIONS, reservationSlotsOn, validateReservationSlot, weekdayOf } from '#shared/utils/opening-hours'
import { ReservationSchema } from '#shared/utils/schemas'
import { testOpeningHours } from '../utils/opening-hours'

const saturday = { year: 2026, month: 8, day: 8 }
const tuesday = { year: 2026, month: 8, day: 11 }
const monday = { year: 2026, month: 8, day: 10 }

describe('reservation slots', () => {
  it('knows the weekday of a date', () => {
    expect(weekdayOf(saturday)).toBe('saturday')
    expect(weekdayOf(monday)).toBe('monday')
    expect(weekdayOf({ year: 2024, month: 2, day: 29 })).toBe('thursday')
  })

  it('offers 15-minute slots from opening until an hour before closing', () => {
    const slots = reservationSlotsOn(testOpeningHours, saturday)

    expect(slots[0]).toBe('09:00')
    expect(slots.at(-1)).toBe('16:00')
    expect(slots).toHaveLength(29)
    expect(slots.slice(0, 3)).toEqual(['09:00', '09:15', '09:30'])
  })

  it('offers no slots on a closed day', () => {
    expect(reservationSlotsOn(testOpeningHours, monday)).toEqual([])
  })

  it('respects the last-reservation margin', () => {
    const slots = reservationSlotsOn({ ...testOpeningHours, lastReservationBeforeClosing: 0 }, tuesday)

    expect(slots.at(-1)).toBe('16:00')
  })

  it('flags a closed day on the date and an off-hours time on the time', () => {
    expect(validateReservationSlot(testOpeningHours, monday, { hour: 12, minute: 0 }))
      .toEqual({ path: 'date', message: 'reservations.form.errors.date.closed' })
    expect(validateReservationSlot(testOpeningHours, saturday, { hour: 8, minute: 0 }))
      .toEqual({ path: 'time', message: 'reservations.form.errors.time.unavailable' })
    expect(validateReservationSlot(testOpeningHours, saturday, { hour: 16, minute: 15 }))
      .toEqual({ path: 'time', message: 'reservations.form.errors.time.unavailable' })
    expect(validateReservationSlot(testOpeningHours, saturday, { hour: 12, minute: 30 })).toBeNull()
  })

  // The form can only submit what it offers, so every slot has to survive the
  // shared schema, or a guest would be stuck with an error they cannot fix.
  it.each(reservationSlotsOn(testOpeningHours, saturday))('slot %j passes the schema', (time) => {
    expect(ReservationSchema.shape.time.safeParse(time).success).toBe(true)
  })

  it('offers Studio the same 15-minute grid for opening and closing times', () => {
    expect(OPENING_TIME_OPTIONS[0]).toBe('06:00')
    expect(OPENING_TIME_OPTIONS.at(-1)).toBe('23:00')
    expect(OPENING_TIME_OPTIONS).toContain('07:30')
    expect(OPENING_TIME_OPTIONS.every(time => Number(time.slice(3)) % 15 === 0)).toBe(true)
  })
})
