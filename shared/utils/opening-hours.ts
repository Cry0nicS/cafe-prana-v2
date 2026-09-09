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

// The document once it has been through `toOpeningHours`: every field present
// and within its bounds, so the booking rules can be plain arithmetic.
export type OpeningHours = {
  hours: OpeningHoursEntry[]
  // Minutes before closing at which the last reservation slot is taken.
  lastReservationBeforeClosing: number
  reservationExceptions: ReservationException[]
}

// What applies when the content file does not say.
export const DEFAULT_LAST_RESERVATION_BEFORE_CLOSING = 60

// A margin longer than this is a typo rather than an intention; the schema
// offers the same ceiling in Studio.
export const MAX_LAST_RESERVATION_BEFORE_CLOSING = 240

// The document as the content database or a YAML parse hands it over.
//
// The schema in `content.config.ts` types the columns, but @nuxt/content never
// runs it against the stored content: a hand edit or a half-saved Studio row
// reaches the site exactly as written. So the types here describe the happy
// path and `toOpeningHours` below checks what actually arrived.
export type OpeningHoursDocument = {
  hours?: OpeningHoursEntry[] | null
  lastReservationBeforeClosing?: number | null
  reservationExceptions?: (ReservationException | null | undefined)[] | null
}

const asOptionalTime = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined

// A row whose date is missing or is not a date cannot apply to any date, and
// comparing it would throw on every page that offers slots. Dropping it leaves
// that date on its weekday hours, which is the only reading available.
const toReservationException = (row: ReservationException | null | undefined): ReservationException | null => {
  if (!row || typeof row.date !== 'string' || row.date.trim() === '') {
    return null
  }

  return {
    date: row.date.trim(),
    closed: Boolean(row.closed),
    bookableFrom: asOptionalTime(row.bookableFrom),
    bookableUntil: asOptionalTime(row.bookableUntil),
    note: typeof row.note === 'string' ? row.note : undefined
  }
}

// Whole minutes inside the bounds. A negative margin would push the last slot
// past closing time and take bookings after the cafe has shut.
export const toReservationMargin = (minutes: unknown) => {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) {
    return DEFAULT_LAST_RESERVATION_BEFORE_CLOSING
  }

  return Math.min(Math.max(Math.round(minutes), 0), MAX_LAST_RESERVATION_BEFORE_CLOSING)
}

// Every reader of the document - the composable, the server util and the event
// guard - goes through here, so a missing, malformed or out-of-range value
// means the same thing everywhere, and means it in one place.
export const toOpeningHours = (document: OpeningHoursDocument): OpeningHours => ({
  hours: Array.isArray(document.hours) ? document.hours.filter(entry => Boolean(entry)) : [],
  lastReservationBeforeClosing: toReservationMargin(document.lastReservationBeforeClosing),
  reservationExceptions: (Array.isArray(document.reservationExceptions) ? document.reservationExceptions : [])
    .map(toReservationException)
    .filter((exception): exception is ReservationException => exception !== null)
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
