import { describe, expect, it } from 'vitest'
import { checkEventBookability, firstTimeIn } from '~~/scripts/event-bookability'
import { testOpeningHours } from '../utils/opening-hours'

// A Thursday; every event below is dated after it unless the test says so.
const NOW = new Date('2026-08-06T09:00:00.000Z')

const event = (overrides: Partial<Parameters<typeof checkEventBookability>[0]> = {}) => ({
  path: 'content/events/dinner.md',
  title: 'Summer dinner',
  date: '2026-08-17',
  time: '18:30',
  reservation: 'required',
  ...overrides
})

describe('reading the start time of an event', () => {
  it('takes the first HH:MM in the free-form time field', () => {
    expect(firstTimeIn('18:30')).toEqual({ hour: 18, minute: 30 })
    expect(firstTimeIn('11:00-13:00')).toEqual({ hour: 11, minute: 0 })
    expect(firstTimeIn('Thursdays at 17:00 (kick-off workshop on 22 Feb; closing ceremony on 29 Mar)'))
      .toEqual({ hour: 17, minute: 0 })
    expect(firstTimeIn('from 9:30')).toEqual({ hour: 9, minute: 30 })
  })

  it('finds nothing in a value it cannot read', () => {
    expect(firstTimeIn(undefined)).toBeNull()
    expect(firstTimeIn('')).toBeNull()
    expect(firstTimeIn('Time to be announced')).toBeNull()
    expect(firstTimeIn('25:00')).toBeNull()
  })
})

describe('checking an event against the opening hours', () => {
  it('passes an event whose start time is a bookable slot', () => {
    // A Monday the fixture opens for a dinner, 17:00 to 20:00.
    expect(checkEventBookability(event(), testOpeningHours, NOW)).toMatchObject({ status: 'bookable' })
    // A Saturday, 09:00 to 16:00 from the weekday hours.
    expect(checkEventBookability(event({ date: '2026-08-08', time: '11:00-13:00' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'bookable' })
  })

  it('fails an event on a day that takes no bookings, and says so', () => {
    const result = checkEventBookability(event({ date: '2026-08-10' }), testOpeningHours, NOW)

    expect(result.status).toBe('unbookable')
    expect(result.detail).toContain('2026-08-10')
    expect(result.detail).toMatch(/no bookings|closed/i)
  })

  it('fails an event whose start time falls outside the day\'s slots, and names the slots', () => {
    // A Wednesday: 07:30 to 15:00, last slot 14:00.
    const result = checkEventBookability(event({ date: '2026-08-12', time: '18:00' }), testOpeningHours, NOW)

    expect(result.status).toBe('unbookable')
    expect(result.detail).toContain('18:00')
    expect(result.detail).toContain('07:30')
    expect(result.detail).toContain('14:00')
  })

  it('fails an event on a date an exception closes', () => {
    expect(checkEventBookability(event({ date: '2026-08-11', time: '12:00' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'unbookable' })
  })

  it('reports an event with no readable time as unchecked rather than passing or failing it', () => {
    const result = checkEventBookability(event({ time: 'Evening' }), testOpeningHours, NOW)

    expect(result.status).toBe('unchecked')
    expect(result.detail).toContain('Evening')
  })

  it('skips a walk-in event, which needs no slot', () => {
    expect(checkEventBookability(event({ date: '2026-08-10', reservation: 'walkin' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'skipped' })
  })

  it('skips an event in the past', () => {
    expect(checkEventBookability(event({ date: '2026-08-03' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'skipped' })
    // Today still counts as upcoming, as it does on the events page.
    expect(checkEventBookability(event({ date: '2026-08-06', time: '12:00' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'bookable' })
  })

  it('checks a recommended reservation as well as a required one', () => {
    expect(checkEventBookability(event({ date: '2026-08-10', reservation: 'recommended' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'unbookable' })
  })

  it('reads a date the YAML parser has already turned into a Date', () => {
    expect(checkEventBookability(event({ date: new Date('2026-08-17T00:00:00.000Z') }), testOpeningHours, NOW))
      .toMatchObject({ status: 'bookable' })
  })

  it('reports an unreadable date as unchecked', () => {
    expect(checkEventBookability(event({ date: 'next Monday' }), testOpeningHours, NOW))
      .toMatchObject({ status: 'unchecked' })
  })
})
