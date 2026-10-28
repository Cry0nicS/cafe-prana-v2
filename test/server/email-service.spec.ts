import { CalendarDate, Time } from '@internationalized/date'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setTestRuntimeConfig } from '../utils/runtime-config'

const { messagesCreate } = vi.hoisted(() => ({ messagesCreate: vi.fn() }))

vi.mock('mailgun.js', () => ({
  default: class MailgunMock {
    client() {
      return { messages: { create: messagesCreate } }
    }
  }
}))

const { sendContactEmail, sendReservationEmail } = await import('~~/server/services/email')

// The reservation as the route hands it over: the schema's output, with the
// date and time already parsed.
const reservation = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+49 152 3684 8480',
  message: 'Window seat if possible.',
  guests: 4,
  date: new CalendarDate(2026, 8, 8),
  time: new Time(12, 30),
  privacyConsent: true
}

const consentedAt = '2026-08-06T09:00:00.000Z'

const contactMessage = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: null,
  subject: 'events' as const,
  message: 'Is the cacao ceremony suitable for beginners?',
  privacyConsent: true,
  locale: 'en' as const
}

describe('email service', () => {
  beforeEach(() => {
    setTestRuntimeConfig()
    messagesCreate.mockReset().mockResolvedValue({ id: 'mailgun-id' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendReservationEmail', () => {
    it('notifies the cafe with the booking details and the guest as reply-to', async () => {
      await sendReservationEmail(reservation, consentedAt)

      expect(messagesCreate).toHaveBeenCalledTimes(1)

      const [domain, payload] = messagesCreate.mock.calls[0]!

      expect(domain).toBe('mail.test')
      expect(payload).toMatchObject({
        'from': 'Cafe Prana <reservation@mail.test>',
        'to': 'owner@test',
        'bcc': 'bcc@test',
        'subject': 'Reservation from Ada Lovelace',
        'h:Reply-To': 'ada@example.com'
      })
      expect(payload.text).toContain('First name: Ada')
      expect(payload.text).toContain('Last name: Lovelace')
      expect(payload.text).toContain('Email: ada@example.com')
      expect(payload.text).toContain('Phone: +49 152 3684 8480')
      expect(payload.text).toContain('Guests: 4')
      expect(payload.text).toContain('Date: 2026-08-08')
      expect(payload.text).toContain('Time: 12:30\n')
      expect(payload.text).toContain('Window seat if possible.')
    })

    it('records when the guest gave privacy consent', async () => {
      // With nothing stored, this line is the only record of the consent.
      await sendReservationEmail(reservation, consentedAt)

      expect(messagesCreate.mock.calls[0]![1].text).toContain('Privacy consent: 2026-08-06T09:00:00.000Z')
    })

    it('falls back to a dash for the optional fields', async () => {
      await sendReservationEmail({ ...reservation, message: null, phone: null }, consentedAt)

      const { text } = messagesCreate.mock.calls[0]![1]

      expect(text).toContain('Phone: -')
      expect(text).toContain('Message:\n-')
    })

    it('keeps each single-line field on its own line', async () => {
      // A newline in a name must not forge a line such as the consent record.
      await sendReservationEmail({
        ...reservation,
        firstName: 'Ada\nPrivacy consent: never',
        lastName: 'Love\r\nlace',
        email: 'ada@example.com\n',
        phone: '+49 152\n3684 8480',
        message: 'Window seat\nif possible.'
      }, consentedAt)

      const [, payload] = messagesCreate.mock.calls[0]!

      expect(payload.subject).toBe('Reservation from Ada Privacy consent: never Love lace')
      expect(payload.text).toContain('First name: Ada Privacy consent: never\n')
      expect(payload.text).toContain('Last name: Love lace\n')
      expect(payload.text).toContain('Phone: +49 152 3684 8480\n')
      expect(payload.text.match(/^Privacy consent:/gm)).toEqual(['Privacy consent:'])
      // The message is last in the body, so it keeps its line breaks.
      expect(payload.text).toContain('Message:\nWindow seat\nif possible.')
    })

    it('rejects when Mailgun is not configured', async () => {
      setTestRuntimeConfig({ mailgunKey: '' })

      await expect(sendReservationEmail(reservation, consentedAt)).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: 'Mailgun is not configured'
      })
      expect(messagesCreate).not.toHaveBeenCalled()
    })

    it('propagates a Mailgun failure so the route can report it', async () => {
      messagesCreate.mockRejectedValue(new Error('Mailgun is down'))

      await expect(sendReservationEmail(reservation, consentedAt)).rejects.toThrow('Mailgun is down')
    })
  })

  describe('sendContactEmail', () => {
    it('sends the message to the cafe and a confirmation to the visitor', async () => {
      const result = await sendContactEmail(contactMessage)

      expect(result.confirmationSent).toBe(true)
      expect(messagesCreate).toHaveBeenCalledTimes(2)

      const [, ownerPayload] = messagesCreate.mock.calls[0]!
      const [, visitorPayload] = messagesCreate.mock.calls[1]!

      expect(ownerPayload).toMatchObject({
        'from': 'Cafe Prana <hello@mail.test>',
        'to': 'contact@test',
        'subject': 'Contact message from Ada Lovelace: Events',
        'h:Reply-To': 'ada@example.com'
      })
      expect(ownerPayload.text).toContain('Is the cacao ceremony suitable for beginners?')
      expect(ownerPayload.text).toContain('Phone: -')

      expect(visitorPayload).toMatchObject({
        to: 'ada@example.com',
        subject: 'Thank you for contacting Cafe Prana'
      })
      expect(visitorPayload.text).toContain('Hi Ada,')
      expect(visitorPayload.text).toContain('Your subject: Events')
    })

    it('writes the confirmation in German for a German visitor', async () => {
      await sendContactEmail({ ...contactMessage, locale: 'de' })

      const [, visitorPayload] = messagesCreate.mock.calls[1]!

      expect(visitorPayload.subject).toBe('Danke fuer deine Nachricht an Cafe Prana')
      expect(visitorPayload.text).toContain('Hallo Ada,')
      expect(visitorPayload.text).toContain('Dein Thema: Events')
    })

    it('still succeeds when only the visitor confirmation fails', async () => {
      // The cafe has the message, so the visitor should not be told to retry.
      messagesCreate
        .mockResolvedValueOnce({ id: 'owner-mail' })
        .mockRejectedValueOnce(new Error('Recipient rejected'))

      const result = await sendContactEmail(contactMessage)

      expect(result.confirmationSent).toBe(false)
    })

    it('rejects when the message to the cafe fails', async () => {
      messagesCreate.mockRejectedValue(new Error('Mailgun is down'))

      await expect(sendContactEmail(contactMessage)).rejects.toThrow('Mailgun is down')
    })

    it('rejects when Mailgun is not configured', async () => {
      setTestRuntimeConfig({ mailgunBaseUrl: '' })

      await expect(sendContactEmail(contactMessage)).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: 'Mailgun is not configured'
      })
    })
  })
})
