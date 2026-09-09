import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import type { DefineSitemapSchemaOptions } from '@nuxtjs/sitemap/content'
import { NOTICE_TONES } from './shared/utils/notice'
import {
  DEFAULT_LAST_RESERVATION_BEFORE_CLOSING,
  MAX_LAST_RESERVATION_BEFORE_CLOSING,
  OPENING_TIME_OPTIONS
} from './shared/utils/opening-hours'

// RESEARCH (#35): locale-prefixed content tree. Every source puts the locale
// folder inside the glob's *fixed* part (`en/events/*.md`) and then writes out
// the `prefix` the public URL needs. The fixed part is stripped from the key,
// the prefix is prepended, and `stem`/`path` follow from the result.
// `cwd` would do the same to `path` but breaks Studio - see the findings doc.

const createBaseSchema = () => z.object({
  title: z.string(),
  description: z.string()
})

const createButtonSchema = () => z.object({
  label: z.string(),
  icon: z.string().optional(),
  to: z.string().optional(),
  color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional(),
  target: z.enum(['_blank', '_self']).optional()
})

const createImageSchema = () => z.object({
  // Studio 1.7 recognizes `src` as an image and opens its full media dialog.
  // Explicit input: 'media' selects the compact, eight-thumbnail picker instead.
  src: z.string(),
  alt: z.string()
})

// SEO is derived in code from each page's title/description/image, so the field
// is hidden from the Studio editor on every collection that uses this helper.
const createSeoSchema = () => z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional()
}).editor({ hidden: true })

// Standard hidden navigation field shared by the page collections.
const createHiddenNavigation = () => z.boolean().default(false).editor({ hidden: true })

// Sitemap entries use fixed defaults / code-driven URLs, so this field is
// hidden from the Studio editor everywhere it is used. It is also optional:
// Studio drops hidden fields when it rewrites a file, and an optional field
// keeps that from breaking content validation (the onUrl override still runs).
const createSitemapSchema = (options?: DefineSitemapSchemaOptions) => defineSitemapSchema({ z, ...options }).optional().editor({ hidden: true })

const createMenuLabelSchema = () => z.enum([
  'gluten-free',
  'vegan',
  'vegetarian',
  'spicy',
  'seasonal',
  'organic'
])

// The menu category slugs. Used for both a category's `slug` and a menu
// item's `category`, so Studio renders a dropdown and the two can't drift.
// Adding a new category means adding its slug here (a quick dev change).
const createMenuCategorySchema = () => z.enum([
  'drinksCoffee',
  'drinksHot',
  'food'
])

const createWeekdaySchema = () => z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
])

// An enum rather than a free string, so Studio offers a dropdown of 15-minute
// times instead of a text field that accepts anything.
const createTimeSchema = () => z.enum(OPENING_TIME_OPTIONS as unknown as [string, ...string[]])

const createNoticeTextSchema = () => z.object({
  title: z.string().nonempty(),
  message: z.string().editor({ input: 'textarea' }).optional()
})

// `datetime()` is what gives the field a `date-time` JSON-schema format, which
// makes Studio render its date and time picker. Studio writes the value back
// as `YYYY-MM-DD HH:mm:ss` (Berlin time, no zone), or an empty string when the
// picker is cleared; `shared/utils/notice.ts` reads both.
const createNoticeDateTimeSchema = () => z.string().datetime({ local: true }).optional()

