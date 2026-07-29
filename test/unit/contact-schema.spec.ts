import { describe, expect, it } from 'vitest'
import { ContactSchema, contactSubjects, getContactValidationMessage } from '#shared/utils/schemas'

// Both the contact form and the `/api/contact` route validate against this
// schema, so it defines what a contact message is allowed to contain.

const validPayload = () => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+49 152 3684 8480',
  subject: 'general',
  message: 'I would like to know whether the brunch is available on weekdays too.',
  privacyConsent: true,
  locale: 'en' as const
})

const parse = (overrides: Record<string, unknown> = {}) =>
  ContactSchema.safeParse({ ...validPayload(), ...overrides })

const messagesFor = (field: string, result: ReturnType<typeof parse>) =>
  result.success
    ? []
    : result.error.issues.filter(issue => issue.path[0] === field).map(issue => issue.message)

describe('ContactSchema', () => {
  it('accepts a complete contact message', () => {
    const result = parse()

    expect(result.success).toBe(true)
    expect(result.success && result.data.subject).toBe('general')
  })

  it.each([
    ['firstName', 'contact.form.errors.firstName.required'],
    ['lastName', 'contact.form.errors.lastName.required']
  ])('rejects a blank %s', (field, message) => {
    expect(messagesFor(field, parse({ [field]: '  ' }))).toContain(message)
  })

  it('rejects an invalid email', () => {
    expect(messagesFor('email', parse({ email: 'ada@example' })))
      .toContain('contact.form.errors.email.invalid')
  })

  describe('phone', () => {
    it('accepts a phone number with a country code', () => {
      expect(parse({ phone: '+4915236848480' }).success).toBe(true)
    })

    it('rejects a phone number with unsupported characters', () => {
      expect(messagesFor('phone', parse({ phone: '030 / 12 34 56' })))
        .toContain('contact.form.errors.phone.invalid')
    })

    it('treats an empty phone as not provided', () => {
      const result = parse({ phone: '' })

      expect(result.success && result.data.phone).toBeNull()
    })
  })

  describe('subject', () => {
    it.each(contactSubjects)('accepts the subject %s', (subject) => {
      expect(parse({ subject }).success).toBe(true)
    })

    it('rejects an empty subject, as sent by the untouched select', () => {
      expect(messagesFor('subject', parse({ subject: '' })))
        .toContain('contact.form.errors.subject.required')
    })

    it('rejects a subject outside the allowed list', () => {
      expect(messagesFor('subject', parse({ subject: 'catering' })))
        .toContain('contact.form.errors.subject.invalid')
    })
  })

  describe('message', () => {
    it('rejects a message shorter than 20 characters', () => {
      expect(messagesFor('message', parse({ message: 'Too short' })))
        .toContain('contact.form.errors.message.min')
    })

    it('rejects a message longer than 2000 characters', () => {
      expect(messagesFor('message', parse({ message: 'x'.repeat(2001) })))
        .toContain('contact.form.errors.message.max')
    })

    it('counts the trimmed length', () => {
      expect(parse({ message: `${' '.repeat(50)}Too short${' '.repeat(50)}` }).success).toBe(false)
    })
  })

  it.each([false, undefined])('rejects consent %j', (privacyConsent) => {
    expect(messagesFor('privacyConsent', parse({ privacyConsent })))
      .toContain('contact.form.errors.privacy.required')
  })

  describe('locale', () => {
    it('keeps the German locale', () => {
      const result = parse({ locale: 'de' })

      expect(result.success && result.data.locale).toBe('de')
    })

    it('defaults to English when omitted', () => {
      const { locale: _locale, ...payload } = validPayload()
      const result = ContactSchema.safeParse(payload)

      expect(result.success && result.data.locale).toBe('en')
    })

    it('rejects an unsupported locale', () => {
      expect(parse({ locale: 'fr' }).success).toBe(false)
    })
  })
})

describe('getContactValidationMessage', () => {
  it('translates a known error key to English', () => {
    expect(getContactValidationMessage('contact.form.errors.message.min'))
      .toBe('Please write at least a few sentences.')
  })

  it('passes an unknown message through unchanged', () => {
    expect(getContactValidationMessage('Mailgun is not configured')).toBe('Mailgun is not configured')
  })

  it('falls back to a generic message when there is none', () => {
    expect(getContactValidationMessage()).toBe('Please check the contact details and try again.')
  })
})
