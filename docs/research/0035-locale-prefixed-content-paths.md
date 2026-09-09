# Can `content/en/…` + `content/de/…` reproduce today's exact URLs?

Research for [#35](https://github.com/Cry0nicS/cafe-prana-v2/issues/35), part of the bilingual
content layout map ([#33](https://github.com/Cry0nicS/cafe-prana-v2/issues/33)).

**Answer: yes.** Every public URL the site serves today is reproducible from a locale-prefixed
content tree, with no redirects and no change to any route. Demonstrated by building this
repository against a restructured `content/` on branch `research/nuxt-content-locale-paths`: the
two sitemaps and the prerendered route list came out **identical to the pre-restructure build**,
and `npm run dev` serves the same URLs with the right language on each.

There is one condition, and it is not the obvious one: **the locale folder must live inside each
source's `include` glob — not in `cwd`.** Both spellings give identical `path` and `stem`, but
`cwd` breaks Nuxt Studio's ability to map a content row back to its file. Details in
[Why not `cwd`](#why-not-cwd).

Versions this was measured against: `@nuxt/content` 3.15.2, `nuxt` 4.5.1, `@nuxtjs/i18n` 10.6.0,
`@nuxtjs/sitemap` 8.3.2, `nuxt-studio` 1.7.0.

## How `path` and `stem` are actually derived

Worth stating first, because every answer below follows from it. Both fields are computed from one
string, the row's `id`:

1. The id is assembled per file as
   `join(collection.name, source.prefix || '', key)`
   (`node_modules/@nuxt/content/dist/module.mjs:3308`, and again at `:1819` for the dev watcher).
2. `key` is the glob match with the source's **fixed part stripped**: `getKeys()` returns
   `_keys.map(key => key.substring(fixed.length))` (`module.mjs:1975-1978`), where `fixed` is everything
   before the first `*` in `include` — and is the empty string when `include` has no `*` at all
   (`parseSourceBase`, `module.mjs:2086`).
3. `prefix` defaults to that same fixed part, but an explicitly configured `prefix` wins: the
   resolved source is built as `{ prefix: <derived>, …, ...source }`, so the user's value overwrites
   the derived one (`module.mjs:1968-1988`).
4. `stem` is the id minus its **first segment** (the collection name) and minus the file extension;
   `path` is that same stem, slugified per segment, with a leading slash — and with a segment named
   `index` emptied out (`pathMetaTransformer`, `describeId` and `generatePath`,
   `module.mjs:1145-1180`).

So the identity is: **`stem` = `prefix` + `key`**, and **`path` = `/` + `stem`** (index-stripped).
The locale folder therefore lands in `path` if and only if it survives into the key — which is
exactly what a source's fixed part (or `cwd`) removes, and what `prefix` puts back in whatever
shape the public URL needs.

There is no third option: because `path` and `stem` are both projections of the same id, **an id
that mirrors the file path and a `path` that equals the public URL cannot both be had.** Under any
working configuration the English rows' ids lose their `en/` segment. That is not a defect to fix,
it is the mechanism doing its job — but it has a consequence for `check:studio`, see
[What this breaks](#what-this-breaks-in-this-repo).

## The configuration that reproduces today's URLs

This is what the verified build ran (`content.config.ts` on the research branch):

```ts
index:      [{ include: 'en/**/index.md',        prefix: ''                     },
             { include: 'de/**/index.md',        prefix: '/de'                  }]
menuPage:   [{ include: 'en/**/menu.yml',        prefix: ''                     },
             { include: 'de/**/menu.yml',        prefix: '/de'                  }]
eventsPage: [{ include: 'en/**/events.yml',      prefix: ''                     },
             { include: 'de/**/events.yml',      prefix: '/de'                  }]
events:     [{ include: 'en/events/*.md',        prefix: '/events'              },
             { include: 'de/events/*.md',        prefix: '/de/events'           }]
menuItems:  [{ include: 'en/menu/*.yml',         prefix: '/menu'                },
             { include: 'de/menu/*.yml',         prefix: '/de/menu'             }]
menuCategories: [{ include: 'en/menu-categories/*.yml',  prefix: '/menu-categories'    },
                 { include: 'de/menu-categories/*.yml',  prefix: '/de/menu-categories' }]

// unchanged - language-independent, and they stay at the content root
openingHours: 'opening-hours.yml'
notice:       'notice.yml'
```

Two details in there are load-bearing:

- **The singletons need a glob, and `en/**/<file>` is the right one.** `include: 'en/index.md'` has
  no `*`, so its fixed part is empty, the key stays `en/index.md`, and the row comes out as
  `stem: 'en/index'`, `path: '/en'` (measured — see question 1). A glob is required to make the
  fixed part end at `en/`.
  `en/*.md` works for the build but is both loose (it would silently swallow any future
  `content/en/about.md` into the `index` collection) and actively wrong for Studio (see
  [the empty-prefix trap](#the-empty-prefix-trap)). `en/**/<file>` keeps the fixed part at `en/`
  while pinning one file, because `**/` matches zero directories — verified in both glob engines
  involved, `tinyglobby` for the build and `minimatch` for Studio (`research-glob-probe.mjs`).
- **`prefix: ''` for the English singletons** is what the repo already does and it still works:
  `join('index', '', 'index.md')` → `index/index.md` → `stem: 'index'` → `path: '/'`.
  (The docs say a prefix "must start by a leading `/`" — `''` and `'/'` behave identically on the
  build side. Neither is safe for Studio's helpers, which is a separate issue below.)

### Measured `path` and `stem`, for the ticket's table

From the built content database (`node_modules/.cache/nuxt/.nuxt/content/sql_dump.txt`, read back
by `research-dump.mjs`):

| File | `id` | `stem` | `path` | Public URL |
|---|---|---|---|---|
| `content/en/index.md` | `index/index.md` | `index` | `/` | `/` |
| `content/de/index.md` | `index/de/index.md` | `de/index` | `/de` | `/de` |
| `content/en/menu.yml` | `menuPage/menu.yml` | `menu` | `/menu` | `/menu` |
| `content/de/menu.yml` | `menuPage/de/menu.yml` | `de/menu` | `/de/menu` | `/de/menu` |
| `content/en/events.yml` | `eventsPage/events.yml` | `events` | `/events` | `/events` |
| `content/de/events.yml` | `eventsPage/de/events.yml` | `de/events` | `/de/events` | `/de/events` |
| `content/en/events/deep-talk-aperitivo.md` | `events/events/deep-talk-aperitivo.md` | `events/deep-talk-aperitivo` | `/events/deep-talk-aperitivo` | `/events/deep-talk-aperitivo` |
| `content/de/events/deep-talk-aperitivo.md` | `events/de/events/deep-talk-aperitivo.md` | `de/events/deep-talk-aperitivo` | `/de/events/deep-talk-aperitivo` | `/de/events/deep-talk-aperitivo` |
| `content/en/menu/latte.yml` | `menuItems/menu/latte.yml` | `menu/latte` | *(none - data)* | — |
| `content/de/menu/latte.yml` | `menuItems/de/menu/latte.yml` | `de/menu/latte` | *(none - data)* | — |
| `content/opening-hours.yml` | `openingHours/opening-hours.yml` | `opening-hours` | *(none - data)* | — |

The English stems are **byte-identical to today's**; the German ones change from a `.de` suffix to
a `de/` prefix (`events/deep-talk-aperitivo.de` → `de/events/deep-talk-aperitivo`).

This is a strict improvement on today's `path` values, which are junk for German and only unused by
accident: the current build stores `path: '/index.de'`, `'/menu.de'` and
`'/events/deep-talk-aperitivo.de'`. Nothing serves those — the pages are ordinary Vue routes under
`app/pages/`, and `@nuxtjs/i18n` (`prefix_except_default`) is what produces `/de/**`. Under the
locale-prefixed tree, content `path` and public URL finally agree.

## The four questions

### 1. What `path` does `content/en/index.md` get, and can `prefix`/`cwd` make it `/`?

With the naive `include: 'en/index.md', prefix: ''` the path is **`/en`** — a source without a `*`
strips nothing, so the key keeps its `en/`. Worse, the German source's prefix then *stacks* on top
of the un-stripped key. Measured in a build of exactly that config:

```
id="index/en/index.md"     stem="en/index"     path="/en"
id="index/de/de/index.md"  stem="de/de/index"  path="/de/de"
```

With `include: 'en/**/index.md', prefix: ''` it is **`/`**, and `content/de/index.md` with
`include: 'de/**/index.md', prefix: '/de'` is **`/de`**. Both measured, above.

So: yes, `prefix` (plus a glob whose fixed part ends at the locale folder) makes it `/` and `/de`.
`cwd` gets there too, and is rejected for a different reason.

The `index` → `''` rewrite that makes this land on `/` rather than `/index` is in `refineUrlPart`,
`module.mjs:1166-1172` (`.replace(/^index(\.draft)?$/, '')`), applied per path segment. `de/index`
therefore becomes `/de/` and then `withoutTrailingSlash` → `/de`.

### 2. What is `stem` — `en/events/…`, or is the locale stripped?

**The locale is stripped for the default locale and kept for German**, because that is what the
sources are configured to do: `stem` is `prefix + key`, so English rows get no locale segment at
all and German rows get exactly one. `en/` never appears in any stem.

Consequences for the two places the sibling tickets name:

- `.where('stem', 'LIKE', 'de/events/%')` selects the seven German events, and
  `.where('stem', 'NOT LIKE', 'de/%')` selects the seven English ones. Verified against the built
  database in `research-queries.mjs`. `LIKE`/`NOT LIKE` are supported operators in the query builder
  (`node_modules/@nuxt/content/dist/runtime/internal/query.js:36-38`).
- `eventSlug()` (`app/utils/events.ts:77`) needs its regex changed from
  `/^events\//` + `/\.de$/` to `/^(?:de\/)?events\//`. Done on the research branch; the events
  listing, the related-events strip and `HomeHero`'s next-event link all go through it and all
  render correctly in the built output.

### 3. Does `queryCollection('events').path(…)` still behave?

Yes — and it becomes the *right* way to do it, replacing the hand-rolled stem at
`app/pages/events/[slug].vue:24` (on `main`). `path()` is just
`where('path', '=', withoutTrailingSlash(path))`
(`runtime/internal/query.js:85`), and since the row's `path` is now the public route, passing
`route.path` resolves the correct locale's document with no locale argument at all:

```ts
const { data: rawEvent } = await useAsyncData(…, () =>
  queryCollection('events').path(route.path).first())
```

The verified build uses exactly that, and `/events/easter-brunch-buffet` prerendered as
"Easter Brunch Buffet" while `/de/events/easter-brunch-buffet` prerendered as
"Oster-Brunch-Buffet". Note `withoutTrailingSlash('/')` is `'/'`, so `.path('/')` works for the
homepage too.

Caveat: `path` exists only on `type: 'page'` collections. `menuItems`, `menuCategories`,
`openingHours` and `notice` have no `path` column, so those keep filtering on `locale` or `stem`.

### 4. Do the sitemap `onUrl` hooks still get what they need?

Yes, and **they are no longer needed at all.** Two facts from `@nuxtjs/sitemap`:

- At build time it hooks `content:file:afterParse` and stores `sitemap.loc = content.path` into the
  row (`node_modules/@nuxtjs/sitemap/dist/module.mjs:781-816`). Today that bakes the junk German
  paths and `onUrl` is what repairs them at request time. Under the locale-prefixed tree the baked
  value is already the public URL — the database now holds `{"loc":"/de/events/deep-talk-aperitivo"}`.
- At request time the sitemap route builds `{ loc: c.path, ...c.sitemap }` and then calls
  `onUrl(url, entry, collection)`; when a collection has an `onUrl` (or `filter`) it selects **all**
  fields, so `entry` is the whole content row — `stem`, `path`, `locale` and everything else
  (`dist/runtime/server/routes/__sitemap__/nuxt-content-urls-v3.js`).

Both were verified by building twice. First with `onUrl` hooks rewritten to derive the location from
`entry.stem` instead of `entry.locale` (proving the hook can survive dropping the `locale` field, as
the sibling ticket wants); then with **every `onUrl` hook deleted**, leaving
`sitemap: createSitemapSchema()`. Both builds produced sitemaps byte-identical to the
pre-restructure baseline, all 24 locations across `__sitemap__/en-US.xml` and
`__sitemap__/de-DE.xml`.

`defineSitemapSchema`'s `name` is only required when passing `filter` or `onUrl`
(`node_modules/@nuxtjs/sitemap/dist/content.mjs`, `registerCollectionHooks`), so it goes away with
them.

## Why not `cwd`

`cwd` ("Root directory for content matching", per the source-options docs) reaches the same
`path`/`stem`: `{ include: 'events/*.md', prefix: '/events', cwd: <abs>/content/en }` produces
`stem: 'events/deep-talk-aperitivo'` and `path: '/events/deep-talk-aperitivo'`, exactly as the glob
form does. It was built and measured that way first, and the site came out correct.

**Nuxt Studio ignores `cwd` completely.** The editor reconstructs a file path from a row's id with
`getCollectionSourceById` (`node_modules/nuxt-studio/dist/module/runtime/utils/source.js:11`) and
`generateFsPathFromId` (`…/utils/collection.js:14`), and both work purely from `include` and
`prefix`. Fed the real resolved sources the build generated plus every id in the built database
(`research-studio-fspath.mjs`), the three spellings score:

| Sources for the six locale-split collections | rows whose id Studio resolves to a real file |
|---|---|
| `cwd: <abs>/content/<locale>` | **0 of 52** — every path missing its locale folder |
| locale folder inside `include`, `<locale>/*.…` singletons | **49 of 52** |
| locale folder inside `include`, `<locale>/**/<file>` singletons | **52 of 52** |

(`research-cwd-vs-glob.mjs`. The three spellings produce identical ids, so all three can be scored
against one built database — and the scores agree with what three separate real builds showed.)

Under `cwd`, Studio would try to open `content/events/deep-talk-aperitivo.md`, which does not
exist. Every edit surface that starts from an id — the document list, the click-to-edit overlay,
`studio:document:edit` — is built on this. So `cwd` is out.

### The empty-prefix trap

Found while testing, and the reason the singletons use `en/**/index.md` rather than the shorter
`en/*.md`: Studio's `getCollectionSourceById` mangles a path when a source's `prefix` is `''`.
It does `prefixAndPath.replace(withoutLeadingSlash(prefix), '')`, and `ufo`'s
`withoutLeadingSlash('')` returns **`'/'`**, not `''` — so for the German row `index/de/index.md`
it strips the first slash, yielding `deindex.md`, joins the English source's fixed part onto it, and
`minimatch('en/deindex.md', 'en/*.md')` **matches** (checked: it returns `true`, while
`minimatch('en/deindex.md', 'en/**/index.md')` returns `false`). The German document is then attributed to the
English source and resolved to `content/en/de/index.md`.

Measured: with `en/*.yml` / `en/*.md` singletons, exactly the three German singletons
(`index`, `menuPage`, `eventsPage`) resolved to a non-existent `content/en/de/…`. With
`en/**/index.md` the mangled candidate no longer matches the glob, the correct German source is
found, and all 54 rows resolve. The per-item collections were never affected — their prefixes are
non-empty (`/events`, `/menu`, `/menu-categories`).

A related sharp edge in the same helper, not currently hit: `generateFsPathFromId` returns the path
unchanged when it already `startsWith(fixed)` — compared as a **string, not a path segment**. With
a fixed part of `de/`, a file named `content/de/de-something.yml` would resolve without its folder.
Only files whose name begins with their own locale code are at risk. Worth knowing before someone
adds `content/en/enquiries.md`.

## What this breaks in this repo

Everything below is implementation work for the follow-up ticket, not a reason to reconsider the
layout.

- **`npm run check:studio` fails for every English file** (measured: exit 1, "26 committed content
  file(s) are absent from the dump" listing `content/en/**`, then a hard failure on the dump holding
  `content/events/cacao-journey-series.md`, which no longer exists at HEAD). `contentPathFor`
  (`scripts/studio-document.mjs:211`) maps an id to a file by dropping the first segment:
  `content/${id.split('/').slice(1).join('/')}`. That was exact under the flat tree. Under the
  locale-prefixed tree it produces `content/menu/latte.yml` for a file that lives at
  `content/en/menu/latte.yml` — 26 of the 54 rows (measured; every English row). The fix matches
  that file's own stated policy of borrowing Studio's helpers rather than reimplementing them: use
  `getCollectionSourceById` + `generateFsPathFromId` from
  `node_modules/nuxt-studio/dist/module/runtime/utils/`. This is the map's stated gate
  ("`npm run check:studio` green before and after"), so it needs doing as part of the move, not
  after.
- **`npm run check:content` crashes** (exit 1, `ENOENT` on `content/index.md`):
  `scripts/check-content-parity.mjs:12` hardcodes `content/index.md` / `content/index.de.md`.
- **`eventSlug()`** and **`app/pages/events/[slug].vue`**, as above (both already changed on the
  research branch).
- **The unit suite does not notice any of this** — 266/266 still pass after the restructure. Two
  tests encode the old convention as their fixture without asserting it structurally:
  `test/unit/studio-document.spec.ts:127-128` (`contentPathFor('index/index.de.md')`, still true of
  the pure function, no longer true of any real file) and `test/unit/events.spec.ts:66-67`
  (`stem: 'events/dinner.de'`). They should be updated with the move, but a green `npm run test` is
  not evidence the move worked. The two `check:*` scripts and a build are.
- **Nothing else queries by `path`** today (`app/pages/**`, `app/composables/**` all filter on
  `locale`, and `useNextEvent` selects `stem`), so the blast radius of the id change is limited to
  the two scripts, the two test files and `eventSlug()`.

## Also worth knowing

- **`cwd: '~~/content/en'` silently ingests nothing, and the build stays green.** The alias is
  substituted as `String(normalize(cwd)).replace(/^~~\//, rootDir)` (`module.mjs:1973`) and
  `rootDir` carries no trailing slash, so `~~/content/en` becomes `<rootDir>content/en` — a
  directory that does not exist. The glob catches nothing, the collection ends up empty, and
  `nuxt build` exits 0. It was tested deliberately: that build shipped a menu page with no English
  categories at all. Only an absolute path works (`fileURLToPath(new URL('./content/en',
  import.meta.url))` in `content.config.ts` is fine), which is what the docs say — but nothing warns
  you. Moot now that `cwd` is out, but it is the same silent-failure shape as any typo'd `include`.
- **The dev server was checked, not just the build.** `npm run dev` served `/`, `/de`, `/menu`,
  `/de/menu`, `/events`, `/de/events` and both language's event pages with 200 and the correct
  language, and editing `content/de/events/easter-brunch-buffet.md` and `content/de/menu/waffle.yml`
  hot-reloaded into the served page — so the dev watcher follows locale sources.
- **`sitemap.loc` is stored in the database.** It is derived from `path` at parse time, so the
  restructure updates it wholesale on the next build; there is nothing to migrate, but it does mean
  a stale content database would serve stale locations.
- **Studio's browser-side state** (the map's open question) was not touched here. This research
  covers only whether Studio can *resolve* a row to a file, which it can.

## How to reproduce

Branch `research/nuxt-content-locale-paths` carries the restructured tree, the rewritten
`content.config.ts`, and four throwaway probes at the repository root:

| Script | What it shows |
|---|---|
| `research-restructure.sh` | the `git mv`s that produced the locale-prefixed tree |
| `research-dump.mjs` | `id` / `stem` / `path` / `locale` for every row of the built database |
| `research-queries.mjs` | the `stem LIKE` locale filter and the `path()` lookups |
| `research-studio-fspath.mjs` | id → file round-trip, via Studio's own helpers |
| `research-cwd-vs-glob.mjs` | the same round-trip scored across the three source spellings |
| `research-fspath-trace.mjs` | the empty-prefix mis-match, step by step |
| `research-glob-probe.mjs` | `**/` matching zero directories in `tinyglobby` and `minimatch` |
| `research-cwd-probe.mjs` | what each `cwd` spelling resolves to |

`npm run postinstall && npm run build`, then `node research-dump.mjs`. The sitemap comparison is
`grep -o "<loc>[^<]*</loc>" .output/public/__sitemap__/*.xml` before and after.
