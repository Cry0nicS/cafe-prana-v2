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

**Content files hold only editorial content** (headings, body copy, images, hours). **Presentation lives in code** — button styling, section CTAs (via i18n keys under `home.*`), icons defaults, and the Google Maps embed (`CAFE_MAP_EMBED_URL` in `shared/utils/constants.ts`). This keeps the Studio editing surface clean for non-technical editors.

## Markdown styling

Everything the owner writes as plain Markdown — headings, lists, links, quotes, tables, rules, images — is rendered by Nuxt UI's prose components and themed in **one place**: `ui.prose.*` in `app/app.config.ts`. Those entries are *appended* to Nuxt UI's defaults and resolved by `tailwind-merge`, so a value that does not conflict has to be undone by name (`not-italic`, `border-0`, `rounded-none!`) rather than replaced.

`.cafe-prose` in `app/assets/css/main.css` holds only what a utility class cannot express: the reading measure (text caps at 65ch while photos, tables and video keep the full column), the `.cafe-quote` pull quote, and the `.cafe-rule` section break.

## Components

| MDC tag | Component | Props | Slot / children | Repeatable |
|---------|-----------|-------|-----------------|------------|
| `::home-hero` | `HomeHero` | `headline, title, description, image{src,alt}` | — (CTAs from i18n `home.hero.*`; see the next-event note below) | no |
| `::feature-grid` | `FeatureGrid` | `icon, headline, title, description` | `::feature` children | — |
| `::feature` | `Feature` | `icon, title, description` | — | ✅ reusable |
| `::menu-highlights` | `MenuHighlights` | `icon, title, description` | `::menu-highlight` children (CTAs from `home.menu.*`) | — |
| `::menu-highlight` | `MenuHighlight` | `title, description, image{src,alt}` | — | ✅ reusable |
| `::events-intro` | `EventsIntro` | `icon, headline, title, description, image{src,alt}` | `::feature` children (CTAs from `home.events.*`) | — |
| `::gallery` | `Gallery` | `icon, headline, title, description, images[]{src,alt}` | — (renders a `UCarousel`; each image opens in a lightbox) | — |
| `::story-section` | `StorySection` | `icon, title, image{src,alt}` | default slot = prose (rich text) | — |
| `::faq` | `Faq` | `icon, title, description` | `::faq-item` children | — |
| `::faq-item` | `FaqItem` | `label` | default slot = answer prose | ✅ reusable |
| `::directions` | `Directions` | `title, description, hoursHeading` | — (hours from `content/opening-hours.yml`; map + CTAs from code) | no |
| `::callout` | `Callout` | `icon, title, color` (`neutral` \| `positive` \| `caution`) | default slot = note text | ✅ reusable |
| `::video` | `VideoEmbed` | `url, title, poster{src,alt}` | — (click-to-load YouTube / Vimeo frame) | ✅ reusable |

Note `Feature` is shared by both `FeatureGrid` (Philosophy) and `EventsIntro` (Events) — reuse it wherever a feature card is needed.

### Two tags that are not what they look like

`::callout` and `::video` both reach their component through `mdc.components.map` in `nuxt.config.ts`, and both would silently render as something else without it:

- **`callout`** is claimed by Nuxt UI, which installs a tag map pointing it at its own `ProseCallout`. Until that map entry was added, this project's `Callout.vue` never rendered at all — every callout in `content/*/events/` came out as a documentation-site box.
- **`video`** is an HTML tag, so Nuxt refuses to register a component called `Video`, and MDC resolves a bare HTML tag to the element before it consults the component registry. The component is therefore `VideoEmbed`, and the map is what lets a body write `::video`. A raw `<video>` element in a body lands in the same component rather than rendering unstyled.

The rest of Nuxt UI's tag map (`::card`, `::accordion`, `::tabs`, …) is deliberately left alone, so anything already published keeps rendering.

## What the owner can insert

Studio's `/` menu is **an allowlist**, declared in `shared/utils/studio-editor.ts` and spread into `studio.editor` by `nuxt.config.ts`. Add a component to `app/components/content/` and it does *not* appear in the menu until it is named there — `test/unit/studio-editor.spec.ts` fails until the decision is made either way.

This replaces an earlier claim in this file that keeping a component outside `app/components/content/` keeps it out of Studio. **It does not.** The list Studio reads comes from `nuxt-component-meta`, which enumerates every global component plus every tag used anywhere in `content/`; it is not folder-scoped, and it changed between two `nuxt prepare` runs in the same tree. `EventsEventFeature`, `EventsEventCard`, `MenuItemCard` and a rotating cast of `U*` components all reached the owner's menu that way, and none of them can be authored from a Markdown body.

`STUDIO_EDITOR` also drops four editor commands: `heading1` (the page template already renders the document title as the `h1`), `codeBlock` and `code` (no source code on a café site), and `video` (it inserts a bare `<video>` element; `::video` replaces it).

### The next-event hero

`HomeHero` reads the soonest upcoming event through `useNextEvent` (a locale-aware query over
the `events` collection plus `nextUpcomingEvent` from `app/utils/events.ts`, which reuses the
listing page's `isUpcomingEvent`). When there is one it renders `NextEventHero`, an announcement
poster built from the event document, and passes only its own `title` along; `headline`,
`description` and `image` drive the welcome hero alone. When there is none, the welcome
`UPageHero` renders unchanged.

`NextEventHero` lives in `app/components/events/` (used as `EventsNextEventHero`), not in
`app/components/content/`, because it takes the event as a prop and cannot render from content.
Keeping it out of that folder does *not* keep it out of Studio - see "What the owner can insert"
above; the allowlist is what does that. So there is no `::next-event-hero` to place in
`index.md`, and both locale homepages keep the same block set. The eyebrow and the button
label are `home.hero.nextEvent` / `home.hero.viewEvent` in `i18n/i18n.config.ts`. Its photo
deliberately uses the event detail page's `sizes`/`format`: `ipxStatic` only bakes variants that
were rendered during prerender, and those exist for every event, so whichever event becomes next
after a date rollover still resolves.

**These components are global**, so they work in *any* MDC document — not just the homepage.
Event pages (`content/{en,de}/events/*.md`) use `::callout` and can use `::feature-grid`, `::gallery`,
etc. in their freeform body.

## MDC nesting rule

Container blocks use **more colons** than their children. Homepage uses 3 colons for containers and 2 for children:

```md
:::feature-grid
---
icon: i-lucide-leaf
title: My Philosophy
---
::feature{icon="i-lucide-wheat-off" title="100% Gluten-Free" description="…"}
::
:::
```

Keep every fence at column 0 — indenting a block by 4 spaces turns it into a Markdown code block.

## Adding a new section component

1. Create `app/components/content/MySection.vue`. Take short text as props (defaults where sensible); expose a default `<slot />` for additive content / child blocks.
2. Keep styling and any CTAs in code (add labels to `i18n/i18n.config.ts` under `home.*` if localized).
3. Decide whether the owner may insert it: add it to a group in `shared/utils/studio-editor.ts`, or to `STUDIO_NOT_OFFERED` with the reason. The suite fails until you do.
4. Use it in `content/en/index.md` **and** `content/de/index.md` with `::my-section`.
5. Run `npm run lint && npm run typecheck && npm run build` — the build prerenders `/` and `/de`, which is the fastest way to confirm the component resolves and renders.

## Locale parity

`content/en/index.md` and `content/de/index.md` must contain the **same set and order of blocks**; only the copy differs. When adding/removing a block, do it in both files. See `docs/adr/0001-bilingual-content-layout.md` for why the locale is the folder rather than a filename suffix.
