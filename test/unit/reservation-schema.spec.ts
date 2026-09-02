import { CalendarDate, Time } from '@internationalized/date'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReservationSchema, getReservationValidationMessage } from '#shared/utils/schemas'

// The schema is the single gate every reservation passes through: the form
// validates against it in the browser and the API route re-validates the same
// payload on the server.

// A Thursday, so the default payload never lands on a closed Monday.
const TODAY = new Date('2026-08-06T09:00:00')

const validPayload = () => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+49 152 3684 8480',
  message: 'Window seat if possible.',
  guests: 2,
  date: '2026-08-08',
  time: '12:30',
  privacyConsent: true
})

const parse = (overrides: Record<string, unknown> = {}) =>
  ReservationSchema.safeParse({ ...validPayload(), ...overrides })

const messagesFor = (field: string, result: ReturnType<typeof parse>) =>
  result.success
    ? []
    : result.error.issues.filter(issue => issue.path[0] === field).map(issue => issue.message)

describe('ReservationSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts a complete reservation and normalises date and time', () => {
    const result = parse()

    expect(result.success).toBe(true)

    if (!result.success) return

    expect(result.data.date).toBeInstanceOf(CalendarDate)
    expect(result.data.date.toString()).toBe('2026-08-08')
    expect(result.data.time).toBeInstanceOf(Time)
    expect(result.data.time.toString()).toBe('12:30:00')
    expect(result.data.phone).toBe('+49 152 3684 8480')
  })

  describe('guest details', () => {
    it.each([
      ['firstName', 'reservations.form.errors.firstName.required'],
      ['lastName', 'reservations.form.errors.lastName.required']
    ])('rejects a blank %s', (field, message) => {
      const result = parse({ [field]: '   ' })

      expect(messagesFor(field, result)).toContain(message)
    })

    it.each(['', 'ada', 'ada@', 'ada@example'])('rejects the invalid email %j', (email) => {
      expect(parse({ email }).success).toBe(false)
    })

    it('reports an invalid email with a translatable message', () => {
      expect(messagesFor('email', parse({ email: 'not-an-email' })))
        .toContain('reservations.form.errors.email.invalid')
    })
  })

  describe('phone', () => {
    it.each(['+49 152 3684 8480', '015236848480', '+4915236848480'])('accepts %j', (phone) => {
      expect(parse({ phone }).success).toBe(true)
    })

    it.each(['030/12 34 56', '+49-152-3684', 'call me', '+'])('rejects %j', (phone) => {
      expect(messagesFor('phone', parse({ phone })))
        .toContain('reservations.form.errors.phone.invalid')
    })

    it('treats an empty phone as not provided', () => {
      const result = parse({ phone: '' })

      expect(result.success && result.data.phone).toBeNull()
    })

    it('treats a missing phone as not provided', () => {
      const { phone: _phone, ...payload } = validPayload()
      const result = ReservationSchema.safeParse(payload)

      expect(result.success && result.data.phone).toBeNull()
    })
  })

  describe('guests', () => {
    it.each([1, 20])('accepts %i guests', (guests) => {
      expect(parse({ guests }).success).toBe(true)
    })

    it('rejects fewer than one guest', () => {
      expect(messagesFor('guests', parse({ guests: 0 })))
        .toContain('reservations.form.errors.guests.min')
    })

    it('rejects more than twenty guests', () => {
      expect(messagesFor('guests', parse({ guests: 21 })))
        .toContain('reservations.form.errors.guests.max')
    })

    it.each([2.5, '2', null])('rejects the non-integer guest count %j', (guests) => {
      expect(parse({ guests }).success).toBe(false)
    })
  })

  describe('date', () => {
    it('accepts today', () => {
      expect(parse({ date: '2026-08-06' }).success).toBe(true)
    })

    it('rejects yesterday', () => {
      expect(messagesFor('date', parse({ date: '2026-08-05' })))
        .toContain('reservations.form.errors.date.invalid')
    })

    it.each(['2026-02-30', '2026-13-01', 'soon', ''])('rejects the impossible date %j', (date) => {
      expect(parse({ date }).success).toBe(false)
    })

    it('accepts a date object as sent by the calendar input', () => {
      const result = parse({ date: { year: 2026, month: 8, day: 8 } })

      expect(result.success && result.data.date.toString()).toBe('2026-08-08')
    })
  })

  describe('time', () => {
    it.each(['00:00', '07:00', '12:15', '16:00', '23:45'])('accepts %j on the 15-minute grid', (time) => {
      expect(parse({ time }).success).toBe(true)
    })

    it.each(['12:23', '07:05', '15:59', '12:30:30'])('rejects %j off the 15-minute slot grid', (time) => {
      expect(messagesFor('time', parse({ time })))
        .toContain('reservations.form.errors.time.invalid')
    })
  })

  describe('message', () => {
    it('accepts a message of exactly 1000 characters', () => {
      expect(parse({ message: 'x'.repeat(1000) }).success).toBe(true)
    })

    it('rejects a longer message', () => {
      expect(parse({ message: 'x'.repeat(1001) }).success).toBe(false)
    })
  })

  describe('privacy consent', () => {
    it.each([false, undefined])('rejects consent %j', (privacyConsent) => {
      expect(messagesFor('privacyConsent', parse({ privacyConsent })))
        .toContain('reservations.form.errors.privacy.required')
    })
  })
})

describe('getReservationValidationMessage', () => {
  it('translates a known error key to English', () => {
    expect(getReservationValidationMessage('reservations.form.errors.guests.max'))
      .toBe('Maximum 20 guests allowed.')
  })

  it('passes an unknown message through unchanged', () => {
    expect(getReservationValidationMessage('Database unavailable')).toBe('Database unavailable')
  })

  it('falls back to a generic message when there is none', () => {
    expect(getReservationValidationMessage()).toBe('Please check the reservation details and try again.')
  })
})
