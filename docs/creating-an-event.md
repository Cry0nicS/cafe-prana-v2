# Creating an event

Events are individual pages. The **Events listing page updates itself** — when you add an
event, it automatically appears in the right place (Upcoming vs. Past) with a card. You never
edit the listing by hand.

Everything an event needs is intentionally small: you fill in a few fields, then write the page
freely. The location, the euro sign, the reservation link, the "vegan · gluten-free · organic"
note, and the search-engine info are all handled for you.

## Add a new event (in Studio)

1. In the editor, open the **content/events** folder and create a **new file** — duplicating an
   existing event is the easiest start.
2. Use **two files per event**, one per language: `my-event.md` (English) and `my-event.de.md`
   (German). Keep the same name before the `.de`.
3. Fill in the **details** (the form at the top):

   | Field | What it is |
   |-------|------------|
   | `title` | The event name. |
   | `description` | One or two sentences, shown on the card and at the top of the page. |
   | `slug` | The web address (e.g. `spring-brunch`). Must match the file name and be the **same in both languages**. |
   | `date` | The day it happens. |
   | `time` | Free text — e.g. `18:00` or `11:00–13:00`. |
   | `image` | The header photo, from the media library. Also used for the listing card. |
   | `paid` | Turn **on** if the event costs money. |
   | `price` | The amount in **euros** (just the number, e.g. `30`). Only used when `paid` is on. |
   | `reservation` | `required`, `recommended`, or `walkin` (no booking needed). |

4. Below the details, **write the event page freely** — headings, paragraphs, photos, and note
   boxes. This is where you describe the event however you like.

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

These were removed to keep things simple — they're handled for you:

- **Location** — always Café Prana; shown automatically.
- **Currency** — always euros.
- **Categories and tags** — events simply list by date. Every dish is vegan, gluten-free and
  organic, so that's stated once for the whole site.
- **Search-engine info (SEO)** — generated from the title, description and image.

> **Running a series** (e.g. a workshop over several weeks)? Create a **separate event for each
> date**, each with a clear title. There is no separate "series" type, on purpose — it keeps every
> event simple to add and to book.

## Publishing

Save and **Publish** — the event goes live and appears on the Events page within a couple of
minutes. Remember to publish **both** the English and German versions.
