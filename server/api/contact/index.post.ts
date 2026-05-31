import * as z from 'zod'
import { ContactSchema } from '#shared/utils/schemas'
import { sendContactEmail } from '~~/server/services/email'

export default defineEventHandler(async (event) => {
  let body: unknown

  try {
    body = await readBody(event)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error while reading contact body',
      message: error instanceof Error ? error.message : String(error),
      data: error
    })
  }

  const result = ContactSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      message: z.prettifyError(result.error),
      data: result.error.issues
    })
  }

  try {
    const response = await sendContactEmail(result.data)

    return {
      message: 'Contact message sent successfully',
      confirmationSent: response.confirmationSent
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error while sending contact message',
      message: error instanceof Error ? error.message : String(error),
      data: error
    })
  }
})
