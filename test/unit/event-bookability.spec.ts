import { describe, expect, it } from 'vitest'
import { checkEventBookability, looksRecurring, readStartTime } from '~~/scripts/event-bookability'
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
  it('takes a single time, and the start of a range', () => {
    expect(readStartTime('18:30')).toEqual({ time: { hour: 18, minute: 30 } })
    expect(readStartTime('11:00-13:00')).toEqual({ time: { hour: 11, minute: 0 } })
    expect(readStartTime('11:00 – 13:00')).toEqual({ time: { hour: 11, minute: 0 } })
    expect(readStartTime('from 9:30 to 11:00')).toEqual({ time: { hour: 9, minute: 30 } })
    expect(readStartTime('Doors 18:00')).toEqual({ time: { hour: 18, minute: 0 } })
  })

  it('finds nothing in a value it cannot read', () => {
    expect(readStartTime(undefined)).toEqual({ problem: 'none' })
    expect(readStartTime('')).toEqual({ problem: 'none' })
    expect(readStartTime('Time to be announced')).toEqual({ problem: 'none' })
    expect(readStartTime('25:00')).toEqual({ problem: 'none' })
    expect(readStartTime('18.30 Uhr')).toEqual({ problem: 'none' })
  })

  // Guessing the first of several times would fail a bookable event, or pass
  // an unbookable one, depending on which time the owner wrote first.
  it('refuses to guess between several times that are not a range', () => {
    expect(readStartTime('Einlass 17:30, Beginn 18:30')).toEqual({ problem: 'ambiguous' })
    expect(readStartTime('Doors 17:30, dinner 18:30, music 21:00')).toEqual({ problem: 'ambiguous' })
  })

  it('recognises a repeating time field in either language', () => {
    expect(looksRecurring('Thursdays at 17:00 (kick-off workshop on 22 Feb)')).toBe(true)
    expect(looksRecurring('Donnerstags um 17:00 (Kick-off-Workshop am 22. Feb)')).toBe(true)
    expect(looksRecurring('every Friday at 18:00')).toBe(true)
    expect(looksRecurring('jeden Freitag um 18:00')).toBe(true)
    expect(looksRecurring('18:00')).toBe(false)
    expect(looksRecurring('Thursday 22 Feb, 17:00')).toBe(false)
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

  it('reports several times without a start as unchecked', () => {
    const result = checkEventBookability(event({ time: 'Einlass 17:30, Beginn 18:30' }), testOpeningHours, NOW)

    expect(result.status).toBe('unchecked')
    expect(result.detail).toContain('several times')
  })

  // The document holds one date, so a green verdict would speak for sessions
  // nobody looked at - the real cacao-journey series is exactly this shape.
  it('reports a recurring series as unchecked even when its own date is bookable', () => {
    const series = event({
      date: '2026-08-17',
      time: 'Mondays at 18:30 (first session on 17 Aug; last on 31 Aug)'
    })
    const result = checkEventBookability(series, testOpeningHours, NOW)

    expect(result.status).toBe('unchecked')
    expect(result.detail).toContain('repeating')
    expect(result.detail).toContain('2026-08-17')
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

  // Past and upcoming are judged on the cafe's own day, so a developer's
  // machine and a UTC runner cannot disagree about an event dated today.
  it('counts the day in Berlin time, not the machine\'s', () => {
    // 22:30 UTC is already the next day in Berlin, so 2026-08-06 is over.
    const afterBerlinMidnight = new Date('2026-08-06T22:30:00.000Z')

    expect(checkEventBookability(event({ date: '2026-08-06', time: '12:00' }), testOpeningHours, afterBerlinMidnight))
      .toMatchObject({ status: 'skipped' })
    // Still 2026-08-06 in Berlin at 21:30 UTC on the 5th.
    expect(checkEventBookability(
      event({ date: '2026-08-06', time: '12:00' }),
      testOpeningHours,
      new Date('2026-08-05T21:30:00.000Z')
    )).toMatchObject({ status: 'bookable' })
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
