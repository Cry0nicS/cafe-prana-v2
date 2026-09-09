# Creating an event

Events are individual pages. The **Events listing page updates itself** — when you add an
event, it automatically appears in the right place (Upcoming vs. Past) with a card. You never
edit the listing by hand.

The **homepage follows too**: while at least one event is still to come, the top of the homepage
announces the soonest one — its name, description, photo, date, time and price, with a button to
its page. Once the last event has passed, the ordinary welcome block returns by itself. See
`docs/editing-the-homepage.md` for what that hides in the welcome block meanwhile.

Everything an event needs is intentionally small: you fill in a few fields, then write the page
freely. The location, the euro sign, the reservation link, the "vegan · gluten-free · organic"
note, and the search-engine info are all handled for you.

## Add a new event (in Studio)

1. Pick the language folder first: **content/en/events** for English, **content/de/events** for
   German. The folder you are in decides the language — there is no language to choose on the
   form.
2. Create a **new event** and type its name. That name becomes the web address (an event named
   "Spring Brunch" lives at `/events/spring-brunch`, or `/de/events/spring-brunch` in German) —
   you don't set a slug or URL by hand.
3. Fill in the **details** (the form at the top) — this is the whole form:

   | Field | What it is |
   |-------|------------|
   | `title` | The event name. |
   | `description` | One or two sentences, shown on the card and at the top of the page. |
   | `date` | The day it happens. |
   | `time` | Free text — e.g. `18:00` or `11:00–13:00`. |
   | `image` | The header photo, from the media library. Also used for the listing card. |
   | `paid` | Turn **on** if the event costs money. |
   | `price` | The amount in **euros** (just the number, e.g. `30`). Only used when `paid` is on. |
   | `reservation` | `required`, `recommended`, or `walkin` (no booking needed). |

   That's it — there is no SEO, navigation, sitemap or slug to fill in. Those are handled
   automatically (see below).
4. Below the details, **write the event page freely** — headings, paragraphs, photos, and note
   boxes. This is where you describe the event however you like.

Then repeat it in the other language — see [Two languages](#two-languages).

## Two languages

Each event is **two files with the same name**, one in each language folder:

```
content/en/events/spring-brunch.md   → /events/spring-brunch
content/de/events/spring-brunch.md   → /de/events/spring-brunch
```

Keeping the names identical is what makes the language switcher work on the event's page. There is
no `.de` in the name and no language field on the form — the folder is the language.

**The quickest way to make the second one:** go into the other language folder, **duplicate** the
event nearest to the one you want (any recent event will do), then overwrite its title,
description, date and text. Duplicating starts you from a filled-in form, so you're editing rather
than typing everything again.

> Duplicating copies **within** the folder you're in, so duplicate from inside `content/de/events`
> to get a German file. You can't duplicate an English event and move the copy across.

**Only have one language ready?** That's fine — publish it. The event simply won't appear on the
other language's Events page until you add it there. (If someone is on the event's page and
switches language before the second file exists, they'll get a "page not found" — so add the second
language when you can.)

## Price — only shown when it's paid

- **Free event** → leave `paid` **off**. No price appears anywhere.
- **Paid event** → turn `paid` **on** and set `price` to the euro amount. It shows as e.g. `€30`.
- **Price not decided yet** → turn `paid` on but leave `price` empty. Nothing shows until you add it.

## Reservation

Pick one `reservation` value:

- **required** — shows a **Reserve your seat** button and "Reservation required".
- **recommended** — shows the button and "Reservation recommended".
- **walkin** — no button, just "No booking needed" (people can drop by).

The button always links to the reservations page — you don't set a link.

> **Does the event run outside your opening hours?** A dinner at 18:30, or anything on a Monday,
> cannot be booked until you open that date: add a row for it under `reservationExceptions` in
> **Opening Hours** (`content/opening-hours.yml`) in the same session. A check reports events
> nobody can book, but it runs after you publish and cannot judge a repeating time such as
> "Thursdays at 17:00", so the row is the part to remember.
> See `docs/reservation-availability.md`.

## What you can put in the page content

- **Text** — headings and paragraphs, written normally.
- **Photos** — add them inline from the media library (always add a short alt text).
- **A note box** — insert a **Callout** for things like menu notes or dietary info.
- **Other blocks** from the homepage (feature cards, a gallery, …) are available via the `/`
  menu if you want a richer page.

There are no required content blocks — an event can be a couple of sentences and a photo, or a
richer page. The date, time, price, location and reservation info come from the details form and
are shown automatically in the page's info bar and on the card.

## What you no longer need to set

These are hidden from the form and handled for you:

- **URL / slug** — taken from the event's name as you typed it, with the language coming from the
  folder. Keep the two languages' names identical so both share one address.
- **Language** — decided by the folder you created the event in. There is no language field.
- **SEO** — the search-engine title, description and preview image are generated from the
  `title`, `description` and `image` above. No SEO tab to fill.
- **Navigation & sitemap** — set to sensible defaults automatically.
- **Location** — always Café Prana; shown automatically.
- **Currency** — always euros.
- **Categories and tags** — events simply list by date. Every dish is vegan, gluten-free and
  organic, so that's stated once for the whole site.

> **Running a series** (e.g. a workshop over several weeks)? Create a **separate event for each
> date**, each with a clear title. There is no separate "series" type, on purpose — it keeps every
> event simple to add and to book.

## Publishing

Save and **Publish** — the event goes live and appears on the Events page within a couple of
minutes. If you made both languages, publish **both** files.
