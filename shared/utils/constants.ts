export const CAFE_CONTACT_EMAIL = 'info@cafeprana.de'
export const CAFE_CONTACT_MAILTO = `mailto:${CAFE_CONTACT_EMAIL}`
export const CAFE_SITE_URL = 'https://www.cafeprana.de'
export const CAFE_NAME = 'Cafe Prana'
export const CAFE_LEGAL_NAME = 'Cafe Prana Berlin'
export const CAFE_ADDRESS = {
  street: 'Pasteurstrasse 2',
  postalCode: '10407',
  city: 'Berlin',
  country: 'DE'
}
export const CAFE_PHONE = '+4915236848480'
export const CAFE_INSTAGRAM_URL = 'https://instagram.com/pranacafe'
export const CAFE_MAPS_URL = 'https://maps.app.goo.gl/MToiG3VyXv7PB8kw9'
export const CAFE_MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2426.9518671037786!2d13.428888413148465!3d52.53430503505275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84fb49a2ba2a9%3A0xa2e6d18bdc39e1de!2sCaf%C3%A9%20Prana!5e0!3m2!1sen!2sde!4v1762693543237!5m2!1sen!2sde'
export const CAFE_GEO = {
  latitude: 52.53430503505275,
  longitude: 13.428888413148465
}
// Weekdays the cafe is closed for reservations (0 = Sunday, 1 = Monday, ...).
// Keep in sync with the opening hours shown on the homepage.
export const CAFE_CLOSED_WEEKDAYS = [1]
// Reservation time window, in 'HH:mm' with the step in seconds. The schema
// validates against it and the form offers exactly these slots.
export const CAFE_RESERVATION_TIME = { min: '07:00', max: '16:00', step: 900 }

const toSeconds = (value: string) => {
  const [hours = 0, minutes = 0] = value.split(':').map(Number)

  return hours * 3600 + minutes * 60
}

const toLabel = (seconds: number) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const CAFE_RESERVATION_TIME_SECONDS = {
  min: toSeconds(CAFE_RESERVATION_TIME.min),
  max: toSeconds(CAFE_RESERVATION_TIME.max),
  step: CAFE_RESERVATION_TIME.step
}

// Every bookable time: '07:00', '07:15', ..., '16:00'.
export const CAFE_RESERVATION_TIME_SLOTS = Array.from(
  { length: Math.floor((CAFE_RESERVATION_TIME_SECONDS.max - CAFE_RESERVATION_TIME_SECONDS.min) / CAFE_RESERVATION_TIME_SECONDS.step) + 1 },
  (_, index) => toLabel(CAFE_RESERVATION_TIME_SECONDS.min + index * CAFE_RESERVATION_TIME_SECONDS.step)
)
