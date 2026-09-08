// Fails when a published, upcoming event cannot be booked at its start time.
//
// The reservation form follows `content/opening-hours.yml`, so an event that
// runs outside those hours - a dinner at 18:30 on a day the counter closes at
// 15:00, or anything on a Monday - needs a row in that file's
// `reservationExceptions` before a guest can reserve for it. Forgetting the row
// used to surface as a guest who could not book; now it is a red build with a
// one-line fix the owner makes herself in Studio.
//
// Events whose time field holds no `HH:MM` are reported as unchecked rather
// than passed or failed; walk-in and past events are skipped. A recurring
// series is only known by its single document date, so later sessions are not
// checked. See docs/reservation-availability.md.
//
// TypeScript, because the verdict comes from the same modules the form and
// the API use, and the source of truth should not be re-implemented for a
// check. Run through `jiti` (`npm run check:events`).
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { parseFrontMatter } from 'remark-mdc'
import { toOpeningHours } from '../shared/utils/opening-hours'
import type { OpeningHours, OpeningHoursDocument } from '../shared/utils/opening-hours'
import { checkEventBookability } from './event-bookability'
import type { EventCheck, EventFrontmatter } from './event-bookability'

const ROOT = resolve(import.meta.dirname, '..')
const OPENING_HOURS = join(ROOT, 'content', 'opening-hours.yml')
const EVENTS = join(ROOT, 'content', 'events')

// Studio reads a data file as frontmatter without the fences, so wrapping it
// in them here parses it the same way the Studio parity check does.
const readOpeningHours = async (): Promise<OpeningHours> => {
  const source = await readFile(OPENING_HOURS, 'utf8')
  const { data } = parseFrontMatter(`---\n${source}\n---`) as { data: Partial<OpeningHoursDocument> }

  if (!Array.isArray(data.hours)) {
    throw new Error(`${relative(ROOT, OPENING_HOURS)} has no \`hours\` list`)
  }

  return toOpeningHours({ ...data, hours: data.hours })
}

const readEvents = async (): Promise<EventFrontmatter[]> => {
  const files = (await readdir(EVENTS)).filter(file => file.endsWith('.md')).sort()

  return Promise.all(files.map(async (file) => {
    const path = join(EVENTS, file)
    const { data } = parseFrontMatter(await readFile(path, 'utf8')) as { data: Record<string, unknown> }

    return {
      path: relative(ROOT, path),
      title: typeof data.title === 'string' ? data.title : undefined,
      date: data.date instanceof Date || typeof data.date === 'string' ? data.date : String(data.date ?? ''),
      time: typeof data.time === 'string' ? data.time : data.time === undefined ? undefined : String(data.time),
      reservation: typeof data.reservation === 'string' ? data.reservation : undefined
    }
  }))
}

const MARK: Record<EventCheck['status'], string> = {
  bookable: '✔',
  unbookable: '✖',
  unchecked: '⚠',
  skipped: '·'
}

const openingHours = await readOpeningHours()
const events = await readEvents()
const now = new Date()

const results = events.map(event => checkEventBookability(event, openingHours, now))

for (const result of results) {
  const line = `${MARK[result.status]} ${result.path}: ${result.title} - ${result.detail}`

  if (result.status === 'unbookable') {
    console.error(line)
  } else {
    console.log(line)
  }
}

const count = (status: EventCheck['status']) => results.filter(result => result.status === status).length
const unbookable = count('unbookable')
const unchecked = count('unchecked')

console.log('')
console.log(
  `${count('bookable')} bookable, ${unbookable} unbookable, ${unchecked} unchecked, ${count('skipped')} skipped `
  + `(past or walk-in) of ${results.length} event files`
)

if (unchecked > 0) {
  console.warn('⚠ unchecked events have no HH:MM in their time field, so nothing can be said about them.')
}

if (unbookable > 0) {
  console.error('')
  console.error('✖ an upcoming event cannot be booked at its start time.')
  console.error('  Add a row for its date under `reservationExceptions` in content/opening-hours.yml')
  console.error('  (in Studio: Opening Hours) whose bookable range contains the start time.')
  console.error('  See docs/reservation-availability.md.')
  process.exitCode = 1
}
