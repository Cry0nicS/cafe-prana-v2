# When guests can book a table

This guide is for the café owner. It explains which days and times the reservation form offers,
and how to open or close a single date — for an evening event, a public holiday or a week off —
yourself in Studio, with no developer involved.

## One file: Opening Hours

Everything lives in **Opening Hours** (`content/opening-hours.yml`), the same file that shows
your hours on the homepage and tells search engines when you are open. It has three parts:

| Part | What it does |
|------|--------------|
| The **week** (`hours`) | One row per weekday with `opens` and `closes`, or `closed` switched on. This is what the site shows, and it is also what guests can book on an ordinary day. |
| `lastReservationBeforeClosing` | How many minutes before closing the last booking is taken. With `60` and a 15:00 close, the last slot offered is 14:00. |
| `reservationExceptions` | Single dates that do not follow their weekday for bookings. See below. |

On an ordinary day the form offers 15-minute slots from your opening time up to
`lastReservationBeforeClosing` minutes before you close, and a weekday marked closed cannot be
booked. Change the week and the form follows — you maintain one set of hours, not two.

## Opening a date for an event

When you publish an event that runs outside your normal hours — a dinner at 18:30, or anything
on a Monday — guests cannot book for it until you open that date. In the same Studio session:

1. Open **Opening Hours**.
2. Under `reservationExceptions`, add a row.
3. Pick the **date** with the date picker.
4. Set `bookableFrom` and `bookableUntil` from the time dropdown. These are the times guests may
   choose, exactly as written: with `17:00` to `19:00`, the first slot offered is 17:00 and the
   last one is 19:00. No margin is taken off here, unlike the weekly hours.
5. Write a short **note** — the event name is enough — so the list still makes sense to you in
   six months.
6. Publish.

An exception replaces the weekday for that date entirely. A Monday with a row from 17:00 to 19:00
offers exactly those slots and nothing else; a Saturday with a row from 10:00 to 12:00 offers
those slots and not the usual morning ones. Make the range contain the event's start time, and
give guests some room either side — an hour before and an hour after is a sensible default.

## Closing a date

For a public holiday, a private booking or a week of vacation, add a row with the **date** and
switch **closed** on. That date stops taking bookings without touching your weekly hours. A week
off is one row per day.

If the closure is news your visitors should see, pair it with a **site notice**
(`docs/site-notice.md`); the exception only affects the form.

## What the site shows

The homepage and the structured data for search engines always show the **weekly** hours. An
exception opened for one evening does not advertise the café as open on Mondays, and a closed
date does not remove the day from the displayed week.

## Things to know

- **Past rows are harmless.** You do not have to prune the list; the form cannot offer a past
  date anyway. Delete old rows whenever you like.
- **Two rows for the same date**: the first one wins. Keep one row per date.
- **A row without times and without closed** counts as closed — it cannot invent hours.
- **A check watches for events nobody can book.** After anything is published, it goes over the
  upcoming events: if one says booking is required or recommended and its start time is not a
  bookable slot on its date, the check fails and names the event, the date and the slots that day
  does offer. The fix is the row described above.

  Three kinds of event it cannot judge, and reports as unchecked instead: one whose time field
  holds no `HH:MM` (say "Evening"), one that names several times without saying which starts it
  ("Doors 17:30, dinner 18:30"), and a repeating event ("Thursdays at 17:00"), because only the
  one date you filled in exists in the content. For those, check the date yourself.

  Treat the check as a safety net a developer watches, not as your own signal: it runs after you
  publish, in a place you do not normally look. The habit that keeps guests able to book is
  adding the row in the same session as the event.

## For developers

- **Rules**: `shared/utils/reservations.ts` — pure functions over the opening hours document.
  `reservationSlotsOn` gives the slots for a date and `validateReservationSlot` says whether a
  date and time can be booked, naming `date` or `time` as the problem. An exception for the date
  wins entirely (first row wins on duplicates); otherwise the weekday entry applies with the
  margin. The margin is never applied to an exception. Specified in `test/unit/reservations.spec.ts`.
