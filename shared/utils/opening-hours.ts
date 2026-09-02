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

// 2024-01-01 was a Monday. Formatting a fixed week in UTC gives the localized
// weekday names without depending on the visitor's clock or time zone.
const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1)
const DAY_MS = 24 * 60 * 60 * 1000

export const weekdayLabel = (day: Weekday, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(REFERENCE_MONDAY_UTC + WEEKDAYS.indexOf(day) * DAY_MS))

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
