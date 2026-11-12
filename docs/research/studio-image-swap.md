# Why the Studio homepage image swap doesn't show

> **Superseded on the homepage.** Homepage pictures are now markdown images in each section's
> slot, not `image` props, so none of the prop shapes below can occur there any more. Kept as
> the record of why. See `docs/content-components.md`.

Investigated 2026-11-05. Installed versions: `nuxt-studio` 1.7.0, `@nuxt/content` 3.16.2,
`@nuxtjs/mdc` 0.23.2, `remark-mdc` 3.11.1, `@nuxt/image` 2.2.0, `nuxt-component-meta` 0.18.0.

## Summary / root cause

**The image doesn't show because Studio wrote it as a plain string, while every homepage
image component expects an object `{ src, alt }`.** `HomeHero` renders the picture only when
`image?.src` is truthy. `"/images/hero.webp".src` is `undefined`, so the `<NuxtImg>` is never
rendered. There is no 404 and no error, and the whole image block is missing.

Studio wrote a string because **Nuxt Studio 1.7 classifies the prop
`image?: { src?: string, alt?: string }` as a `string` field**. Its prop-type heuristic
checks whether the type text contains `"string | "`, and the inline object type
`{ src?: string | undefined; alt?: string | undefined; }` does. So Studio's form shows
"Image" as one text/media field and saves a flat path.

This is a systemic fault, not a one-off. The same thing has already silently removed **five**
homepage images, all of which are missing on the live site today:

| Slot | File | Broken since |
| --- | --- | --- |
| EN home hero | `content/en/index.md:3,6` | 9658d68, 2026-11-04 |
| DE home hero | `content/de/index.md:6` | 5a3d311, 2026-10-07 |
| EN events-intro | `content/en/index.md:79` | f4b043f, 2026-09-14 |
| EN "Ceremonial Cacao" highlight | `content/en/index.md:58` | 7202e94, 2026-09-14 |
| DE "Zeremonieller Kakao" highlight | `content/de/index.md:59` | 154d06a, 2026-09-14 |

PR #60 didn't touch rendering. It made the parity check stop reading the `:image:` line, and
that line was the only automated signal that something had gone wrong. The image file itself
is fine. Separately, the EN content still points at the **old** `/images/hero.webp`, so even
with the shape fixed, EN would show the previous picture (see Open questions).

## Evidence timeline

| When (UTC) | What | Source |
| --- | --- | --- |
| 2026-09-14 | Studio flattens EN events-intro `image` to a string; EN/DE cacao highlights become inline `image="..."` | `git log -p -- content/en/index.md content/de/index.md` |
| 2026-10-07 15:16 | Studio "index" (5a3d311) flattens the DE hero `image` to `/images/menu-pics/1000003798.webp` | `git show 5a3d311` |
| 2026-10-31 19:35 | "pic" (e9d0dd1) changes the **DE events page** hero (`content/de/events.yml`). That is a YAML collection with a zod schema, so the object shape `{src, alt}` survived. Not related; it renders live. | `git show e9d0dd1`; `content.config.ts:55-60` |
| 2026-11-04 19:33 | "pic home" (9658d68) replaces the EN hero `image: {src, alt}` with `:image: /images/hero.webp` + `image: /images/hero.webp`. Only `content/en/index.md` changed: no media file was committed, and DE was not touched. | `git show --stat 9658d68` |
| 2026-11-04 19:34 | CI run 41898017050: **Content checks** fails. The parity script read `:image:` as an MDC component (`content/en/index.md: home-hero, image, feature-grid, …`). Lint, typecheck, build and test all passed. | `gh run view 41898017050 --log-failed` |
| 2026-11-04 19:35 | **9658d68 deployed to Vercel Production anyway**, so the deploy is not gated on CI | `gh api repos/Cry0nicS/cafe-prana-v2/deployments` |
| 2026-11-04 23:46 | PR #60 / 2d4cfef: the parity check skips YAML props. CI green. Production deploy 23:49. | `gh pr view 60`; commit statuses |
| 2026-11-05 | Live `https://www.cafeprana.de/` and `/de`: the first `<img data-nuxt-img>` after the logo is the waffle highlight. No hero `<img>`, no preload for it, and `1000003798` does not appear in the DE HTML at all. `/images/menu-pics/1000003798.webp` returns 200, so the file is fine. | `curl` (see below) |

## Cause analysis

### 1. The components require an object (verified)

- `app/components/content/HomeHero.vue:6` declares `image?: { src?: string, alt?: string }`.
  Line 57 has `v-if="image?.src"` and line 76 has `:src="image.src"`.
- The same shape and guard are in `EventsIntro.vue:7,74`, `MenuHighlight.vue:5,19` and
  `StorySection.vue:5,23`. `docs/content-components.md:28-35` documents `image{src,alt}`.

### 2. The string reaches the component unchanged (verified)

- When it parses, remark-mdc keeps string props under their plain key. Only non-strings are
  re-keyed as `:key` + JSON (`bindData`, `node_modules/remark-mdc/dist/index.mjs:2135-2146`).
