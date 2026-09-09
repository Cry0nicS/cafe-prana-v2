# Bilingual content is laid out by locale folder

**Status:** accepted (2026-09-09)

A content file's language is decided by **where it lives**, not by its name and not by a field it carries:
`content/en/…` is English, `content/de/…` is German. The rule generalises to the whole tree — **a locale
folder holds content that exists once per language; the repository root holds content that exists once,
period.** `content/opening-hours.yml` (one set of hours for both languages) and `content/notice.yml` (one
schedule, with `en:`/`de:` text inside) already worked that way; this makes them the second half of a stated
rule instead of exceptions. The public slug is the filename with the locale segment stripped, so
`content/de/events/deep-talk-aperitivo.md` serves `/de/events/deep-talk-aperitivo` and its English
counterpart serves `/events/deep-talk-aperitivo`.

This replaces a convention where the language was a filename suffix (`my-event.md` / `my-event.de.md`) *and*
a `locale` dropdown in the Studio form — two independent sources of truth for one fact, which could disagree.

## Why not the filename suffix

Not because it was impossible. `.de` **was** typeable in Studio all along: its new-file name sanitiser
replaces whitespace and punctuation with `-` but leaves dots alone, so typing `My New Event.de` produced
exactly `my-new-event.de.md`. The problem was that no non-technical editor would ever infer it, and the
failure mode for guessing wrong was silent and late.

Typing the natural thing — `My New Event DE` — produced `my-new-event-de.md`. The old `eventSlug()` stripped
a literal `.de`, not `-de`, so the slug kept its suffix: the `/de/events` listing rendered a card linking to
`/de/events/my-new-event-de`, while the page itself reconstructed the stem as `events/my-new-event-de.de`,
found nothing, and threw 404. `nitro.prerender.failOnError` defaults to `false`, so this shipped on a green
build, and `sitemap.autoI18n` submitted the 404ing URL to search engines. Nothing caught it —
`check-content-parity.mjs` only covered the homepage pair.

Under the folder layout that entire failure class is gone: locale comes from the folder and the slug is just
the filename, so a clumsily-named German file is a working page at a clumsy URL rather than a broken one.

## Why `en`/`de` and not `english`/`german`

The folder *is* the locale's source of truth, so its name has to be the locale code that
`nuxt.config.ts`, the collection sources and the sitemap all already use. Friendlier folder names would need
a name→code mapping table — a new place for the two languages to disagree, which is the exact class of bug
this decision removes. Two two-letter folders also match the `/de` the owner already sees in the site's own
URLs.

## Why `locale` is no longer a field

