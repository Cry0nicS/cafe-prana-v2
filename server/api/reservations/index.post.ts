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

  try {
    const reservationData: ReservationInsert = {
      date: result.data.date.toString(),
      email: result.data.email,
      first_name: result.data.firstName,
      guests: result.data.guests,
      last_name: result.data.lastName,
      message: result.data.message ?? null,
      phone: result.data.phone,
      time: result.data.time.toString()
    }

    const reservation = await insertReservation(client, reservationData)

    await sendReservationEmail(reservation)

    return {
      message: 'Reservation updated successfully',
      reservation
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error while creating reservation',
      message: error instanceof Error ? error.message : String(error),
      data: error
    })
  }
})
