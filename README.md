# Cafe Prana v2

Cafe Prana v2 is the Nuxt-powered website for **Cafe Prana** in Berlin: a cozy, community-focused space serving 100% gluten-free, vegan, and organic food.

The homepage is fully content-driven and highlights the cafe's philosophy, menu favourites, community events, gallery, founder story, guest testimonials, FAQs, and directions with opening hours.

## Highlights

- Hero with quick actions to menu and directions
- Philosophy section focused on nourishing, plant-based, gluten-free food
- Menu spotlight cards, events, testimonials, and FAQ
- Gallery carousel and embedded Google Maps section with opening hours
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