- `MDCRenderer` resolves a `:key` prop with `evalInContext`, which falls back to `destr(code)`
  (`node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue:310-336`).
  `destr("/images/hero.webp")` is the same string. So both the `:image` and the `image` key
  give the component a string.
- Live HTML confirms the hero, the EN events-intro and both cacao images are not rendered.
  `curl -sL https://www.cafeprana.de/ | grep -o '<img[^>]*>'` lists logo, waffle, chai,
  banana bread, then the gallery. DE renders its events-intro (object form, still intact).

### 3. Why Studio wrote a string (verified against the Studio 1.7.0 bundle)

Studio builds an MDC component's prop form from `nuxt-component-meta`. The function minified
as `Upe` in `node_modules/nuxt-studio/dist/app/main-CcK4joxm.js` (the chunk imported by
`dist/app/main.js`) decides each prop's field type, in this order:

```js
i = schema.type.replace(" | undefined", "")
if (i === "boolean") ...; else if (i === "number") ...; else if (depth > 1) "string"
else if (i === "string" || i.includes("string | ") || i.includes(" | string")) a = "string"   // <- hits here
else if (i.includes("[]")) "array" ... else if (schema.kind === "object") "object"
else if (schema.kind === "enum") { object member whose type does NOT include "string" ? "object" : "string" }
```

For `HomeHero.image`, component-meta records the type as
`{ src?: string | undefined; alt?: string | undefined; } | undefined`
(`node_modules/.cache/nuxt/.nuxt/component-meta.mjs`). After `" | undefined"` is stripped
once, the text still contains `string | `, so the prop becomes a **string** field keyed
`image`. Its initial value is read from `props.image ?? props[':image']`, which is the raw
JSON text of the old object, and then saved as whatever path is entered. The form builder
(`zpe` in the same chunk) uses a non-`:` key for string fields. That's why the output has a
plain `image: <path>` and loses `alt`.

A probe re-runs the real `Upe` code from the bundle against this repo's component-meta.
Script (run from the scratchpad, with the repo root as `argv[2]`):

```js
const bundle = readFileSync(`${root}/node_modules/nuxt-studio/dist/app/main-CcK4joxm.js`, 'utf8')
const start = bundle.indexOf('Upe=(e,t,n,o)=>'); const end = bundle.indexOf(',Vpe=', start)
const qpe = () => []; const Upe = eval(bundle.slice(start + 4, end))
const meta = (await import(`${root}/node_modules/.cache/nuxt/.nuxt/component-meta.mjs`)).default
// for each component's image prop: Upe('#x', p.name, p, 0)
```

Output:

```
HomeHero image -> {"type":"string"}
EventsIntro image -> {"type":"string"}
MenuHighlight image -> {"type":"string"}
StorySection image -> {"type":"string"}
Gallery images -> {"type":"array"}          // named alias `GalleryImg[]`, which is why gallery edits keep {src, alt}
named-type control (HeroImage | undefined) -> {"type":"object"}
```

The schema comment at `content.config.ts:55-57` ("Studio 1.7 recognizes `src` as an image")
applies to **collection** schemas (YAML files such as `events.yml`), not to MDC component props.
That is why e9d0dd1 kept its shape and 9658d68 did not.

**Hypothesis, not verified:** the exact edit sequence that left *both* `:image:` and `image:`
in 9658d68. The likely sequence is that the form wrote `image` while the original `:image` key
was still on the node with a path assigned to it. When serialised, a `:`-key whose value is not
valid JSON keeps its colon (`remark-mdc/dist/index.mjs:312-328`). Either way, both values are
strings and the result is the same.

### 4. Things ruled out

- **Missing or unprocessed image file.** No upload was committed in 9658d68, and the EN path is
  the existing `/images/hero.webp` (200 live). The DE `.webp` target exists live (200), because
  `modules/optimize-images.ts` converts the committed `.jpg` at build time.
- **ipxStatic not baking the variant** (`nuxt.config.ts:169-179`). That would produce a 404'd
  `<img>`, but there is no `<img>` at all.
- **The next-event poster replacing the hero** (`HomeHero.vue:36-40`). The latest event is
  2026-11-01 (`content/en/events/frauenretreat.md:3`), so nothing is upcoming and the welcome hero
  branch renders.
- **Locale parity.** ADR 0001 deliberately allows the props to differ per locale.

### 5. What PR #60 did