- **Reading the document**: `toOpeningHours` in `shared/utils/opening-hours.ts` is the only way
  in. @nuxt/content types the columns from the collection schema but never validates stored
  content against it, so whatever a hand edit or a half-saved Studio row wrote arrives as it is.
  That function fills in the default margin, clamps it into range (a negative margin would take
  bookings after closing) and drops exception rows without a usable date (comparing one would
  throw on every page that offers slots). The rules downstream can then be plain arithmetic.
  `test/unit/opening-hours.spec.ts` covers it, and `test/unit/opening-hours-content.spec.ts`
  holds the shipped file itself to the grid, to unique real dates, and to slots the reservation
  schema accepts.
- **Every row writes `closed:` out, `false` included.** Studio looks for unsaved changes by
  walking the keys of the *file* and finding each one in the edit, so a key the edit adds is
  never compared: on a row that omitted the flag, ticking **closed** left Studio seeing no
  change at all and the owner unable to commit it without editing a time alongside. Defaults do
  not save it - @nuxt/content applies those to top-level columns only, never to a row inside an
  array. `content.config.ts` has the detail, and
  `test/unit/opening-hours-content.spec.ts` fails if one of the seven weekdays loses the flag.
- **Exception rows are not held to that, on purpose.** Studio adds a new array row as an empty
  object and fills in only what the owner touches, so a test would fail on the owner's own push
  and leave them no way to fix it from Studio. If an exception row that already exists needs
  **closed** ticked and the change will not save, delete the row and add it back with the box
  ticked - a row appearing or disappearing is a change Studio does see.
- **Consumers**: the form (`app/components/reservations/Form.vue`) reads the document through
  `useOpeningHours` and distinguishes a failed load from a closed day, because "no slots" for
  every date is our problem and not an answer about the cafe; the route
  (`server/api/reservations/index.post.ts`) reads it through `server/utils/opening-hours.ts`,
  which fails the request with a 500 when the document is missing rather than treating the site
  as unbookable.
- **Guard**: `scripts/check-event-bookability.ts` (`npm run check:events`, run in CI). The
  verdict lives in `scripts/event-bookability.ts` so it is unit-tested directly
  (`test/unit/event-bookability.spec.ts`); the script owns the filesystem and the reporting. It
  runs under `jiti` because the verdict imports the same TypeScript modules the form uses. It
  reads the start time from the free-form `time` field only when that is unambiguous — a single
  time, or the start of a range — and reports anything else as unchecked, including a repeating
  time field, whose later sessions exist nowhere in the content. Past events are judged on the
  cafe's own day (Europe/Berlin) rather than the events page's `isUpcomingEvent`, which
  truncates to the *visitor's* midnight: right in a browser, but it makes a local run and a UTC
  runner disagree about an event dated today.
- **What the guard cannot do**: stop an unbookable event reaching guests. Studio publishes
  straight to `main` and Vercel deploys from that push, both independently of Actions, so a
  failure lands after the deploy and in a place the owner does not watch — it names the problem
  for whoever is looking (including in the GitHub run summary) rather than preventing it. Making
  that gap smaller means either notifying the owner from CI or failing the build itself, and
  failing the build takes the whole site down for one missing row.
- **Schema** (`content.config.ts`): `lastReservationBeforeClosing` is a plain number with
  `.multipleOf(1)`, deliberately not `.int()` — `int()` emits JSON-schema `type: "integer"`, which
  @nuxt/content stores as TEXT, so the built site holds `"60"` where the file holds `60` and
  Studio reports a permanent conflict on the file. The exceptions are an array of objects because
  a top-level date field becomes a DATE column that throws on the empty string Studio writes for
  a cleared picker. After any change to this collection, run `npm run build` then
  `npm run check:studio`.
