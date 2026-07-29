import { createError } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { postJson } from '../utils/h3'

const { insertReservation, sendReservationEmail, supabaseClient } = vi.hoisted(() => ({
  insertReservation: vi.fn(),
  sendReservationEmail: vi.fn(),
  supabaseClient: { from: () => {} }
}))

vi.mock('~~/server/repositories/reservations', () => ({ insertReservation }))
vi.mock('~~/server/services/email', () => ({ sendReservationEmail }))
vi.mock('~~/server/utils/supabase', () => ({ useServerSupabaseClient: () => supabaseClient }))

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

const storedReservation = {
  id: 1,
  created_at: NOW.toISOString(),
  date: '2026-08-08',
  email: 'ada@example.com',
  first_name: 'Ada',
  guests: 4,
  last_name: 'Lovelace',
  message: 'Window seat if possible.',
  phone: '+49 152 3684 8480',
  privacy_consent: NOW.toISOString(),
  time: '12:30:00'
}

describe('POST /api/reservations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    insertReservation.mockReset().mockResolvedValue(storedReservation)
    sendReservationEmail.mockReset().mockResolvedValue({ id: 'mailgun-id' })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('stores the reservation and notifies the cafe', async () => {
    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      message: 'Reservation created successfully',
      emailSent: true,
      reservation: storedReservation
    })
    expect(sendReservationEmail).toHaveBeenCalledWith(storedReservation)
  })

  it('maps the payload onto the database columns', async () => {
    await postJson(handler, validPayload())

    expect(insertReservation).toHaveBeenCalledWith(supabaseClient, {
      date: '2026-08-08',
      email: 'ada@example.com',
      first_name: 'Ada',
      guests: 4,
      last_name: 'Lovelace',
      message: 'Window seat if possible.',
      phone: '+49 152 3684 8480',
      // Proof of consent is stamped server side, not taken from the client.
      privacy_consent: NOW.toISOString(),
      time: '12:30:00'
    })
  })

  it('stores a missing phone and message as null', async () => {
    const { message: _message, phone: _phone, ...payload } = validPayload()

    await postJson(handler, payload)

    expect(insertReservation).toHaveBeenCalledWith(
      supabaseClient,
      expect.objectContaining({ message: null, phone: null })
    )
  })

  it('rejects an invalid reservation with 422 and never touches the database', async () => {
    const response = await postJson(handler, { ...validPayload(), email: 'nope', guests: 99 })

    expect(response.status).toBe(422)
    expect(response.body.data.map((issue: { message: string }) => issue.message)).toEqual(
      expect.arrayContaining([
        'reservations.form.errors.email.invalid',
        'reservations.form.errors.guests.max'
      ])
    )
    expect(insertReservation).not.toHaveBeenCalled()
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('rejects a reservation without privacy consent', async () => {
    const response = await postJson(handler, { ...validPayload(), privacyConsent: false })

    expect(response.status).toBe(422)
    expect(insertReservation).not.toHaveBeenCalled()
  })

  it('rejects a reservation in the past', async () => {
    const response = await postJson(handler, { ...validPayload(), date: '2026-08-05' })

    expect(response.status).toBe(422)
    expect(insertReservation).not.toHaveBeenCalled()
  })

  it('still confirms the reservation when the notification email fails', async () => {
    // The guest must not be told to try again after the row was written, or
    // they would create a duplicate booking.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sendReservationEmail.mockRejectedValue(new Error('Mailgun is down'))

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ emailSent: false, reservation: storedReservation })
  })

  it('fails the request when the reservation cannot be stored', async () => {
    insertReservation.mockRejectedValue(createError({
      statusCode: 500,
      statusMessage: 'insert failed'
    }))

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(500)
    expect(sendReservationEmail).not.toHaveBeenCalled()
  })

  it('rejects a malformed request body with 400', async () => {
    const response = await postJson(handler, '{ not json')

    expect(response.status).toBe(400)
    expect(insertReservation).not.toHaveBeenCalled()
  })
})
