import { readFileSync } from 'node:fs'
import { parseFrontMatter } from 'remark-mdc'
import { describe, expect, it } from 'vitest'
import { WEEKDAYS, toDateKey, weekdayOf } from '#shared/utils/calendar'
import type { DateParts } from '#shared/utils/calendar'
import { isOpen, toOpeningHours, toReservationMargin } from '#shared/utils/opening-hours'
import type { OpeningHoursDocument } from '#shared/utils/opening-hours'
import { reservationSlotsOn } from '#shared/utils/reservations'
import { ReservationSchema } from '#shared/utils/schemas'

// The real file the site ships, not a fixture. Nothing else checks the values
// in it: @nuxt/content types the columns from `content.config.ts` but never
// validates the stored content against that schema, so a time written off the
// 15-minute grid would reach guests as slots the reservation schema then
// rejects - an error they cannot do anything about.
const source = readFileSync(new URL('../../content/opening-hours.yml', import.meta.url), 'utf8')
const { data } = parseFrontMatter(`---\n${source}\n---`) as { data: OpeningHoursDocument }
const openingHours = toOpeningHours(data)

const ON_THE_GRID = /^([01]\d|2[0-3]):(00|15|30|45)$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// One date per weekday, so every row of the week is exercised: the week of
// Monday 2026-08-10 to Sunday 2026-08-16.
const WEEK_OF = WEEKDAYS.map((day, index) => {
  const date: DateParts = { year: 2026, month: 8, day: 10 + index }

  expect(weekdayOf(date), 'the fixed week must line up with the weekdays').toBe(day)

  return { day, date }
})

const asDateParts = (key: string): DateParts => {
  const [year, month, day] = key.split('-').map(Number)

  return { year: year!, month: month!, day: day! }
}

describe('content/opening-hours.yml', () => {
  it('holds a margin the reader does not have to correct', () => {
    expect(data.lastReservationBeforeClosing).toBe(openingHours.lastReservationBeforeClosing)
    expect(toReservationMargin(openingHours.lastReservationBeforeClosing))
      .toBe(openingHours.lastReservationBeforeClosing)
  })

  it('describes all seven weekdays exactly once', () => {
    expect(openingHours.hours.map(entry => entry.day)).toEqual([...WEEKDAYS])
  })

  // Studio compares the edited document against the file one way round: it
  // walks the keys of the FILE and looks each one up in the edit
  // (`doObjectsMatch` in `nuxt-studio/.../utils/object.js`). A key the edit
  // ADDS is therefore never compared, the document stays `Pristine`, and the
  // owner gets no commit to make. Ticking `closed` on a day written without
  // the key was exactly that: the change could only be saved by editing a
  // second field alongside it. Writing every flag out, including the `false`
  // ones the schema default would supply anyway, turns the toggle into a value
  // change - which Studio does see. This reads the parsed file rather than
  // `openingHours`, because `toOpeningHours` fills the flag in and would hide
  // precisely what is being checked.
  it('writes every closed flag explicitly, so Studio can commit a toggle', () => {
    for (const entry of data.hours ?? []) {
      expect(entry?.closed, `${entry?.day} has no explicit closed:`).toBeTypeOf('boolean')
    }

    for (const exception of data.reservationExceptions ?? []) {
      expect(exception?.closed, `${exception?.date} has no explicit closed:`).toBeTypeOf('boolean')
    }
  })

  it('keeps every opening and closing time on the slot grid, the right way round', () => {
    for (const entry of openingHours.hours) {
      if (!isOpen(entry)) {
        expect(entry.closed, `${entry.day} is neither open nor marked closed`).toBe(true)
        continue
      }

      expect(entry.opens, `${entry.day} opens`).toMatch(ON_THE_GRID)
      expect(entry.closes, `${entry.day} closes`).toMatch(ON_THE_GRID)
      expect(entry.closes > entry.opens, `${entry.day} closes before it opens`).toBe(true)
    }
  })

  it('writes every exception on a real, unique date', () => {
    const dates = openingHours.reservationExceptions.map(exception => exception.date)

    expect(new Set(dates).size, 'two exceptions name the same date').toBe(dates.length)

    for (const date of dates) {
      expect(date).toMatch(ISO_DATE)
      // A date that survives the round trip is a date that exists.
      expect(toDateKey(asDateParts(date))).toBe(date)
    }
  })

  it('gives every exception either a closure or a usable window', () => {
    for (const exception of openingHours.reservationExceptions) {
      const label = `${exception.date} (${exception.note ?? 'no note'})`

      if (exception.closed) {
        expect(reservationSlotsOn(openingHours, asDateParts(exception.date)), label).toEqual([])
        continue
      }

      expect(exception.bookableFrom, `${label} bookableFrom`).toMatch(ON_THE_GRID)
      expect(exception.bookableUntil, `${label} bookableUntil`).toMatch(ON_THE_GRID)
      // An exception that opens a date but offers no slot is a row that looks
      // like it works and quietly does not.
      expect(reservationSlotsOn(openingHours, asDateParts(exception.date)).length, `${label} offers no slot`)
        .toBeGreaterThan(0)
    }
  })

  // The form can only submit what it offers, so every slot the shipped
  // document produces has to survive the schema the API validates with.
  it('only ever offers slots the reservation schema accepts', () => {
    const dates = [
      ...WEEK_OF.map(({ date }) => date),
      ...openingHours.reservationExceptions.map(exception => asDateParts(exception.date))
    ]

    for (const date of dates) {
      for (const slot of reservationSlotsOn(openingHours, date)) {
        expect(ReservationSchema.shape.time.safeParse(slot).success, `${toDateKey(date)} offers ${slot}`).toBe(true)
      }
    }
  })
})
