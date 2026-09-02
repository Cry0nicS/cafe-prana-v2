import { CalendarDate, Time } from '@internationalized/date'
import * as z from 'zod'
import { CAFE_RESERVATION_TIME_SECONDS } from '../constants'

const required = (message: string) => z.string().trim().min(1, message)

const toDateParts = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const [year, month, day] = value.split('-').map(Number)

  return { year, month, day }
}

const toTimeParts = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const [hour, minute = 0, second = 0] = value.split(':').map(Number)

  return { hour, minute, second }
}

const isValidCalendarDate = (date: { year: number, month: number, day: number }) => {
  try {
    const calendarDate = new CalendarDate(date.year, date.month, date.day)

    return calendarDate.year === date.year && calendarDate.month === date.month && calendarDate.day === date.day
  } catch {
    return false
  }
}

export const reservationValidationMessages: Record<string, string> = {
  'reservations.form.errors.firstName.required': 'First name is required.',
  'reservations.form.errors.lastName.required': 'Last name is required.',
  'reservations.form.errors.email.required': 'Email is required.',
  'reservations.form.errors.email.invalid': 'Please provide a valid email address.',
  'reservations.form.errors.phone.invalid': 'Please provide a valid phone number with country code.',
  'reservations.form.errors.guests.min': 'At least 1 guest is required.',
  'reservations.form.errors.guests.max': 'Maximum 20 guests allowed.',
  'reservations.form.errors.date.invalid': 'Please choose a valid date today or later.',
  'reservations.form.errors.time.invalid': 'Please choose a time between 07:00 and 16:00, in 15-minute steps.',
  'reservations.form.errors.privacy.required': 'Please confirm the privacy policy and consent to be contacted.'
}

export const getReservationValidationMessage = (message?: string) => {
  if (!message) {
    return 'Please check the reservation details and try again.'
  }

  return reservationValidationMessages[message] || message
}

export const ReservationSchema = z.object({
  firstName: required('reservations.form.errors.firstName.required'),
  lastName: required('reservations.form.errors.lastName.required'),
  email: z
    .string()
    .trim()
    .min(5, 'reservations.form.errors.email.required')
    .email('reservations.form.errors.email.invalid'),
  phone: z
    .string()
    .trim()
    .regex(/^(?=.*\d)\+?\d(?: ?\d)*$/, 'reservations.form.errors.phone.invalid')
    .or(z.literal(''))
    .transform(value => value === '' ? null : value)
    .nullable()
    .optional()
    .transform(value => value ?? null),
  message: z.string().trim().max(1000).nullish(),
  guests: z
    .number()
    .int()
    .positive()
    .min(1, 'reservations.form.errors.guests.min')
    .max(20, 'reservations.form.errors.guests.max'),
  date: z
    .preprocess(toDateParts, z.object({
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      day: z.number().int().min(1).max(31)
    }))
    .refine(isValidCalendarDate, {
      message: 'reservations.form.errors.date.invalid'
    })
    .refine(
      (date) => {
        const reservationDate = new CalendarDate(date.year, date.month, date.day)
        const now = new Date()
        const today = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())

        return reservationDate.compare(today) >= 0
      },
      {
        message: 'reservations.form.errors.date.invalid'
      }
    )
    .transform(date => new CalendarDate(date.year, date.month, date.day)),
  time: z
    .preprocess(toTimeParts, z.object({
      hour: z.number().int().min(0).max(23),
      minute: z.number().int().min(0).max(59).optional().default(0),
      second: z.number().int().min(0).max(59).optional().default(0)
    }))
    .refine(
      (time) => {
        const seconds = time.hour * 3600 + time.minute * 60 + time.second
        const { min, max, step } = CAFE_RESERVATION_TIME_SECONDS

        // Inside opening hours and on the slot grid the form offers, so a
        // hand-crafted request cannot book 12:23.
        return seconds >= min && seconds <= max && (seconds - min) % step === 0
      },
      {
        message: 'reservations.form.errors.time.invalid'
      }
    )
    .transform(time => new Time(time.hour, time.minute, time.second)),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine(value => value === true, {
      message: 'reservations.form.errors.privacy.required'
    })
})
