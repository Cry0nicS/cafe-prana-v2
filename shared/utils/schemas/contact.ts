import * as z from 'zod'

export const contactSubjects = [
  'general',
  'reservation',
  'events',
  'menu',
  'feedback',
  'other'
] as const

export type ContactSubject = typeof contactSubjects[number]

const required = (message: string) => z.string().trim().min(1, message)

export const contactValidationMessages: Record<string, string> = {
  'contact.form.errors.firstName.required': 'First name is required.',
  'contact.form.errors.lastName.required': 'Last name is required.',
  'contact.form.errors.email.required': 'Email is required.',
  'contact.form.errors.email.invalid': 'Please provide a valid email address.',
  'contact.form.errors.phone.invalid': 'Please provide a valid phone number with country code.',
  'contact.form.errors.subject.required': 'Please choose a subject.',
  'contact.form.errors.subject.invalid': 'Please choose a valid subject.',
  'contact.form.errors.message.required': 'Message is required.',
  'contact.form.errors.message.min': 'Please write at least a few sentences.',
  'contact.form.errors.message.max': 'Please keep the message below 2000 characters.',
  'contact.form.errors.privacy.required': 'Please agree to the processing of your details for contact purposes.'
}

export const getContactValidationMessage = (message?: string) => {
  if (!message) {
    return 'Please check the contact details and try again.'
  }

  return contactValidationMessages[message] || message
}

export const ContactSchema = z.object({
  firstName: required('contact.form.errors.firstName.required'),
  lastName: required('contact.form.errors.lastName.required'),
  email: z
    .string()
    .trim()
    .min(5, 'contact.form.errors.email.required')
    .email('contact.form.errors.email.invalid'),
  phone: z
    .string()
    .trim()
    .regex(/^(?=.*\d)\+?\d(?: ?\d)*$/, 'contact.form.errors.phone.invalid')
    .or(z.literal(''))
    .transform(value => value === '' ? null : value)
    .nullable()
    .optional()
    .transform(value => value ?? null),
  subject: z
    .string()
    .trim()
    .min(1, 'contact.form.errors.subject.required')
    .refine(value => contactSubjects.includes(value as ContactSubject), {
      message: 'contact.form.errors.subject.invalid'
    }),
  message: z
    .string()
    .trim()
    .min(20, 'contact.form.errors.message.min')
    .max(2000, 'contact.form.errors.message.max'),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine(value => value === true, {
      message: 'contact.form.errors.privacy.required'
    }),
  locale: z.enum(['en', 'de']).default('en')
})
