# Creating an event

Events are individual pages. The **Events listing page updates itself** — when you add an
event, it automatically appears in the right place (upcoming vs. past) with a card. You never
edit the listing by hand.

## Add a new event (in Studio)

1. In the editor, go to the **content/events** folder and create a **new file** (duplicating
   an existing event is the easiest start).
2. Use **two files per event**, one per language: `my-event.md` (English) and
   `my-event.de.md` (German). Keep the same file name before the `.de`.
3. Fill in the event **details** (the form at the top):
   - `title`, `description` — shown on the card and page
   - `slug` — the address (e.g. `spring-brunch`); must match the file name and be the same
     in both languages
   - `startDate` (and optional `endDate`), `time`
   - `image` and `heroImage` (card image + big page image) — via the media library
   - `price`, `booking` (whether reservation is needed), `category`, `tags`
   - `seo` — title/description for search engines
4. Below the details, write the **event page content freely**: paragraphs, images, and
   blocks. This is where you describe the event however you like.

## What you can put in the content

- **Text** — headings and paragraphs, written normally.
- **Images** — add them inline from the media library.
- **A note box** — insert a **Callout** for things like menu notes or reservation info.
- **Feature cards, a gallery, and the other blocks** from the homepage are all available
  here too (via the `/` menu) — reuse whichever fit the event.

There are no required content blocks — an event can be a couple of sentences and a photo, or a
richer page with lists and cards. All the structured info (date, price, booking, tags) comes
from the details form and is shown automatically in the page's info panel and on the card.

## Publishing

Save and **Publish** — the event goes live and appears on the Events page within a couple of
minutes. Remember to publish both the English and German versions.
