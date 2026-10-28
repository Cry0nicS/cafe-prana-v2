import { CalendarDate, Time } from '@internationalized/date'
import { createError } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { postJson } from '../utils/h3'
import { openingHoursDocument, testOpeningHours } from '../utils/opening-hours'

const { sendReservationEmail } = vi.hoisted(() => ({ sendReservationEmail: vi.fn() }))

vi.mock('~~/server/services/email', () => ({ sendReservationEmail }))
// The route reads the opening hours from the content database; serve the
// fixture instead. Only that one collection is expected server-side.
vi.mock('@nuxt/content/server', async () => {
  const { openingHoursDocument } = await import('../utils/opening-hours')

  return {
    queryCollection: (_event: unknown, collection: string) => ({
      first: async () => {
        if (collection !== 'openingHours') {
          throw new Error(`Unexpected server content query for collection "${collection}"`)
        }

        return openingHoursDocument.value
      }
    })
  }
})

const handler = await import('~~/server/api/reservations/index.post').then(module => module.default)

// A Thursday in the future, so the payload is never a past date.
const NOW = new Date('2026-08-06T09:00:00Z')

const validPayload = () => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+49 152 3684 8480',
  message: 'Window seat if possible.',
  guests: 4,
  date: '2026-08-08',
  time: '12:30',
  privacyConsent: true
})

describe('POST /api/reservations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    sendReservationEmail.mockReset().mockResolvedValue({ id: 'mailgun-id' })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    openingHoursDocument.value = testOpeningHours
  })

  // 2026-08-08 is a Saturday (09:00 to 17:00, last slot 16:00).
  it('rejects a slot outside that day\'s opening hours', async () => {
    const response = await postJson(handler, { ...validPayload(), time: '08:00' })

    expect(response.status).toBe(422)
    expect(JSON.stringify(response.body)).toContain('reservations.form.errors.time.unavailable')
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('rejects the last hour before closing', async () => {
    const response = await postJson(handler, { ...validPayload(), time: '16:15' })

    expect(response.status).toBe(422)
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  // 2026-08-10 is a Monday, which is closed.
  it('rejects a day the cafe is closed', async () => {
    const response = await postJson(handler, { ...validPayload(), date: '2026-08-10' })

    expect(response.status).toBe(422)
    expect(JSON.stringify(response.body)).toContain('reservations.form.errors.date.closed')
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  // 2026-08-17 is a Monday the fixture opens for a dinner, 17:00 to 20:00.
  it('accepts an evening slot on a date an exception opens', async () => {
    const response = await postJson(handler, { ...validPayload(), date: '2026-08-17', time: '18:30' })

    expect(response.status).toBe(200)
    expect(sendReservationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ date: new CalendarDate(2026, 8, 17), time: new Time(18, 30) }),
      NOW.toISOString()
    )
  })

  // 2026-08-11 is a Tuesday the fixture closes for a holiday.
  it('rejects a date an exception closes', async () => {
    const response = await postJson(handler, { ...validPayload(), date: '2026-08-11' })

    expect(response.status).toBe(422)
    expect(JSON.stringify(response.body)).toContain('reservations.form.errors.date.closed')
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('fails loudly when the opening hours are missing from content', async () => {
    openingHoursDocument.value = null

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(500)
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('emails the validated reservation to the cafe', async () => {
    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Reservation sent successfully' })
    expect(sendReservationEmail).toHaveBeenCalledTimes(1)
    expect(sendReservationEmail).toHaveBeenCalledWith(
      {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '+49 152 3684 8480',
        message: 'Window seat if possible.',
        guests: 4,
        date: new CalendarDate(2026, 8, 8),
        time: new Time(12, 30),
        privacyConsent: true
      },
      // Proof of consent is stamped server side, not taken from the client.
      NOW.toISOString()
    )
  })

  it('rejects an invalid reservation with 422 and never sends an email', async () => {
    const response = await postJson(handler, { ...validPayload(), email: 'nope', guests: 99 })

    expect(response.status).toBe(422)
    expect(response.body.data.map((issue: { message: string }) => issue.message)).toEqual(
      expect.arrayContaining([
        'reservations.form.errors.email.invalid',
        'reservations.form.errors.guests.max'
      ])
    )
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('rejects a reservation without privacy consent', async () => {
    const response = await postJson(handler, { ...validPayload(), privacyConsent: false })

    expect(response.status).toBe(422)
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('rejects a reservation in the past', async () => {
    const response = await postJson(handler, { ...validPayload(), date: '2026-08-05' })

    expect(response.status).toBe(422)
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('fails the request when the email cannot be sent', async () => {
    // Nothing was stored, so the guest can safely submit again.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('Mailgun is down')
    sendReservationEmail.mockRejectedValue(failure)

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(500)
    // The provider's message stays in the server log, never in the response.
    expect(JSON.stringify(response.body)).not.toContain('Mailgun is down')
    expect(response.body.data).toBeUndefined()
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), failure)
  })

  it('fails the request when Mailgun is not configured', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = createError({
      statusCode: 500,
      statusMessage: 'Mailgun is not configured'
    })
    sendReservationEmail.mockRejectedValue(failure)

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(500)
    expect(JSON.stringify(response.body)).not.toContain('Mailgun is not configured')
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), failure)
  })

  it('rejects a malformed request body with 400', async () => {
    const response = await postJson(handler, '{ not json')

    expect(response.status).toBe(400)
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })
})
