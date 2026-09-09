import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextUpcomingEvent } from '~/utils/events'

// "Now" is a Tuesday morning. `isUpcomingEvent` compares against the start of
// that day, so an event dated today still counts.
const now = new Date('2026-09-08T10:00:00.000Z')

const event = (title: string, date: string, time?: string) => ({ title, date, time })

describe('nextUpcomingEvent', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads the clock when no "now" is given, so the composable follows the visitor\'s day', () => {
    vi.useFakeTimers({ toFake: ['Date'] })

    const events = [event('Yesterday', '2026-09-07'), event('Tonight', '2026-09-08'), event('Next week', '2026-09-14')]

    vi.setSystemTime(new Date('2026-09-08T23:30:00'))
    expect(nextUpcomingEvent(events)?.title).toBe('Tonight')

    // The day after, the same list promotes the following event.
    vi.setSystemTime(new Date('2026-09-09T00:30:00'))
    expect(nextUpcomingEvent(events)?.title).toBe('Next week')
  })

  it('picks the soonest upcoming event', () => {
    const events = [
      event('Later', '2026-10-01'),
      event('Sooner', '2026-09-14'),
      event('Latest', '2026-12-24')
    ]

    expect(nextUpcomingEvent(events, now)?.title).toBe('Sooner')
  })

  it('ignores events that have passed', () => {
    const events = [
      event('Yesterday', '2026-09-07'),
      event('Last winter', '2026-01-05'),
      event('Next week', '2026-09-14')
    ]

    expect(nextUpcomingEvent(events, now)?.title).toBe('Next week')
  })

  it('treats an event dated today as upcoming', () => {
    const events = [event('Tonight', '2026-09-08', '18:30'), event('Next week', '2026-09-14')]

    expect(nextUpcomingEvent(events, now)?.title).toBe('Tonight')
  })

  it('is unaffected by input ordering', () => {
    const events = [
      event('Yesterday', '2026-09-07'),
      event('Later', '2026-10-01'),
      event('Sooner', '2026-09-14')
    ]

    expect(nextUpcomingEvent(events, now)?.title).toBe('Sooner')
    expect(nextUpcomingEvent([...events].reverse(), now)?.title).toBe('Sooner')
  })

  it('breaks a same-day tie on the slug, so both locales pick the same event', () => {
    const dinner = { ...event('Abendessen', '2026-09-14', '18:30'), stem: 'events/dinner.de' }
    const brunch = { ...event('Zwei-Gänge-Brunch', '2026-09-14', '11:00'), stem: 'events/brunch.de' }

    // The German titles would order dinner first; the shared slug orders brunch first.
    expect(nextUpcomingEvent([dinner, brunch], now)).toBe(brunch)
    expect(nextUpcomingEvent([brunch, dinner], now)).toBe(brunch)
  })

  it('falls back to the title for a same-day tie without stems', () => {
    const b = event('Bread workshop', '2026-09-14')
    const a = event('Aperitivo', '2026-09-14')

    expect(nextUpcomingEvent([b, a], now)).toBe(a)
    expect(nextUpcomingEvent([a, b], now)).toBe(a)
  })

  it('returns null for an empty list and for an all-past list', () => {
    expect(nextUpcomingEvent([], now)).toBeNull()
    expect(nextUpcomingEvent([event('Gone', '2026-01-05'), event('Also gone', '2026-09-07')], now)).toBeNull()
  })
})
