// The opening hours document, `content/opening-hours.yml`, and the helpers
// that display it. The same document drives what can be booked - see
// `reservations.ts` - but what the site shows and publishes as structured data
// is only ever the weekly hours: an exception opened for one evening must not
// advertise the cafe as open on that weekday.
import { slotRange, toMinutes } from './calendar'
import type { Weekday } from './calendar'

export type OpeningHoursEntry = {
  day: Weekday
  closed?: boolean
  opens?: string
  closes?: string
}

// One date that does not follow its weekday for bookings: either closed, or
// bookable for exactly the range given. The range is a bookable range, not
// opening times - the last slot offered is `bookableUntil` itself, with no
// margin taken off. Times are `HH:MM` on the 15-minute grid, the date
// `YYYY-MM-DD`.
export type ReservationException = {
  date: string
  closed?: boolean
  bookableFrom?: string
  bookableUntil?: string
  note?: string
}

export type OpeningHours = {
  hours: OpeningHoursEntry[]
  // Minutes before closing at which the last reservation slot is taken.
  lastReservationBeforeClosing: number
  reservationExceptions?: ReservationException[]
}

// What applies when the content file does not say.
export const DEFAULT_LAST_RESERVATION_BEFORE_CLOSING = 60

// The document as the content database or a YAML parse hands it over, before
// the defaults are filled in.
export type OpeningHoursDocument = {
  hours: OpeningHoursEntry[]
  lastReservationBeforeClosing?: number | null
  reservationExceptions?: ReservationException[] | null
}

// Every reader of the document - the composable, the server util and the event
// guard - normalises it the same way, so a missing field means the same thing
// everywhere.
export const toOpeningHours = (document: OpeningHoursDocument): OpeningHours => ({
  hours: document.hours,
  lastReservationBeforeClosing: document.lastReservationBeforeClosing ?? DEFAULT_LAST_RESERVATION_BEFORE_CLOSING,
  reservationExceptions: document.reservationExceptions ?? []
})

// The choices Studio offers for an opening or closing time.
export const OPENING_TIME_OPTIONS = slotRange(toMinutes('06:00'), toMinutes('23:00'))

export const isOpen = (entry: OpeningHoursEntry): entry is OpeningHoursEntry & { opens: string, closes: string } =>
  !entry.closed && Boolean(entry.opens) && Boolean(entry.closes)

// '07:30 – 15:00', or null for a closed day so the caller can localize 'Closed'.
export const formatOpeningHours = (entry: OpeningHoursEntry) =>
  isOpen(entry) ? `${entry.opens} – ${entry.closes}` : null

const schemaOrgDay = (day: Weekday) => day.charAt(0).toUpperCase() + day.slice(1)

// schema.org OpeningHoursSpecification entries, one per distinct opens/closes
// pair, listing the days that share it. Closed days are simply absent.
export const toOpeningHoursSpecification = (entries: OpeningHoursEntry[]) => {
  const groups = new Map<string, { dayOfWeek: string[], opens: string, closes: string }>()

  for (const entry of entries) {
    if (!isOpen(entry)) {
      continue
    }

    const key = `${entry.opens}-${entry.closes}`
    const group = groups.get(key) ?? { dayOfWeek: [], opens: entry.opens, closes: entry.closes }

    group.dayOfWeek.push(schemaOrgDay(entry.day))
    groups.set(key, group)
  }

  return Array.from(groups.values()).map(group => ({
    '@type': 'OpeningHoursSpecification',
    ...group
  }))
}
