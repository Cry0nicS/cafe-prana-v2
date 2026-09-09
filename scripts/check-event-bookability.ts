// Fails when a published, upcoming event cannot be booked at its start time.
//
// The reservation form follows `content/opening-hours.yml`, so an event that
// runs outside those hours - a dinner at 18:30 on a day the counter closes at
// 15:00, or anything on a Monday - needs a row in that file's
// `reservationExceptions` before a guest can reserve for it. Forgetting the row
// otherwise surfaces as a guest who could not book; this turns it into a named
// failure with a one-line fix the owner makes herself in Studio.
//
// It reports rather than prevents: Studio publishes straight to main and Vercel
// deploys from that push, both independently of Actions, so this runs after the
// deploy. See the note in docs/reservation-availability.md.
//
// Reported as unchecked rather than passed or failed: an event whose time
// field holds no `HH:MM`, one that names several times without saying which
// starts it, and a recurring series, whose later sessions are nowhere in the
// content. Walk-in and past events are skipped.
// See docs/reservation-availability.md.
//
// TypeScript, because the verdict comes from the same modules the form and
// the API use, and the source of truth should not be re-implemented for a
// check. Run through `jiti` (`npm run check:events`).
import { appendFileSync } from 'node:fs'
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

const of = (status: EventCheck['status']) => results.filter(result => result.status === status)
const unbookable = of('unbookable')
const unchecked = of('unchecked')

const tally
  = `${of('bookable').length} bookable, ${unbookable.length} unbookable, ${unchecked.length} unchecked, `
    + `${of('skipped').length} skipped (past or walk-in) of ${results.length} event files`

console.log('')
console.log(tally)

if (unchecked.length > 0) {
  console.warn('⚠ nothing can be said about the unchecked events above; read their time field yourself.')
}

// A CI log is not where this is read: the owner publishes from Studio and sees
// GitHub's run summary at best, so the failure has to explain itself there.
const summarise = (markdown: string) => {
  const path = process.env.GITHUB_STEP_SUMMARY

  if (path) {
    appendFileSync(path, `${markdown}\n`)
  }
}

const list = (checks: EventCheck[]) =>
  checks.map(check => `- **${check.title}** (\`${check.path}\`) - ${check.detail}`).join('\n')

if (unbookable.length > 0) {
  const fix
    = 'Open **Opening Hours** in Studio and add a row under `reservationExceptions` for that date, '
      + 'with a bookable range that contains the start time. '
      + 'See [docs/reservation-availability.md](docs/reservation-availability.md).'

  console.error('')
  console.error('✖ an upcoming event cannot be booked at its start time.')
  console.error('  Add a row for its date under `reservationExceptions` in content/opening-hours.yml')
  console.error('  (in Studio: Opening Hours) whose bookable range contains the start time.')
  console.error('  See docs/reservation-availability.md.')

  summarise(`## Guests cannot book these events\n\n${list(unbookable)}\n\n${fix}\n\n${tally}`)
  process.exitCode = 1
} else {
  summarise(
    unchecked.length > 0
      ? `## Every upcoming event is bookable, ${unchecked.length} could not be checked\n\n`
      + `${list(unchecked)}\n\nCheck those by hand.\n\n${tally}`
      : `Every upcoming event is bookable. ${tally}`
  )
}
