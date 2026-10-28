import * as z from 'zod'
import { validateReservationSlot } from '#shared/utils/reservations'
import { ReservationSchema, getReservationValidationMessage } from '#shared/utils/schemas'
import { sendReservationEmail } from '~~/server/services/email'
import { emailFailure } from '~~/server/utils/email-failure'
import { getOpeningHours } from '~~/server/utils/opening-hours'

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

  // The schema only checks the shape; whether the slot exists on that day is
  // decided by the opening hours the cafe maintains in content, read through
  // the same rules the form offers its slots from, so the two cannot drift.
  const openingHours = await getOpeningHours(event)
  const slotIssue = validateReservationSlot(openingHours, result.data.date, result.data.time)

  if (slotIssue) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      message: getReservationValidationMessage(slotIssue.message),
      data: [{ path: [slotIssue.path], message: slotIssue.message }]
    })
  }

  // Record proof + time of consent (schema guarantees it was given).
  const consentedAt = new Date().toISOString()

  // The email is the only record of the booking: nothing is stored, so a
  // failed send must fail the request. The guest sees an error and can submit
  // again without leaving a duplicate behind in any database. A send Mailgun
  // accepted but whose response was lost could still arrive twice, which the
  // cafe can live with.
  try {
    await sendReservationEmail(result.data, consentedAt)

    return {
      message: 'Reservation sent successfully'
    }
  } catch (error) {
    throw emailFailure('Error while sending reservation', error)
  }
})
