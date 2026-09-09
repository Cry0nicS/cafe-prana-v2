import type { ModuleOptions } from 'nuxt-studio'

/**
 * What the owner is offered in Nuxt Studio's visual editor.
 *
 * Studio builds its `/` menu from `nuxt-component-meta`, which enumerates every
 * global component plus every tag that appears anywhere in `content/`. That list
 * is derived, it is not scoped to `app/components/content/`, and it changes
 * between builds - two `nuxt prepare` runs in the same tree produced lists that
 * differed by a dozen entries. So the palette is an allowlist, never a blocklist:
 * anything not named here cannot reach the owner, however the upstream list
 * shifts.
 *
 * `include` bounds what the meta endpoint returns at all; `ungrouped: 'omit'`
 * catches anything that slips past it. Both, deliberately.
 *
 * This is only about what the owner can *insert*. Every component stays
 * registered and every already-published tag keeps rendering.
 *
 * One non-obvious consequence, worth knowing before adding to this list. Studio
 * derives `hasNuxtUI` from whether any component it is served resolves inside
 * `@nuxt/ui`, and that single flag gates two things at once: whether its editor
 * registers the built-in `u-callout` tiptap node, and whether its parser turns
 * `::callout` (and `::note` / `::tip` / `::warning` / `::caution`) into that
 * node instead of a generic element. Because nothing here comes from
 * `@nuxt/ui`, the flag is false, both halves are off together, and `::callout`
 * is parsed as an ordinary component block like `::feature`. Putting a Nuxt UI
 * component back in the palette flips the flag and hands those five tags to
 * Studio's own callout node - which is not this project's `Callout`.
 */

/** Homepage-scale blocks: a whole band of the page, top to bottom. */
export const STUDIO_PAGE_SECTIONS = [
  'HomeHero',
  'FeatureGrid',
  'Feature',
  'MenuHighlights',
  'MenuHighlight',
  'EventsIntro',
  'Gallery',
  'StorySection',
  'Faq',
  'FaqItem',
  'Directions'
] as const

/** Blocks that belong inside a body of text, on any page. */
export const STUDIO_TEXT_BLOCKS = [
  'Callout',
  'VideoEmbed'
] as const

/**
 * Content components deliberately left out of the menu, with the reason. A test
 * asserts that every file in `app/components/content/` appears in one list or
 * the other, so adding a component forces the decision rather than defaulting to
 * "the owner gets it".
 */
export const STUDIO_NOT_OFFERED: Record<string, string> = {}

export const STUDIO_EDITOR: NonNullable<ModuleOptions['editor']> = {
  commands: {
    // heading1: the page template renders the document title as the `h1`; a
    //   second one in the body gives every event page two competing titles.
    // codeBlock / code: there is no source code on a cafe website.
    // video: inserts a bare `<video>` element - unstyled, unbounded, and no use
    //   for a clip that lives on YouTube. `::video` replaces it.
    exclude: ['heading1', 'codeBlock', 'code', 'video']
  },
  components: {
    include: [...STUDIO_PAGE_SECTIONS, ...STUDIO_TEXT_BLOCKS],
    groups: [
      { label: 'Page sections', include: [...STUDIO_PAGE_SECTIONS] },
      { label: 'Text blocks', include: [...STUDIO_TEXT_BLOCKS] }
    ],
    ungrouped: 'omit'
  },
  // Both collections are pre-bundled into the client (see `icon.clientBundle` in
  // `nuxt.config.ts`); anything else would be fetched at runtime and warn.
  iconLibraries: ['lucide', 'simple-icons']
}
