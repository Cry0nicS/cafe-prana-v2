import { defineNuxtModule } from 'nuxt/kit'

// Runs the image optimiser as part of the production build.
//
// Studio commits uploads straight to `main` with no local checkout involved,
// so nothing guarantees anyone ever ran `npm run optimize:images` over them.
// Gating on that by hand is what used to turn every upload into a red run and
// a chore. Doing the pass here instead means the deployed site is always
// normalised, and the committed files lagging behind is cosmetic.
//
// The pass renames `foo.png` to `foo.webp` and rewrites the `src` that points
// at it, so it has to finish before anything reads either side of that pair.
// `@nuxt/content` parses `content/` in `modules:done`, which is already too
// late for a build hook: hooking `build:before` renamed the file after the
// collections had recorded the old path, and the prerender then died on a
// missing `/_ipx/**/foo.png`. Module setup is the last point that runs to
// completion before `modules:done` fires, so the work happens here, directly.
//
// Deliberately production-only. Dev, `nuxt prepare` (which is what
// `postinstall` and `npm run typecheck` run) and the Vitest Nuxt environment
// all load modules as well, and none of them has any business rewriting the
// working tree behind you.
export default defineNuxtModule({
  meta: {
    name: 'optimize-images'
  },
  async setup(_options, nuxt) {
    if (nuxt.options.dev || nuxt.options.test || nuxt.options._prepare) {
      return
    }

    // Imported here rather than at the top of the file so that the cases above
    // never load `sharp`'s native binding at all: a broken platform binary
    // should not be able to fail `npm install` or `nuxt dev`.
    const { optimizeImages } = await import('../scripts/optimize-images.mjs')

    // Resolves even when a file could not be encoded, on purpose. The `images`
    // workflow is what goes red for that; a deployment carries on.
    await optimizeImages()
  }
})
