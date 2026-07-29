import { beforeEach, describe, expect, it, vi } from 'vitest'
import { postJson } from '../utils/h3'

const { sendContactEmail } = vi.hoisted(() => ({ sendContactEmail: vi.fn() }))

vi.mock('~~/server/services/email', () => ({ sendContactEmail }))

const handler = await import('~~/server/api/contact/index.post').then(module => module.default)

const validPayload = () => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '',
  subject: 'events',
  message: 'Could you tell me whether the cacao ceremony is suitable for beginners?',
  privacyConsent: true,
  locale: 'de'
})

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendContactEmail.mockReset().mockResolvedValue({ ownerEmail: {}, confirmationSent: true })
  })

  it('sends the validated message and reports the confirmation status', async () => {
    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: 'Contact message sent successfully',
      confirmationSent: true
    })
    expect(sendContactEmail).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      // An empty phone reaches the email service as null, not ''.
      phone: null,
      subject: 'events',
      locale: 'de',
      privacyConsent: true
    }))
  })

  it('reports when only the visitor confirmation failed', async () => {
    sendContactEmail.mockResolvedValue({ ownerEmail: {}, confirmationSent: false })

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(200)
    expect(response.body.confirmationSent).toBe(false)
  })

  it('rejects an invalid message with 422 and never sends an email', async () => {
    const response = await postJson(handler, { ...validPayload(), message: 'Hi', subject: 'catering' })

    expect(response.status).toBe(422)
    expect(response.body.data.map((issue: { message: string }) => issue.message)).toEqual(
      expect.arrayContaining([
        'contact.form.errors.subject.invalid',
        'contact.form.errors.message.min'
      ])
    )
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('rejects a message without privacy consent', async () => {
    const response = await postJson(handler, { ...validPayload(), privacyConsent: false })

    expect(response.status).toBe(422)
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when the message could not be sent', async () => {
    sendContactEmail.mockRejectedValue(new Error('Mailgun is down'))

    const response = await postJson(handler, validPayload())

    expect(response.status).toBe(500)
  })

  it('rejects a malformed request body with 400', async () => {
    const response = await postJson(handler, '{ not json')

    expect(response.status).toBe(400)
    expect(sendContactEmail).not.toHaveBeenCalled()
  })
})
