import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { CAFE_CONTACT_EMAIL } from '#shared/utils/constants'
import type { ContactMessage, ContactSubject, Reservation } from '#shared/utils/types'

const getMailgunClient = () => {
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

  return { config, mg }
}

const contactSubjectLabels: Record<ContactSubject, string> = {
  general: 'General question',
  reservation: 'Reservation',
  events: 'Events',
  menu: 'Menu',
  feedback: 'Feedback',
  other: 'Other'
}

const getContactConfirmationText = (message: ContactMessage) => {
  const greeting = message.locale === 'de'
    ? `Hallo ${message.firstName},`
    : `Hi ${message.firstName},`

  const body = message.locale === 'de'
    ? 'vielen Dank fuer deine Nachricht an Cafe Prana. Ich habe sie erhalten und melde mich so bald wie moeglich bei dir.'
    : 'Thank you for your message to Cafe Prana. I have received it and will get back to you as soon as possible.'

  const reference = message.locale === 'de'
    ? `Dein Thema: ${contactSubjectLabels[message.subject as ContactSubject]}`
    : `Your subject: ${contactSubjectLabels[message.subject as ContactSubject]}`

  const closing = message.locale === 'de'
    ? `Liebe Gruesse\nCafe Prana`
    : `Warmly\nCafe Prana`

  return [greeting, body, reference, closing].join('\n\n')
}

// Collapses line breaks a guest typed into a one-line field, so it cannot
// start a line of its own in the email body or spill out of the subject.
const singleLine = (value: string) => value.replace(/\s+/g, ' ').trim()

// Reservations are not stored anywhere else, so this email is the record of
// the booking, including when the guest gave privacy consent.
export const sendReservationEmail = async (reservation: Reservation, consentedAt: string) => {
  const { config, mg } = getMailgunClient()
  const firstName = singleLine(reservation.firstName)
  const lastName = singleLine(reservation.lastName)
  const email = singleLine(reservation.email)

  // `Time` prints as `HH:MM:SS`; slots are on the minute.
  const textBody = `
New reservation received:

First name: ${firstName}
Last name: ${lastName}
Email: ${email}
Phone: ${reservation.phone ? singleLine(reservation.phone) : '-'}
Guests: ${reservation.guests}
Date: ${reservation.date.toString()}
Time: ${reservation.time.toString().slice(0, 5)}
Privacy consent: ${consentedAt}
Message:
${reservation.message || '-'}
`.trim()

  try {
    return await mg.messages.create(config.mailgunDomain, {
      'from': config.reservationEmailFrom,
      'to': config.reservationEmailTo,
      'bcc': config.reservationEmailBcc,
      'subject': `Reservation from ${firstName} ${lastName}`,
      'text': textBody,
      'h:Reply-To': email
    })
  } catch (error) {
    console.error('Error sending reservation email', error)
    throw error
  }
}

export const sendContactEmail = async (message: ContactMessage) => {
  const { config, mg } = getMailgunClient()
  const fullName = `${message.firstName} ${message.lastName}`.trim()
  const subjectLabel = contactSubjectLabels[message.subject as ContactSubject]

  const textBody = `
New contact message received:

First name: ${message.firstName}
Last name: ${message.lastName}
Email: ${message.email}
Phone: ${message.phone || '-'}
Subject: ${subjectLabel}
Locale: ${message.locale}
Privacy consent: ${message.privacyConsent ? 'Yes' : 'No'}

Message:
${message.message}
`.trim()

  try {
    const ownerEmail = await mg.messages.create(config.mailgunDomain, {
      'from': config.contactEmailFrom,
      'to': config.contactEmailTo || CAFE_CONTACT_EMAIL,
      'subject': `Contact message from ${fullName}: ${subjectLabel}`,
      'text': textBody,
      'h:Reply-To': message.email
    })

    let confirmationSent = false

    try {
      await mg.messages.create(config.mailgunDomain, {
        'from': config.contactEmailFrom,
        'to': message.email,
        'subject': message.locale === 'de'
          ? 'Danke fuer deine Nachricht an Cafe Prana'
          : 'Thank you for contacting Cafe Prana',
        'text': getContactConfirmationText(message),
        'h:Reply-To': config.contactEmailTo || CAFE_CONTACT_EMAIL
      })

      confirmationSent = true
    } catch (error) {
      console.error('Error sending contact confirmation email', error)
    }

    return { ownerEmail, confirmationSent }
  } catch (error) {
    console.error('Error sending contact email', error)
    throw error
  }
}
