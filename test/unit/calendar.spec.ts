import { describe, expect, it } from 'vitest'
import { SLOT_MINUTES, slotRange, toDateKey, toLabel, toMinutes, weekdayLabel, weekdayOf } from '#shared/utils/calendar'

describe('calendar primitives', () => {
  it('knows the weekday of a date', () => {
    expect(weekdayOf({ year: 2026, month: 8, day: 8 })).toBe('saturday')
    expect(weekdayOf({ year: 2026, month: 8, day: 10 })).toBe('monday')
    expect(weekdayOf({ year: 2024, month: 2, day: 29 })).toBe('thursday')
  })

  it('labels weekdays in the visitor language', () => {
    expect(weekdayLabel('monday', 'en')).toBe('Monday')
    expect(weekdayLabel('monday', 'de')).toBe('Montag')
    expect(weekdayLabel('sunday', 'de')).toBe('Sonntag')
  })

  it('writes a date the way a date input and a closure list do', () => {
    expect(toDateKey({ year: 2026, month: 12, day: 24 })).toBe('2026-12-24')
    expect(toDateKey({ year: 2026, month: 1, day: 5 })).toBe('2026-01-05')
  })

  it('converts between a label and minutes', () => {
    expect(toMinutes('07:30')).toBe(450)
    expect(toLabel(450)).toBe('07:30')
    expect(toLabel(0)).toBe('00:00')
  })

  it('walks the slot grid inclusively at both ends', () => {
    expect(slotRange(toMinutes('09:00'), toMinutes('10:00')))
      .toEqual(['09:00', '09:15', '09:30', '09:45', '10:00'])
    expect(slotRange(toMinutes('09:00'), toMinutes('09:00'))).toEqual(['09:00'])
    expect(SLOT_MINUTES).toBe(15)
  })
})
