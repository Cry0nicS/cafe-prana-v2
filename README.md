# Cafe Prana v2

Cafe Prana v2 is the Nuxt-powered website for **Cafe Prana** in Berlin: a cozy, community-focused space serving 100% gluten-free, vegan, and organic food.

The homepage is fully content-driven and highlights the cafe's philosophy, menu favourites, community events, gallery, founder story, guest testimonials, FAQs, and directions with opening hours.

## Highlights

- Hero with quick actions to menu and directions
- Philosophy section focused on nourishing, plant-based, gluten-free food
- Menu spotlight cards, events, testimonials, and FAQ
- Gallery carousel and embedded Google Maps section with opening hours
- Dismissible site-wide notice card the owner schedules from Studio
- SEO metadata sourced from content

## Tech Stack

- [Nuxt 4](https://nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Nuxt Content](https://content.nuxt.com/)
- [Nuxt Image](https://image.nuxt.com/)

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Images

Images live in `public/images`. Their responsive variants are generated at build
time and served as static files, so nothing is optimised at request time.

Every production build normalises the folder first: it resizes anything longer
than 1800px on its longest edge, re-encodes still PNG/JPEG/TIFF/AVIF to WebP
unless the original is already smaller, and rewrites the `src` references that
point at the files it renames. So an upload through Studio, which commits
straight to this repository without a checkout in between, is deployed in its
optimised form even though the committed file is not.

Not everything is covered. Animated images, GIF and SVG pass through untouched,
and a still image that cannot be squeezed under 400KB is only reported. A file
the encoder chokes on is left in place and logged rather than failing the
build, so a bad upload costs page weight, never a deployment.

To settle the committed files into that same form, run the pass by hand and
commit the result:

```bash
npm run optimize:images
```

A second run is a no-op, so it is safe to run at any time. The `images`
workflow reports in its summary when the committed files have drifted, without
failing over it — the build has already handled that. It does go red when the
pass cannot process a file at all.

## Tests

```bash
npm test         # run once, as CI does
npm run test:watch
```

The suite (Vitest + `@nuxt/test-utils`) covers the two paths a guest can break:
reservations and contact messages.

- `test/unit` — the shared Zod schemas that both the forms and the API routes
  validate against (opening hours, closed days, guest limits, consent, ...).
- `test/server` — the Nitro routes and the Mailgun service, running in plain
  Node with Supabase and Mailgun mocked. Nitro auto-imports come from
  `test/setup/nitro-globals.ts`.
- `test/nuxt` — the reservation and contact form components, mounted in the Nuxt
  environment with the API endpoints stubbed.
