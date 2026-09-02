export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const

export type Weekday = typeof WEEKDAYS[number]

export type OpeningHoursEntry = {
  day: Weekday
  closed?: boolean
  opens?: string
  closes?: string
}

export type OpeningHours = {
  hours: OpeningHoursEntry[]
  // Minutes before closing time at which the last reservation slot ends.
  lastReservationBeforeClosing: number
}

export type DateParts = { year: number, month: number, day: number }
export type TimeParts = { hour: number, minute: number }

// Every time on the site is on this grid: opening and closing times in the
// content file, and the reservation slots offered to guests.
export const SLOT_MINUTES = 15

const toMinutes = (value: string) => {
  const [hours = 0, minutes = 0] = value.split(':').map(Number)

  return hours * 60 + minutes
}

const toLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const range = (fromMinutes: number, toMinutes: number) => {
  const slots: string[] = []

  for (let minutes = fromMinutes; minutes <= toMinutes; minutes += SLOT_MINUTES) {
    slots.push(toLabel(minutes))
  }

  return slots
}

// The choices Studio offers for an opening or closing time.
export const OPENING_TIME_OPTIONS = range(toMinutes('06:00'), toMinutes('23:00'))

// 2024-01-01 was a Monday. Formatting a fixed week in UTC gives the localized
// weekday names without depending on the visitor's clock or time zone.
const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1)
const DAY_MS = 24 * 60 * 60 * 1000

export const weekdayLabel = (day: Weekday, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(REFERENCE_MONDAY_UTC + WEEKDAYS.indexOf(day) * DAY_MS))

export const weekdayOf = (date: DateParts): Weekday =>
  WEEKDAYS[(new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() + 6) % 7]!

export const isOpen = (entry: OpeningHoursEntry): entry is OpeningHoursEntry & { opens: string, closes: string } =>
  !entry.closed && Boolean(entry.opens) && Boolean(entry.closes)

// '07:30 – 15:00', or null for a closed day so the caller can localize 'Closed'.
export const formatOpeningHours = (entry: OpeningHoursEntry) =>
  isOpen(entry) ? `${entry.opens} – ${entry.closes}` : null

export const openingHoursFor = (openingHours: OpeningHours, date: DateParts) =>
  openingHours.hours.find(entry => entry.day === weekdayOf(date))

// The bookable slots on a given day: from opening time up to the last slot
// that still leaves `lastReservationBeforeClosing` minutes before closing.
// Empty when the day is closed.
export const reservationSlotsOn = (openingHours: OpeningHours, date: DateParts) => {
  const entry = openingHoursFor(openingHours, date)

  if (!entry || !isOpen(entry)) {
    return []
  }

  return range(toMinutes(entry.opens), toMinutes(entry.closes) - openingHours.lastReservationBeforeClosing)
}

export type ReservationSlotIssue = { path: 'date' | 'time', message: string }

// Checks a date and time against the opening hours. The message is an i18n key
// the form translates and the API passes through, like the schema messages.
export const validateReservationSlot = (
  openingHours: OpeningHours,
  date: DateParts,
  time: TimeParts
): ReservationSlotIssue | null => {
  const slots = reservationSlotsOn(openingHours, date)

  if (slots.length === 0) {
    return { path: 'date', message: 'reservations.form.errors.date.closed' }
  }

  if (!slots.includes(toLabel(time.hour * 60 + time.minute))) {
    return { path: 'time', message: 'reservations.form.errors.time.unavailable' }
  }

  return null
}

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
