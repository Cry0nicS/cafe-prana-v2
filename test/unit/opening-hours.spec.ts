import { describe, expect, it } from 'vitest'
import {
  formatOpeningHours,
  toOpeningHoursSpecification,
  weekdayLabel,
  type OpeningHoursEntry
} from '#shared/utils/opening-hours'

const week: OpeningHoursEntry[] = [
  { day: 'monday', closed: true },
  { day: 'tuesday', opens: '07:30', closes: '16:00' },
  { day: 'wednesday', opens: '07:30', closes: '15:00' },
  { day: 'thursday', opens: '07:30', closes: '15:00' },
  { day: 'friday', opens: '07:30', closes: '15:00' },
  { day: 'saturday', opens: '09:00', closes: '17:00' },
  { day: 'sunday', opens: '09:00', closes: '17:00' }
]

describe('opening hours', () => {
  it('labels weekdays in the visitor language', () => {
    expect(weekdayLabel('monday', 'en')).toBe('Monday')
    expect(weekdayLabel('monday', 'de')).toBe('Montag')
    expect(weekdayLabel('sunday', 'de')).toBe('Sonntag')
  })

  it('formats an open day and leaves a closed day to the caller', () => {
    expect(formatOpeningHours(week[1]!)).toBe('07:30 – 16:00')
    expect(formatOpeningHours(week[0]!)).toBeNull()
    expect(formatOpeningHours({ day: 'monday', opens: '08:00' })).toBeNull()
  })

  it('groups days with identical hours into schema.org specifications', () => {
    expect(toOpeningHoursSpecification(week)).toEqual([
      { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Tuesday'], 'opens': '07:30', 'closes': '16:00' },
      { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Wednesday', 'Thursday', 'Friday'], 'opens': '07:30', 'closes': '15:00' },
      { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Saturday', 'Sunday'], 'opens': '09:00', 'closes': '17:00' }
    ])
  })

  it('omits closed days from the structured data', () => {
    expect(toOpeningHoursSpecification([{ day: 'monday', closed: true }])).toEqual([])
  })
})
