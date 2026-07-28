import * as z from 'zod'
import { ReservationSchema } from '#shared/utils/schemas'
import type { Database } from '#shared/utils/types'
import { insertReservation } from '~~/server/repositories/reservations'
import { sendReservationEmail } from '~~/server/services/email'
import { useServerSupabaseClient } from '~~/server/utils/supabase'

type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

export default defineEventHandler(async (event) => {
  let body: unknown

  try {
    body = await readBody(event)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error while reading reservation body',
      message: error instanceof Error ? error.message : String(error),
      data: error
    })
  }

  const result = ReservationSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      message: z.prettifyError(result.error),
      data: result.error.issues
    })
  }

  const client = useServerSupabaseClient()

  const reservationData: ReservationInsert = {
    date: result.data.date.toString(),
    email: result.data.email,
    first_name: result.data.firstName,
    guests: result.data.guests,
    last_name: result.data.lastName,
    message: result.data.message ?? null,
    phone: result.data.phone,
    // Record proof + time of consent (schema guarantees it was given).
    privacy_consent: new Date().toISOString(),
    time: result.data.time.toString()
  }

  // Store the reservation first. insertReservation throws a 500 on failure,
  // so if this rejects nothing was saved and the guest sees a genuine error.
  const reservation = await insertReservation(client, reservationData)

  // The reservation is safely stored at this point. A failed notification
  // email must NOT fail the request, or the guest would resubmit and create a
  // duplicate. Report it via `emailSent` and log it instead.
  let emailSent = true

  try {
    await sendReservationEmail(reservation)
  } catch (error) {
    emailSent = false
    console.error('Reservation stored but notification email failed', error)
  }

  return {
    message: 'Reservation created successfully',
    emailSent,
    reservation
  }
})
