# Content components (developer reference)

The homepage (`content/en/index.md` + `content/de/index.md`) is a Nuxt Content **MDC document**. Its sections are custom components in `app/components/content/`, registered globally for MDC via `nuxt.config.ts`:

```ts
components: [
  { path: '~/components/content', global: true, pathPrefix: false },
  '~/components'
]
```

The page is rendered by `app/pages/index.vue` with `<ContentRenderer :value="page" />`; only `locale` + `seo` live in frontmatter (see the `index` collection in `content.config.ts`).

## Design principle

**The owner writes plain markdown; the section decides what it means.** Every homepage section
takes its text - headings, paragraphs, pictures - from its default slot, so Studio shows it as
ordinary inline text rather than as YAML fields in a settings panel. A prop is kept only for a
technical choice: today that is `Feature`'s `icon`, nothing else.

**Presentation lives in code**: type sizes, layout, buttons (labels in `i18n/i18n.config.ts`
under `home.*`), and the Google Maps embed (`CAFE_MAP_EMBED_URL` in
`shared/utils/constants.ts`).

Two things make that work:

- **Structure** comes from `app/utils/slot-parts.ts`. `splitSlot()` sorts a slot's nodes into
  `kicker` (what is written above the title), `title` (the first `#`/`##`, or a block's `###`),
  `body`, `items` (each `###` under the title with what follows it), `media` (every picture on a
  line of its own) and `blocks` (nested components of one tag). It reads the markdown tag
  MDCRenderer stamps on what it renders. It is called during render, never from a `computed`:
  Studio's live preview swaps the slot content, and a cached split would keep the old nodes.
- **Type** is set on the wrapper a section puts each group in, with ordinary utilities. The
  markdown element inside carries none of its own: `<Nodes>` marks what it places `home-md`,
  and one unlayered rule in `app/assets/css/main.css` makes a `home-md` heading or paragraph
  inherit everything (the prose components' own classes sit in a cascade layer, so it wins
  without `!important`). Pictures get their frame, `sizes` and loading through `<Nodes :extra>`.

**The homepage is full width.** `app/layouts/default.vue` takes the page out of the bordered
container on `/` and `/de`, so a section can be a band from edge to edge; each one brings its
own column with `<UContainer>`.

Avoid `**bold**` and `*italic*` in content until the packages are bumped: with
`mdast-util-to-markdown` 2.2.0 and `remark-mdc` 3.11.1, `stringifyMarkdown()` recurses forever
on either one (`RangeError: Maximum call stack size exceeded`), which is the call Studio makes
to write a document back.

## Markdown styling

Everything the owner writes as plain Markdown on an **event page** — headings, lists, links, quotes, tables, rules, images — is rendered by Nuxt UI's prose components and themed in **one place**: `ui.prose.*` in `app/app.config.ts`. Those entries are *appended* to Nuxt UI's defaults and resolved by `tailwind-merge`, so a value that does not conflict has to be undone by name (`not-italic`, `border-0`, `rounded-none!`) rather than replaced.

`.cafe-prose` in `app/assets/css/main.css` holds only what a utility class cannot express: the reading measure (text caps at 65ch while photos, tables and video keep the full column), the `.cafe-quote` pull quote, and the `.cafe-rule` section break.

## Components

| MDC tag | Component | Props | What the owner writes in it | Repeatable |
|---------|-----------|-------|-----------------------------|------------|
| `::home-hero` | `HomeHero` | — | optional line of news, `#` title, paragraph, picture (buttons from `home.hero.*`; two columns with the next event's poster when one is coming up, otherwise centred over the picture) | no |
| `::feature-grid` | `FeatureGrid` | — | `##` title, paragraph, `::feature` children (two columns beside the title) | — |
| `::feature` | `Feature` | `icon` | `###` title, paragraph | ✅ |
| `::menu-highlights` | `MenuHighlights` | — | `##` title, paragraph, `::menu-highlight` children (button from `home.menu.*`) | — |
| `::menu-highlight` | `MenuHighlight` | — | picture, `###` name, paragraph | ✅ |
| `::story-section` | `StorySection` | — | picture (set as a print), `##` title, paragraphs (the first is set as a lead) | — |
| `::events-intro` | `EventsIntro` | — | `##` title, paragraph, then `###` + paragraph per kind of gathering (button from `home.events.*`; shows `EventsNextEventCard` under the paragraph while an event is coming up) | — |
| `::gallery` | `Gallery` | — | `##` title, paragraph, any number of pictures (an even grid; each opens whole on a click) | — |
| `::faq` | `Faq` | — | `##` title, then `###` question + answer paragraphs (each question is a row that opens) | — |
| `::directions` | `Directions` | — | `##` title, paragraph (hours from `content/opening-hours.yml`; map and buttons from code) | no |
| `::callout` | `Callout` | `icon, title, color` (`neutral` \| `positive` \| `caution`) | default slot = note text | ✅ |
| `::video` | `VideoEmbed` | `url, title, poster` | — (click-to-load frame: YouTube / Vimeo link, or a `/videos/*.mp4` file from the media library; `url` takes either; a YouTube video's still is saved at build by `modules/video-thumbnails.ts` and listed in `runtimeConfig.public.videoThumbnails`, a picked `poster` wins) | ✅ |

Homepage pictures are markdown images (`![alt](/images/...)`), not props. That retires the
whole class of problem in `docs/research/studio-image-swap.md`, where Studio rewrote an
`image` prop into a shape the component could not read. `npm run check:content` fails on a
picture whose file is missing from `public/`, and still on a stray `:prop:` line.

### Two tags that are not what they look like

`::callout` and `::video` both reach their component through `mdc.components.map` in `nuxt.config.ts`, and both would silently render as something else without it:

- **`callout`** is claimed by Nuxt UI, which installs a tag map pointing it at its own `ProseCallout`. Until that map entry was added, this project's `Callout.vue` never rendered at all — every callout in `content/*/events/` came out as a documentation-site box.

  Studio claims the same tag on its own side, and the allowlist is what stops it: Studio sets `hasNuxtUI` when any component it is served resolves inside `@nuxt/ui`, and that one flag decides both whether its editor registers a built-in `u-callout` tiptap node *and* whether its parser turns `::callout` (plus `::note` / `::tip` / `::warning` / `::caution`) into that node. Since nothing in the palette comes from `@nuxt/ui`, the flag stays off and `::callout` is edited as an ordinary component block, like `::feature`.
- **`video`** is an HTML tag, so Nuxt refuses to register a component called `Video`, and MDC resolves a bare HTML tag to the element before it consults the component registry. The component is therefore `VideoEmbed`, and the map is what lets a body write `::video`. A raw `<video>` element in a body lands in the same component rather than rendering unstyled.

The rest of Nuxt UI's tag map (`::card`, `::accordion`, `::tabs`, …) is deliberately left alone, so anything already published keeps rendering.

## What the owner can insert

Studio's `/` menu is **an allowlist**, declared in `shared/utils/studio-editor.ts` and spread into `studio.editor` by `nuxt.config.ts`. Add a component to `app/components/content/` and it does *not* appear in the menu until it is named there — `test/unit/studio-editor.spec.ts` fails until the decision is made either way.

This replaces an earlier claim in this file that keeping a component outside `app/components/content/` keeps it out of Studio. **It does not.** The list Studio reads comes from `nuxt-component-meta`, which enumerates every global component plus every tag used anywhere in `content/`; it is not folder-scoped, and it changed between two `nuxt prepare` runs in the same tree. `EventsEventFeature`, `EventsEventCard`, `MenuItemCard` and a rotating cast of `U*` components all reached the owner's menu that way, and none of them can be authored from a Markdown body.

`STUDIO_EDITOR` also drops four editor commands: `heading1` (the page template already renders the document title as the `h1`), `codeBlock` and `code` (no source code on a café site), and `video` (it inserts a bare `<video>` element; `::video` replaces it).

### The next event

`useNextEvent` reads the soonest upcoming event (a locale-aware query over the events collection
plus `nextUpcomingEvent` from `app/utils/events.ts`, which reuses the listing page's
`isUpcomingEvent`). The homepage shows it twice: `HomeHero` puts a linked card with its poster,
title and date beside the text (the hero's own photo then stays in the page hidden, so
`ipxStatic` still bakes it for the day the event has passed), and `EventsIntro` renders `NextEventCard`, the invitation with the event's
picture, date, time, price and description. With nothing coming up both are simply absent.

`NextEventCard` lives in `app/components/events/` (used as `EventsNextEventCard`), not in
`app/components/content/`, because it takes the event as a prop and cannot render from content.
Keeping it out of that folder does *not* keep it out of Studio - see "What the owner can insert"
above; the allowlist is what does that. Its picture is an `EventPoster` (shown whole, never
cropped) and deliberately uses the event detail page's `sizes`/`format` (`EVENT_POSTER_SIZES`): `ipxStatic` only bakes variants that were rendered
during prerender, and those exist for every event, so whichever event becomes next after a date
rollover still resolves.

**These components are global**, so they work in *any* MDC document — not just the homepage.
Event pages (`content/{en,de}/events/*.md`) use `::callout` and `::video` in their freeform body.

## MDC nesting rule

Children use **more colons** than the block they sit in, and are indented two spaces. This is
the form Studio writes, and `content/*/index.md` round-trips through `parseMarkdown` /
`stringifyMarkdown` byte for byte, so a save from Studio changes only what the owner changed:

```md
::feature-grid
## What you can count on

  :::feature{icon="i-lucide-wheat-off"}
  ### 100% gluten-free

  Everything on the menu.
  :::
::
```

Never indent a block by 4 spaces: that turns it into a Markdown code block.

## Adding a new section component

1. Create `app/components/content/MySection.vue`. Take the text from the default slot through `SlotParts`, place each group with `<Nodes>` inside a wrapper, and set the type on the wrapper (`home-title` for the section's title). Add a prop only for a technical choice.
2. Keep styling and any buttons in code (labels in `i18n/i18n.config.ts` under `home.*`).
3. Decide whether the owner may insert it: add it to a group in `shared/utils/studio-editor.ts`, or to `STUDIO_NOT_OFFERED` with the reason. The suite fails until you do.
4. Use it in `content/en/index.md` **and** `content/de/index.md` with `::my-section`.
5. Run `npm run lint && npm run typecheck && npm run test && npm run build` — the build prerenders `/` and `/de`, and `test/nuxt/home-page.spec.ts` renders both homepage files.

## Locale parity

`content/en/index.md` and `content/de/index.md` must contain the **same set and order of blocks**; only the copy differs. When adding/removing a block, do it in both files. See `docs/adr/0001-bilingual-content-layout.md` for why the locale is the folder rather than a filename suffix.
