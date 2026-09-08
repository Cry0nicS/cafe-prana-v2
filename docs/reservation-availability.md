# When the cafe takes reservations (developer task)

The reservation form's days and times live in **`shared/utils/reservations.ts`**, in code. They
are **not** taken from `content/opening-hours.yml`, and the owner cannot change them from Studio.

## Why it is separate from the opening hours

The opening hours are what the cafe is normally open to walk-ins, and events regularly fall
outside them — a dinner starting at 18:30 on a day the counter closes at 15:00. While the form
followed the opening hours, those guests had no slot to pick at all.

So the two are independent: `content/opening-hours.yml` says what the site **displays** (the
Directions block and the structured data for search engines), and `shared/utils/reservations.ts`
says what can be **booked**. The form and the `/api/reservations` route both read the same module,
so what the form offers and what the API accepts cannot drift apart.

## Closing a weekday

`CLOSED_WEEKDAYS` is the switch. To add a second weekly closing day — Sundays, say — add it to
the list and remove that day's booking window:

```ts
export const CLOSED_WEEKDAYS: readonly Weekday[] = ['monday', 'sunday']

export const BOOKING_WINDOWS: Partial<Record<Weekday, BookingWindow>> = {
  tuesday: { from: '07:00', to: '18:00' },
  // ...
  saturday: { from: '09:00', to: '21:00' }
  // sunday removed
}
```

A unit test fails if the two disagree, so a weekday can never be both closed and bookable, or
neither. Also update `content/opening-hours.yml` (via Studio or directly) so the site shows the
day as closed — nothing enforces that, because the owner has to be able to edit the displayed
hours without a red build.

## Closing a single date

`CLOSED_DATES` holds one-off closures — a public holiday, a vacation week, a private event — as
Berlin dates:

```ts
export const CLOSED_DATES: readonly string[] = [
  '2026-12-24',
  '2026-12-25'
]
```

The form then reports that date as closed and the API rejects it. Entries in the past are
harmless (the date input cannot offer them), but worth clearing out when the file is next
touched. Pair a closure with a **site notice** (`docs/site-notice.md`) so visitors see why.

## Changing the bookable times

`BOOKING_WINDOWS` gives each open weekday one range: `from` is the first bookable slot and `to`
the last, both inclusive and both on the 15-minute grid. Make the range wide enough for the
latest event the cafe runs on that day, not just for normal service — a guest booking for an
evening event needs a slot that exists.

The tests check that every window is on the grid and the right way round, and that every slot
the form can offer still passes the reservation schema.