Removing it from the Studio form is the point — it is not information the editor should be asked for. But it
could not simply be *hidden* and filled in by the build. Both routes were closed
([#34](https://github.com/Cry0nicS/cafe-prana-v2/issues/34)):

- **Injecting it** via a `content:file:afterParse` hook fails Studio's conflict detection. Studio's field
  comparison is one-directional and would have allowed it, but that is only the first of two gates; the
  second regenerates the file from the deployed document and string-compares it against the source on
  GitHub. `locale` is not one of Studio's nine reserved keys, so it lands in the regenerated frontmatter,
  differs from the real file, and puts **every** content file into "Conflict detected".
- **Hiding it** with `editor({ hidden: true })` — upstream's blessed pattern for injected fields — silences
  that, but Studio re-inserts the row itself and a stripped field resolves to its schema default or `NULL`.
  The column would read `NULL` (or `'en'` for German documents, given a default) inside Studio's own live
  preview, so the German page the owner is editing drops out of its own listing.

The general rule worth keeping: **a hidden, build-injected field is fine for something merely displayed, and
never for something queries select on.**

So locale is not stored at all. It is the identity of the collection being queried.

## One collection per locale — forced, not stylistic

`content.config.ts` declares **14** collections rather than 8: `indexEn`/`indexDe`,
`menuPageEn`/`menuPageDe`, `eventsPageEn`/`eventsPageDe`, `eventsEn`/`eventsDe`,
`menuItemsEn`/`menuItemsDe`, `menuCategoriesEn`/`menuCategoriesDe`, plus `notice` and `openingHours` at the
root. **Do not merge these back into one collection per content type with two sources.** It builds, it
produces correct URLs, and it breaks Studio completely
([#36](https://github.com/Cry0nicS/cafe-prana-v2/issues/36)).

Studio derives a document's id from `collectionInfo.source[0]` unconditionally
(`nuxt-studio/dist/module/runtime/utils/collection.js`). `getCollectionByFilePath` matches *any* source, so
the right collection is found — and then the id is computed from the English source. Measured across all 58
content files, 28 failed to round-trip, **every one of them German**, each resolving to its English
counterpart: `content/de/index.md` → `content/en/index.md`. One collection per locale gives one source per
collection, and scores 58/58.

This is easy to test the wrong way round. The *reverse* mapping (`generateFsPathFromId`) does take a
per-document source and scores 52/52, so verifying only that direction reports everything as healthy. The
forward direction is the one that runs when the owner clicks a file. A probe for it is kept at
`docs/research/probes/studio-path-resolution.mjs` — not in CI, because it needs `.nuxt/content/preview.mjs`,
which the dev server writes and `nuxt build` does not. `npm run check:studio` catches a merged collection
too, by a different route: the id no longer names a file that exists.

`queryCollection(isDe ? 'eventsDe' : 'eventsEn')` typechecks, so a locale-specific collection name costs
nothing at the call site — and because the collection *is* the locale, there is **no locale predicate
anywhere** in the app.

## How the sources must be spelled

Load-bearing, and each of these alternatives looks like it works
([#35](https://github.com/Cry0nicS/cafe-prana-v2/issues/35)):

- The locale folder goes inside `include`; `prefix` writes the public URL back. This keeps every URL
  identical to what the site already serves.
- **Never `cwd`.** It yields identical `path` and `stem`, but Studio reconstructs file paths from `include`
  and `prefix` only and ignores it — 0 of 52 rows resolvable. And `cwd: '~~/content/en'` ingests zero files
  while the build still exits 0.
- **A singleton's `include` must be a glob**, spelled `en/**/index.md`. Without a `*` nothing is stripped,
  so `en/index.md` yields the path `/en` and the German prefix stacks into `/de/de`. The shorter `en/*.md`
  builds correctly but breaks Studio, via a ufo quirk where an empty prefix becomes `/`.

## Content in only one language is allowed

Publishing an event in English and not German is the owner's call, not an error. The listing is
locale-scoped, so an unpaired event is simply absent from the other language. The one visible consequence is
that the language switcher on its page jumps to a slug with no counterpart and 404s.

**That is accepted deliberately** — this is the part most likely to be mistaken for an oversight later.
There is no runtime fallback, and `nitro.prerender.failOnError` stays `false` so a partial pair still
deploys. A fallback would trade a clear 404 for a subtler wrongness (English text under a German URL), and a
build gate would block a publish the owner intended. A non-blocking report of single-language content exists
for the developer's benefit, not the owner's.

For the same reason there is **no cross-locale field-parity checking**: `date`, `time`, `paid`, `price`,
`reservation` and `image` remain independently editable, and keeping a pair consistent is the owner's
responsibility.

## Ruled out of scope

- **`menu-categories/` camelCase filenames** (`drinksHot.yml`). Studio lowercases every filename it creates,
  so these are files Studio cannot create — but the categories are a fixed enum and the owner never adds
  one. Renaming them would touch `createMenuCategorySchema()`, each category's `slug`, and every menu item's
  `category`.
- **Moving `opening-hours.yml` or `notice.yml`** into the locale folders. They are language-independent by
  design; that is the rule, not an exception to it.
