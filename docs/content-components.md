# Homepage content components (developer reference)

The homepage (`content/index.md` + `content/index.de.md`) is a Nuxt Content **MDC document**. Its sections are custom components in `app/components/content/`, registered globally for MDC via `nuxt.config.ts`:

```ts
components: [
  { path: '~/components/content', global: true, pathPrefix: false },
  '~/components'
]
```

The page is rendered by `app/pages/index.vue` with `<ContentRenderer :value="page" />`; only `locale` + `seo` live in frontmatter (see the `index` collection in `content.config.ts`).

## Design principle

**Content files hold only editorial content** (headings, body copy, images, hours). **Presentation lives in code** — button styling, section CTAs (via i18n keys under `home.*`), icons defaults, and the Google Maps embed (`CAFE_MAP_EMBED_URL` in `shared/utils/constants.ts`). This keeps the Studio editing surface clean for non-technical editors.

## Components

| MDC tag | Component | Props | Slot / children | Repeatable |
|---------|-----------|-------|-----------------|------------|
| `::home-hero` | `HomeHero` | `headline, title, description, image{src,alt}` | — (CTAs from i18n `home.hero.*`) | no |
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
| `::callout` | `Callout` | `icon, title` | default slot = note text | ✅ reusable |

Note `Feature` is shared by both `FeatureGrid` (Philosophy) and `EventsIntro` (Events) — reuse it wherever a feature card is needed.

**These components are global**, so they work in *any* MDC document — not just the homepage.
Event pages (`content/events/*.md`) use `::callout` and can use `::feature-grid`, `::gallery`,
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
3. Use it in `content/index.md` **and** `content/index.de.md` with `::my-section`.
4. Run `npm run lint && npm run typecheck && npm run build` — the build prerenders `/` and `/de`, which is the fastest way to confirm the component resolves and renders.

## Locale parity

`index.md` (en) and `index.de.md` (de) must contain the **same set and order of blocks**; only the copy differs. When adding/removing a block, do it in both files.