export default defineContentConfig({
  collections: {
    // Single, language-independent file. The homepage renders it for both
    // locales and app.vue publishes it as structured data, so the two
    // languages cannot show different hours. The reservation form and the API
    // read it too (`shared/utils/reservations.ts`): the weekday hours say when
    // a table can be booked, and the exceptions list opens or closes single
    // dates. See docs/reservation-availability.md.
    openingHours: defineCollection({
      type: 'data',
      source: 'opening-hours.yml',
      schema: z.object({
        hours: z.array(z.object({
          day: createWeekdaySchema(),
          closed: z.boolean().default(false),
          opens: createTimeSchema().optional(),
          closes: createTimeSchema().optional()
        })).length(7),
        // Deliberately not `.int()`: that emits JSON-schema `type: "integer"`,
        // which @nuxt/content does not map, so the column silently becomes
        // TEXT and the built site holds "60" where the file holds 60 - a
        // permanent "Conflict detected" on this file in Studio. A plain number
        // constrained to whole values keeps the column numeric.
        //
        // The bounds are Studio's guard rails only: @nuxt/content types the
        // column from this schema but never validates content against it, so
        // `shared/utils/opening-hours.ts` clamps the value it reads back.
        lastReservationBeforeClosing: z
          .number()
          .min(0)
          .max(MAX_LAST_RESERVATION_BEFORE_CLOSING)
          .multipleOf(1)
          .default(DEFAULT_LAST_RESERVATION_BEFORE_CLOSING),
        // Dates that do not follow their weekday for bookings. An array of
        // objects on purpose: a top-level date field becomes a DATE column and
        // is run through `new Date()` on insert, which throws on the empty
        // string Studio writes for a cleared picker. Inside an array the
        // values are stored as JSON, untouched. The ISO `date` format is what
        // makes Studio render a date picker rather than a text box, and the
        // times reuse the weekday dropdown so an off-grid time cannot be typed.
        reservationExceptions: z.array(z.object({
          date: z.string().date(),
          closed: z.boolean().default(false),
          // A bookable range, not opening times: the last slot offered is
          // `bookableUntil` itself, with no margin taken off.
          bookableFrom: createTimeSchema().optional(),
          bookableUntil: createTimeSchema().optional(),
          note: z.string().optional()
        })).default([])
      })
    }),
    // Single file for both languages, so the schedule and the wording are
    // edited in one place. The end date is the on/off switch: the card shows
    // while the visitor's clock is inside `schedule`. See docs/site-notice.md.
    notice: defineCollection({
      type: 'data',
      source: 'notice.yml',
      schema: z.object({
        tone: z.enum(NOTICE_TONES).default('warning'),
        // Nested on purpose. A top-level `date-time` field becomes a DATETIME
        // column and is run through `new Date()` on insert, which throws on
        // the empty string Studio writes for a cleared picker. Inside an
        // object the values are stored as JSON, untouched.
        schedule: z.object({
          from: createNoticeDateTimeSchema(),
          until: createNoticeDateTimeSchema()
        }).optional(),
        en: createNoticeTextSchema(),
        de: createNoticeTextSchema()
      })
    }),
    index: defineCollection({
      type: 'page',
      source: [
        // A glob, not `en/index.md`: a source with no `*` has an empty fixed
        // part, so the `en/` segment would stay in the key (and in `stem` and
        // `path`). `**/` matches zero directories, so this pins exactly one
        // file while still ending the fixed part at `en/`. Not `en/*.md`: that
        // also makes Studio resolve the *German* row to the English source.
        { include: 'en/**/index.md', prefix: '' },
        { include: 'de/**/index.md', prefix: '/de' }
      ],
      schema: z.object({
        // RESEARCH: no `onUrl` at all. `@nuxtjs/sitemap` bakes
        // `sitemap.loc = content.path` in `content:file:afterParse`, and under
        // the locale-prefixed tree that path is already the public URL.
        sitemap: createSitemapSchema(),
        navigation: createHiddenNavigation()
      })
    }),
    menuPage: defineCollection({
      type: 'page',
      source: [
        { include: 'en/**/menu.yml', prefix: '' },
        { include: 'de/**/menu.yml', prefix: '/de' }
      ],
      schema: z.object({
        sitemap: createSitemapSchema(),
        navigation: createHiddenNavigation(),
        hero: createBaseSchema().extend({
          headline: z.string(),
          image: createImageSchema()
        }),
        labels: z.array(z.object({
          id: createMenuLabelSchema(),
          label: z.string(),
          icon: z.string().editor({ input: 'icon' }).optional()
        })).optional()
      })
    }),
    menuCategories: defineCollection({
      type: 'data',
      source: [
        { include: 'en/menu-categories/*.yml', prefix: '/menu-categories' },
        { include: 'de/menu-categories/*.yml', prefix: '/de/menu-categories' }
      ],
      schema: z.object({
        slug: createMenuCategorySchema(),
        title: z.string().nonempty(),
        description: z.string().optional(),
        options: z.string().optional(),
        icon: z.string().editor({ input: 'icon' }).optional(),
        order: z.number()
      })
    }),
    menuItems: defineCollection({
      type: 'data',
      // Variant C: no `cwd` at all. The locale folder is inside the glob's
      // fixed part, and `prefix` is written out to cancel it.
      source: [
        { include: 'en/menu/*.yml', prefix: '/menu' },
        { include: 'de/menu/*.yml', prefix: '/de/menu' }
      ],
      schema: z.object({
        title: z.string().nonempty(),
        category: createMenuCategorySchema(),
        description: z.string().nonempty(),
        ingredients: z.string().nonempty(),
        price: z.string().nonempty(),
        image: createImageSchema(),
        labels: z.array(createMenuLabelSchema()).optional(),
        order: z.number()
      })
    }),
    eventsPage: defineCollection({
      type: 'page',
      source: [
        { include: 'en/**/events.yml', prefix: '' },
        { include: 'de/**/events.yml', prefix: '/de' }
      ],
      schema: z.object({
        sitemap: createSitemapSchema(),
        navigation: createHiddenNavigation(),
        hero: createBaseSchema().extend({
          headline: z.string(),
          image: createImageSchema(),
          links: z.array(createButtonSchema())
        }),
        sections: z.object({
          upcomingTitle: z.string(),
          pastTitle: z.string(),
          pastDescription: z.string(),
          pastOnlyDescription: z.string(),
          emptyUpcomingTitle: z.string(),
          emptyUpcomingDescription: z.string()
        }),
        labels: z.object({
          date: z.string(),
          time: z.string(),
          location: z.string(),
          price: z.string(),
          booking: z.string()
        })
      })
    }),
    events: defineCollection({
      type: 'page',
      source: [
        { include: 'en/events/*.md', prefix: '/events' },
        { include: 'de/events/*.md', prefix: '/de/events' }
      ],
      schema: z.object({
        // Hidden in Studio: the URL is derived from the file name, SEO is
        // derived from the fields below, and the sitemap uses fixed defaults.
        sitemap: createSitemapSchema(),
        navigation: createHiddenNavigation(),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.date(),
        time: z.string().nonempty(),
        image: createImageSchema(),
        paid: z.boolean().default(false),
        price: z.number().optional(),
        reservation: z.enum(['required', 'recommended', 'walkin']).default('recommended'),
        seo: createSeoSchema().optional().editor({ hidden: true })
      })
    })
  }
})
