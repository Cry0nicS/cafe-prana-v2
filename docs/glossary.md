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

- **Per-locale content files** — content comes in pairs: `index.md` / `index.de.md`,
  `brunch.yml` / `brunch.de.yml`. Both must exist and stay structurally in sync.

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

- **Opening hours** — `content/opening-hours.yml`, one language-independent file. Drives the
  homepage hours, the structured data for search engines, and the days and slots the
  reservation form offers and the API accepts.

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
  of structural sync.

- **CI gate** — `npm run lint` + `npm run typecheck` must pass (there is no unit-test suite).