Skipping YAML props in the structure check is consistent with ADR 0001 ("no cross-locale
field-parity checking", `docs/adr/0001-bilingual-content-layout.md:119`), so the change itself
is reasonable. But the PR description calls the `:image:` line "harmless". It isn't: it was the
visible symptom of the type mismatch. No check validates that a component's props have the
shape the component reads, so CI is now green with the image missing.

## Proposed fix

Make the MDC image props the shape Studio 1.7 actually edits (a string path), and make
rendering tolerant of both shapes so that neither the old content nor a future Studio
behaviour can blank an image again.

1. **New `shared/utils/content-image.ts`** (auto-imported on app and server):

   ```ts
   export type ContentImage = { src: string, alt: string }

   // Studio 1.7 edits MDC image props as a flat path; older content (and YAML
   // collections) use { src, alt }. Accept both so a shape change never blanks an image.
   export const resolveContentImage = (image: unknown, alt = ''): ContentImage | null => {
     if (typeof image === 'string') {
       const value = image.trim()
       if (value.startsWith('{')) {
         try { return resolveContentImage(JSON.parse(value), alt) } catch { return null }
       }
       return value ? { src: value, alt } : null
     }
     if (image && typeof image === 'object' && typeof (image as ContentImage).src === 'string' && (image as ContentImage).src) {
       return { src: (image as ContentImage).src, alt: (image as ContentImage).alt || alt }
     }
     return null
   }
   ```

2. **`HomeHero.vue`, `EventsIntro.vue`, `MenuHighlight.vue`, `StorySection.vue`**: change the
   prop to `image?: string` (with a JSDoc saying it is a path from the media library, as
   `VideoEmbed.vue:13` does for `poster`) and add `imageAlt?: string`. Then use
   `const img = computed(() => resolveContentImage(props.image, props.imageAlt))`, with
   `v-if="img"` and `:src="img.src" :alt="img.alt"`. Studio then shows two clear fields,
   "Image" and "Image Alt", instead of a JSON blob. The runtime still accepts legacy objects
   (Vue only warns in dev for the type mismatch).

3. **Content migration (both locales, `content/en/index.md`, `content/de/index.md`)**: rewrite
   every homepage image to `image: <path>` + `imageAlt: <text>`. Delete the stray
   `:image: /images/hero.webp` line, and restore the alt texts lost in the flattening. They are
   in git: `git show 9658d68^:content/en/index.md`, `git show 5a3d311^:content/de/index.md`
   and `git show f4b043f^:content/en/index.md`. Set the EN hero `image` to whatever picture the
   owner actually intended (see Open questions).

4. **Tests and docs**: add a unit test for `resolveContentImage` covering string, object, JSON
   string, empty and garbage input. In `test/nuxt/home-hero.spec.ts`, add a case mounting with
   a string `image` and asserting the `<img>` is present. Update the `image{src,alt}` rows in
   `docs/content-components.md:28-35` and the alt-text hint in `docs/editing-the-homepage.md:83`.

**Smaller alternative (verified by the probe, more fragile):** keep the object shape but give
it a named alias (`image?: ContentImage`). Component-meta then prints the alias name and Studio
classifies it as `object` with `src`/`alt` children. This relies on Studio's
`!type.includes("string")` quirk and on alias names surviving component-meta. It is also
unknown whether a nested `src` gets the media picker. Pair it with `resolveContentImage`
regardless.

**Stopgap (content only, no deploy of code):** put the four broken slots back to the object form
`image:\n  src: …\n  alt: …` in both files. That fixes the site now, but the next Studio edit of
any of those blocks breaks it again.

## Prevention

- **Content shape check in CI** (extend `scripts/check-content-parity.mjs` or add one). Parse
  `content/*/index.md` with `remark-mdc` (already a devDependency). For every
  `home-hero` / `events-intro` / `menu-highlight` / `story-section` node, assert that
  `resolveContentImage(image, imageAlt)` returns a `src` and that the file exists under
  `public/` (allow a `.jpg`→`.webp` rename to match `optimize-images`). Also fail on any
  `:`-prefixed YAML prop key whose value is not valid JSON: it is never what the editor meant.
- **Studio-form contract test**: a Vitest test that runs the bundle's `Upe` the same way as the
  probe above over `component-meta` for every component in `app/components/content/`, and
  asserts that each prop's Studio type matches what the component reads. Re-run it when moving
  to Studio 1.8.x (see the pinned-Studio note in project memory). A cheaper rule is to never
  use inline object-literal prop types on content components.
- **Gate production on CI.** Vercel deployed 9658d68 to Production although CI failed. Use
  Vercel's "wait for checks"/ignored build step, or deploy from the CI workflow, so a red
  content check stops the deploy.
- Tell the owner to check the live page after a Studio publish. The site gave no error at all
  in any of the five cases.

## Open questions

1. **Which image did the owner mean to put on the EN hero?** 9658d68 still points at
   `/images/hero.webp`, the same file as before the edit, and no new media was committed. She
   may have intended `/images/menu-pics/1000003798.webp` (the DE hero), or the upload/selection
   didn't register. Ask her.
2. Does Studio 1.7 open the media picker for a top-level `string` prop named `image`? The
   precedent is `VideoEmbed.poster` ("what Studio's picker writes", `VideoEmbed.vue:13`), and the
   owner's commits contain clean picker-style paths. Confirm in the Studio UI before relying on
   step 2.
3. The DE hero carries `class: front room` (b717b37). Studio always adds a "Class" field to
   component forms (same chunk, the `e.class||(e.class={…title:"Class"…})` default). The owner
   likely typed a caption there. It is harmless (no such CSS classes), but worth removing and
   explaining to her.
4. Whether Studio 1.8.x changes the `Upe` heuristic. Re-run the probe when upgrading.
