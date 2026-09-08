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
- **The build tells you when an event cannot be booked.** Every time content is published, a
  check runs over the upcoming events. If one says booking is required or recommended and its
  start time is not a bookable slot on its date, the check fails and names the event, the date
  and the slots that day offers. The fix is the row described above. Walk-in events and past
  events are not checked; an event whose time field holds no `HH:MM` (say "Evening") is reported
  as unchecked rather than failed.

## For developers

- **Rules**: `shared/utils/reservations.ts` — pure functions over the opening hours document.
  `reservationSlotsOn` gives the slots for a date and `validateReservationSlot` says whether a
  date and time can be booked, naming `date` or `time` as the problem. An exception for the date
  wins entirely (first row wins on duplicates); otherwise the weekday entry applies with the
  margin. The margin is never applied to an exception. Specified in `test/unit/reservations.spec.ts`.
- **Consumers**: the form (`app/components/reservations/Form.vue`) reads the document through
  `useOpeningHours`; the route (`server/api/reservations/index.post.ts`) reads it through
  `server/utils/opening-hours.ts`, which fails the request with a 500 when the document is
  missing rather than treating the site as unbookable.
- **Guard**: `scripts/check-event-bookability.ts` (`npm run check:events`, run in CI). The
  verdict lives in `scripts/event-bookability.ts` so it is unit-tested directly
  (`test/unit/event-bookability.spec.ts`); the script owns the filesystem and the reporting. It
  runs under `jiti` because the verdict imports the same TypeScript modules the form uses. It
  takes the first `HH:MM` in the free-form `time` field and uses the events page's own
  upcoming-event helper, so a recurring series is only checked on its document date.
- **Schema** (`content.config.ts`): `lastReservationBeforeClosing` is a plain number with
  `.multipleOf(1)`, deliberately not `.int()` — `int()` emits JSON-schema `type: "integer"`, which
  @nuxt/content stores as TEXT, so the built site holds `"60"` where the file holds `60` and
  Studio reports a permanent conflict on the file. The exceptions are an array of objects because
  a top-level date field becomes a DATE column that throws on the empty string Studio writes for
  a cleared picker. After any change to this collection, run `npm run build` then
  `npm run check:studio`.
