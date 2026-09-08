// The hours the cafe is open, as shown on the site and published as structured
// data. Purely presentational: what can be *booked* is configured separately in
// `reservations.ts`, because events regularly run outside these hours.
import { slotRange, toMinutes } from './calendar'
import type { Weekday } from './calendar'

export type OpeningHoursEntry = {
  day: Weekday
  closed?: boolean
  opens?: string
  closes?: string
}

export type OpeningHours = {
  hours: OpeningHoursEntry[]
}

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
