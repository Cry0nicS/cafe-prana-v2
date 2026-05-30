import type { CalendarDate, Time } from '@internationalized/date'
import type * as z from 'zod'
import type { ReservationSchema } from '../schemas'

export type Reservation = z.output<typeof ReservationSchema>
export type ReservationPayload = z.input<typeof ReservationSchema>

export type ReservationDatePayload = {
  year: number
  month: number
  day: number
}

export type ReservationTimePayload = {
  hour: number
  minute?: number
  second?: number
}

export interface ReservationForm {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  message: string
  guests: number
  date: CalendarDate
  time: Time
  privacyConsent: boolean
}
