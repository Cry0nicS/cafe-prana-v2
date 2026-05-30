import formData from 'form-data'
import Mailgun from 'mailgun.js'
import type { Database } from '#shared/utils/types'

type ReservationRow = Database['public']['Tables']['reservations']['Row']

export const sendReservationEmail = async (reservation: ReservationRow) => {
  const config = useRuntimeConfig()

  if (!config.mailgunKey || !config.mailgunBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Mailgun is not configured'
    })
  }

  const mailgun = new Mailgun(formData)
  const mg = mailgun.client({
    username: 'api',
    key: config.mailgunKey,
    url: config.mailgunBaseUrl
  })

  const textBody = `
New reservation received:

First name: ${reservation.first_name}
Last name: ${reservation.last_name}
Email: ${reservation.email}
Phone: ${reservation.phone || '-'}
Guests: ${reservation.guests}
Date: ${reservation.date}
Time: ${reservation.time}
Message:
${reservation.message || '-'}
`.trim()

  try {
    return await mg.messages.create(config.mailgunDomain, {
      'from': config.reservationEmailFrom,
      'to': config.reservationEmailTo,
      'bcc': config.reservationEmailBcc,
      'subject': `Reservation from ${reservation.first_name} ${reservation.last_name}`,
      'text': textBody,
      'h:Reply-To': reservation.email
    })
  } catch (error) {
    console.error('Error sending reservation email', error)
    throw error
  }
}
