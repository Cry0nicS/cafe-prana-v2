import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LAST_RESERVATION_BEFORE_CLOSING,
  MAX_LAST_RESERVATION_BEFORE_CLOSING,
  OPENING_TIME_OPTIONS,
  formatOpeningHours,
  toOpeningHours,
  toOpeningHoursSpecification,
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
  it('offers Studio the same 15-minute grid for opening and closing times', () => {
    expect(OPENING_TIME_OPTIONS[0]).toBe('06:00')
    expect(OPENING_TIME_OPTIONS.at(-1)).toBe('23:00')
    expect(OPENING_TIME_OPTIONS).toContain('07:30')
    expect(OPENING_TIME_OPTIONS.every(time => Number(time.slice(3)) % 15 === 0)).toBe(true)
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

// The schema in `content.config.ts` types the columns but is never run against
// the stored content, so whatever a hand edit or a half-saved Studio row wrote
// arrives here as it is. This is the only place that decides what it means.
describe('reading the opening hours document', () => {
  it('fills in the defaults a document does not mention', () => {
    expect(toOpeningHours({ hours: week })).toEqual({
      hours: week,
      lastReservationBeforeClosing: DEFAULT_LAST_RESERVATION_BEFORE_CLOSING,
      reservationExceptions: []
    })
  })

  it('keeps a margin the owner set', () => {
    expect(toOpeningHours({ hours: week, lastReservationBeforeClosing: 0 }).lastReservationBeforeClosing).toBe(0)
    expect(toOpeningHours({ hours: week, lastReservationBeforeClosing: 90 }).lastReservationBeforeClosing).toBe(90)
  })

  // A negative margin would put the last slot *after* closing time and take
  // bookings for an empty cafe.
  it('clamps a margin outside its bounds', () => {
    expect(toOpeningHours({ hours: week, lastReservationBeforeClosing: -60 }).lastReservationBeforeClosing).toBe(0)
    expect(toOpeningHours({ hours: week, lastReservationBeforeClosing: 9000 }).lastReservationBeforeClosing)
      .toBe(MAX_LAST_RESERVATION_BEFORE_CLOSING)
    expect(toOpeningHours({ hours: week, lastReservationBeforeClosing: 62.5 }).lastReservationBeforeClosing).toBe(63)
  })

  it('falls back to the default for a margin that is not a number', () => {
    for (const value of [null, undefined, Number.NaN, '60' as unknown as number]) {
      expect(toOpeningHours({ hours: week, lastReservationBeforeClosing: value }).lastReservationBeforeClosing)
        .toBe(DEFAULT_LAST_RESERVATION_BEFORE_CLOSING)
    }
  })

  it('normalises the exception rows it can use', () => {
    const document = toOpeningHours({
      hours: week,
      reservationExceptions: [{ date: ' 2026-01-05 ', bookableFrom: ' 17:30 ', bookableUntil: '19:30', note: 'Dinner' }]
    })

    expect(document.reservationExceptions).toEqual([
      { date: '2026-01-05', closed: false, bookableFrom: '17:30', bookableUntil: '19:30', note: 'Dinner' }
    ])
  })

  // A row with no date matches no date, and comparing it would throw on every
  // page that offers slots - which is every visit to the reservation form.
  it('drops a row without a usable date instead of throwing on it', () => {
    const document = toOpeningHours({
      hours: week,
      reservationExceptions: [
        { date: null as unknown as string, closed: true },
        { date: '   ' },
        undefined,
        null,
        { date: '2026-01-05', closed: true }
      ]
    })

    expect(document.reservationExceptions).toEqual([
      { date: '2026-01-05', closed: true, bookableFrom: undefined, bookableUntil: undefined, note: undefined }
    ])
  })

  it('reads an absent or malformed list as no exceptions', () => {
    expect(toOpeningHours({ hours: week, reservationExceptions: null }).reservationExceptions).toEqual([])
    expect(toOpeningHours({ hours: week, reservationExceptions: undefined }).reservationExceptions).toEqual([])
  })

  it('reads a document with no hours as a week that offers nothing', () => {
    expect(toOpeningHours({ hours: null }).hours).toEqual([])
    expect(toOpeningHours({}).hours).toEqual([])
  })
})
