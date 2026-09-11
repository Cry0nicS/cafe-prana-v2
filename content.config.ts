import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { NOTICE_TONES } from './shared/utils/notice'
import {
  DEFAULT_LAST_RESERVATION_BEFORE_CLOSING,
  MAX_LAST_RESERVATION_BEFORE_CLOSING,
  OPENING_TIME_OPTIONS
} from './shared/utils/opening-hours'

// A content file's language is the folder it lives in: `content/en/...` and
// `content/de/...`. Files that exist once for both languages
// (`opening-hours.yml`, `notice.yml`) stay at the root.
// See docs/adr/0001-bilingual-content-layout.md.
// Matches `i18n.locales` in nuxt.config.ts. Adding a locale here means adding
// its folder and its pair of collection entries below.
type Locale = 'en' | 'de'

// `en` is i18n's `defaultLocale` under `prefix_except_default`, so English
// URLs carry no prefix and German ones carry `/de`.
const localeUrlPrefix = (locale: Locale) => locale === 'en' ? '' : `/${locale}`

// The locale folder goes inside `include` so that it lands in the glob's
// *fixed* part and is stripped from the document key; `prefix` then writes the
// public URL back. Two traps, each of which looks like it works:
//
//   - `cwd` produces identical `path` and `stem`, but Studio rebuilds a file
//     path from `include` and `prefix` alone and ignores it - 0 of 52 rows
//     resolvable. `cwd: '~~/content/en'` ingests nothing and still exits 0.
//   - a singleton needs a glob. `en/index.md` has no `*`, so nothing is
//     stripped: the path comes out `/en` and the German prefix stacks into
//     `/de/de`. `**/` matches zero directories, so `en/**/index.md` pins one
//     file while still ending the fixed part at `en/`. Not `en/*.md` either -
//     that builds, but breaks Studio via a ufo quirk where an empty prefix
//     becomes `/`.
const localeSource = (locale: Locale, include: string, urlPath = '') => ({
  include: `${locale}/${include}`,
  prefix: `${localeUrlPrefix(locale)}${urlPath}`
})

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

// Sitemap entries use fixed defaults, so this field is hidden from the Studio
// editor everywhere it is used, and optional because Studio drops hidden fields
// when it rewrites a file.
//
// There is deliberately no `onUrl` override on any collection.
// `@nuxtjs/sitemap` bakes `sitemap.loc = content.path` during
// `content:file:afterParse`, and under the locale-folder layout that path is
// already the public URL - the overrides existed only to repair paths the old
// `name.de.md` convention got wrong.
const createSitemapSchema = () => defineSitemapSchema({ z }).optional().editor({ hidden: true })

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

// --- one collection per locale ----------------------------------------------
//
// Each localized collection below is declared TWICE, once per locale, each
// with exactly ONE source. This is forced, not stylistic: Studio derives a
// document's id from `source[0]` unconditionally
// (`nuxt-studio/.../utils/collection.js`), so a single collection carrying two
// differently-prefixed sources makes every German file resolve to its English
// counterpart - measured at 28 of 58 files, all German. Do not merge these
// back together; it builds, it serves correct URLs, and it locks the owner out
// of the German half of the site.
//
// The collection is therefore the locale, which is why no query filters on one
// and why no content file carries a `locale` field.

const createIndexCollection = (locale: Locale) => defineCollection({
  type: 'page',
  source: localeSource(locale, '**/index.md'),
  schema: z.object({
    sitemap: createSitemapSchema(),
    navigation: createHiddenNavigation()
  })
})

const createMenuPageCollection = (locale: Locale) => defineCollection({
  type: 'page',
  source: localeSource(locale, '**/menu.yml'),
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
})

const createMenuCategoriesCollection = (locale: Locale) => defineCollection({
  type: 'data',
  source: localeSource(locale, 'menu-categories/*.yml', '/menu-categories'),
  schema: z.object({
    slug: createMenuCategorySchema(),
    title: z.string().nonempty(),
    description: z.string().optional(),
    options: z.string().optional(),
    icon: z.string().editor({ input: 'icon' }).optional(),
    order: z.number()
  })
})

const createMenuItemsCollection = (locale: Locale) => defineCollection({
  type: 'data',
  source: localeSource(locale, 'menu/*.yml', '/menu'),
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
})

const createEventsPageCollection = (locale: Locale) => defineCollection({
  type: 'page',
  source: localeSource(locale, '**/events.yml'),
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
})

const createEventsCollection = (locale: Locale) => defineCollection({
  type: 'page',
  source: localeSource(locale, 'events/*.md', '/events'),
  schema: z.object({
    // Hidden in Studio: the URL comes from the file's name and folder, SEO is
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

export default defineContentConfig({
  // The keys are spelled out rather than generated: @nuxt/content types
  // `queryCollection()` from these literals, and building them dynamically
  // would erase the collection names from the types.
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
          // The default is Studio's guard rail, not the file's and not the
          // site's: @nuxt/content applies defaults to top-level columns only,
          // so nothing writes this into a row inside an array, and the readers
          // in `shared/utils/opening-hours.ts` take a missing flag for `false`
          // on their own. Every row in `content/opening-hours.yml` therefore
          // writes it out by hand, `closed: false` included, and a test holds
          // the seven weekdays to that.
          //
          // Not tidiness. Studio decides a file has unsaved changes by walking
          // the keys of the FILE and looking each one up in the edit
          // (`doObjectsMatch`, `nuxt-studio/.../runtime/utils/object.js`), so a
          // key the edit ADDS is never compared. On a day written without the
          // flag, ticking `closed` left the document `Pristine` and the owner
          // with nothing to commit unless they changed a time alongside it.
          // Present in the file, the same tick is a value change, which Studio
          // does see. The comparison is Studio's, so this holds for any
          // optional field the owner is expected to fill in later.
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
          // Written out on every row, `false` included, for the reason spelled
          // out on the weekday flag above.
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

    indexEn: createIndexCollection('en'),
    indexDe: createIndexCollection('de'),

    menuPageEn: createMenuPageCollection('en'),
    menuPageDe: createMenuPageCollection('de'),

    menuCategoriesEn: createMenuCategoriesCollection('en'),
    menuCategoriesDe: createMenuCategoriesCollection('de'),

    menuItemsEn: createMenuItemsCollection('en'),
    menuItemsDe: createMenuItemsCollection('de'),

    eventsPageEn: createEventsPageCollection('en'),
    eventsPageDe: createEventsPageCollection('de'),

    eventsEn: createEventsCollection('en'),
    eventsDe: createEventsCollection('de')
  }
})
