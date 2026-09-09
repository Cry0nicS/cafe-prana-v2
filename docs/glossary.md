# Glossary

The most important concepts in this project, in plain terms.

## Content & CMS

- **Nuxt Content** — the system that turns files in `content/` into the site's pages and data.
  It reads `.md` / `.yml` files and stores them in a small database at build time.

- **Collection** — a group of content files defined in `content.config.ts`, with a schema
  (allowed fields). Two kinds are used here:
  - **Page collection** (`type: 'page'`) — one document per page, with a **body** you can
    render (e.g. `index`, `menuPage`, `events`).
  - **Data collection** (`type: 'data'`) — a set of structured records, one file each, with no
    body (e.g. `menuItems`, `menuCategories`). Adding a record = adding a file.

- **Frontmatter** — the `---` block at the top of a content file holding structured fields
  (title, date, image, …). Edited in Studio as a **form**.

- **Body** — the Markdown content below the frontmatter. Edited in Studio's **visual editor**,
  where you can freely add text, images, and components.

- **MDC (Markdown Components)** — Markdown extended so you can drop Vue components into the
  body, e.g. `::feature-grid`. Container blocks use more colons than their children
  (`:::feature-grid` wraps `::feature`).

- **Content component** — a Vue component in `app/components/content/` that can be used in any
  MDC body (they're registered globally). Examples: `HomeHero`, `FeatureGrid`, `Feature`,
  `Gallery`, `Callout`. See `docs/content-components.md`.

- **Insert palette** — the short, curated list of blocks the owner is offered in Studio's `/`
  menu, declared as an allowlist in `shared/utils/studio-editor.ts`. Nuxt UI and Nuxt Content
  between them make about fifty blocks *renderable*; the palette decides which dozen are
  *offerable*. A new content component does not appear until it is named there.

- **Presentation vs content** — the guiding rule: editable **words and images** live in
  content; **styling** (button variants, icons, layout, map URL) lives in code. This keeps the
  Studio editing surface clean for non-technical editors.

## Nuxt Studio (the CMS)

- **Nuxt Studio** — a self-hosted editor built into the site. The owner opens it at **`/pranas`**
  on the live site, edits visually, and clicks **Publish**.

- **Publish = Git commit** — publishing commits the changed files to the GitHub repo, which
  triggers a Vercel redeploy. Every edit is versioned and reversible.

- **Visual editor vs form editor** — the Markdown **body** opens in a notion-like visual
  editor (add/reorder blocks); **frontmatter and data files** open as auto-generated forms.

- **Auth (Google)** — the owner signs in with Google/Gmail. Access is restricted to the emails
  in `STUDIO_GOOGLE_MODERATORS`. Because Google login doesn't grant repo access, Studio commits
  with a service token, `STUDIO_GITHUB_TOKEN`. See `docs/studio-access.md`.

## Internationalisation (i18n)

- **Locales** — the site is bilingual: **en** (default) and **de**. German URLs are prefixed
  with `/de`.

- **Locale folder** — a file's language is decided by **where it lives**: everything under
  `content/en/` is English, everything under `content/de/` is German. There is no language
  suffix in the filename and no `locale` field on the form.

- **Locale pair** — the same content in both languages, carrying the **same filename** in each
  locale folder (`content/en/events/spring-brunch.md` and `content/de/events/spring-brunch.md`).
  Matching names are what give the pair one shared address, so the language switcher can move
  between them. Pairs should stay structurally in sync.

- **Language-independent content** — content that exists once for both languages, and so sits at
  the `content/` root instead of in a locale folder: `opening-hours.yml` (one set of hours) and
  `notice.yml` (one schedule, with its text in `en:` and `de:` blocks). The rule in full: a
  locale folder holds content that exists once *per language*; the root holds content that
  exists once, *period*. See `docs/adr/0001-bilingual-content-layout.md`.

- **Unpaired content** — content that exists in one language only. Allowed, not an error: it is
  simply absent from the other language's listing. The one visible effect is that the language
  switcher on its own page has nowhere to go and shows "page not found".

- **UI strings vs content** — short interface labels (nav, buttons, form errors) live in
  `i18n/i18n.config.ts`; long editorial copy lives in `content/`.

- **`useLocalePath` / `useLocalizedLinks`** — helpers that turn a path like `/menu` into the
  correct localized URL (`/de/menu`) while leaving external/`mailto:`/hash links untouched.

## App & server

- **`useCafeSeo`** — the composable that sets a page's title, description, canonical URL, and
  `hreflang` alternates from a few inputs. Pages call it instead of hand-rolling meta tags.

- **`runtimeConfig`** — server configuration read from environment variables (Supabase,
  Mailgun, Studio auth, …). Defined in `nuxt.config.ts`; secrets come from `.env` locally and
  Vercel env vars in production. `.env.example` lists what's needed.

- **Opening hours** — `content/opening-hours.yml`, one language-independent file, edited in
  Studio. Drives the homepage hours, the structured data for search engines, and which days and
  times the reservation form offers: slots run from opening until `lastReservationBeforeClosing`
  minutes before closing.

- **Reservation exception** — a row in the opening hours file's `reservationExceptions` list
  naming one date that does not follow its weekday for bookings: either closed (a holiday) or
  bookable for exactly the range given (an evening event on a Monday). Wins over the weekday
  entirely. Not shown on the site; only the form and the API read it. Owner-editable.
  See `docs/reservation-availability.md`.

- **Booking availability** — the pure rules in `shared/utils/reservations.ts` that turn the
  opening hours document into the slots the form offers and the API accepts. No configuration
  of its own.

- **Event bookability check** — `npm run check:events`, run in CI. Fails when an upcoming
  event that asks for a reservation starts at a time nobody can book on its date; the fix is a
  reservation exception the owner adds in Studio.

- **Site notice** — `content/notice.yml`, one file for both languages. A dismissible card shown
  in the middle of the screen for short-notice news (a closure, a late opening). Shown while the
  visitor's clock is inside the `from` / `until` schedule (Berlin time); `until` doubles as the
  on/off switch. Evaluated on the device because every page is prerendered. See `docs/site-notice.md`.

- **Zod schema** — a validation definition. The reservation/contact form schemas in
  `shared/utils/schemas/` validate input on **both** the client form and the server endpoint.

- **`#shared` alias** — imports from the `shared/` folder (schemas, types, constants) that are
  used by both the app and the server.

- **Supabase** — the hosted Postgres database; used by the server to store reservations.
  The server uses the **service-role key** only; the `reservations` table has row-level
  security on and no grants for the anon role, so the public anon key can do nothing
  (`supabase/migrations/`).

- **Mailgun** — the email service; the server sends reservation and contact emails through it
  (`server/services/email.ts`).

## Build & deploy

- **SSR + prerender** — the site is server-rendered on **Vercel**. Static pages (home, menu,
  events, …) are prerendered at build time; dynamic bits (form submissions, Studio auth) run as
  server functions.

- **`npm run check:content`** — a guard that fails if the two homepage locale files drift out
  of structural sync. Runs in CI next to `npm run check:events`.

- **CI gate** — lint, typecheck, the test suite (`npm test`), the content checks
  (`check:content`, `check:events`) and the build followed by `check:studio` must all pass.
