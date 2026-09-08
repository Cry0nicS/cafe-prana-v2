import type { OpeningHours } from '#shared/utils/opening-hours'

// Mirrors content/opening-hours.yml closely enough for the tests: closed on
// Monday, weekdays until 15:00 (Tuesday 16:00), weekends 09:00 to 17:00, and
// the last booking an hour before closing. The exceptions are the two kinds the
// owner can write: a closed weekday opened for an evening event, and an open
// weekday closed for a holiday.
export const testOpeningHours: OpeningHours = {
  lastReservationBeforeClosing: 60,
  hours: [
    { day: 'monday', closed: true },
    { day: 'tuesday', opens: '07:30', closes: '16:00' },
    { day: 'wednesday', opens: '07:30', closes: '15:00' },
    { day: 'thursday', opens: '07:30', closes: '15:00' },
    { day: 'friday', opens: '07:30', closes: '15:00' },
    { day: 'saturday', opens: '09:00', closes: '17:00' },
    { day: 'sunday', opens: '09:00', closes: '17:00' }
  ],
  reservationExceptions: [
    // Monday 2026-08-17: normally closed, opened for a dinner.
    { date: '2026-08-17', bookableFrom: '17:00', bookableUntil: '20:00', note: 'Summer dinner' },
    // Tuesday 2026-08-11: normally open, closed for a holiday.
    { date: '2026-08-11', closed: true, note: 'Public holiday' }
  ]
}

// What the mocked `@nuxt/content/server` query resolves to in the route tests.
// Tests set it to `null` to simulate a missing document.
export const openingHoursDocument: { value: OpeningHours | null } = { value: testOpeningHours }
