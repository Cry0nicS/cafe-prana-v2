import { describe, expect, it } from 'vitest'
import { CAFE_RESERVATION_TIME, CAFE_RESERVATION_TIME_SLOTS } from '#shared/utils/constants'
import { ReservationSchema } from '#shared/utils/schemas'

describe('reservation time slots', () => {
  it('runs from opening to the last bookable time in 15-minute steps', () => {
    expect(CAFE_RESERVATION_TIME_SLOTS[0]).toBe(CAFE_RESERVATION_TIME.min)
    expect(CAFE_RESERVATION_TIME_SLOTS.at(-1)).toBe(CAFE_RESERVATION_TIME.max)
    expect(CAFE_RESERVATION_TIME_SLOTS).toHaveLength(37)
    expect(CAFE_RESERVATION_TIME_SLOTS.slice(0, 5)).toEqual(['07:00', '07:15', '07:30', '07:45', '08:00'])
  })

  // The form can only submit what it offers, so every slot has to survive the
  // server-side schema, or a guest would be stuck with an error they cannot fix.
  it.each(CAFE_RESERVATION_TIME_SLOTS)('slot %j passes the schema', (time) => {
    expect(ReservationSchema.shape.time.safeParse(time).success).toBe(true)
  })
})
