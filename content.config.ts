import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import type { DefineSitemapSchemaOptions } from '@nuxtjs/sitemap/content'

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
  src: z.string().editor({ input: 'media' }),
  alt: z.string()
})

const createSeoSchema = () => z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().editor({ input: 'media' }).optional()
})

const createSitemapSchema = (options?: DefineSitemapSchemaOptions) => defineSitemapSchema({ z, ...options })

const createLocaleSchema = () => z.enum(['en', 'de'])

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

export default defineContentConfig({
  collections: {
    index: defineCollection({
      type: 'page',
      source: [
        { include: 'index.md', prefix: '' },
        { include: 'index.de.md', prefix: '' }
      ],
      schema: z.object({
        locale: createLocaleSchema(),
        sitemap: createSitemapSchema({
          name: 'index',
          onUrl: (url, entry) => {
            url.loc = entry.locale === 'de' ? '/de' : '/'
          }
        }),
        seo: createSeoSchema()
      })
    }),
    menuPage: defineCollection({
      type: 'page',
      source: [
        { include: 'menu.yml', prefix: '' },
        { include: 'menu.de.yml', prefix: '' }
      ],
      schema: z.object({
        locale: createLocaleSchema(),
        sitemap: createSitemapSchema({
          name: 'menuPage',
          onUrl: (url, entry) => {
            url.loc = entry.locale === 'de' ? '/de/menu' : '/menu'
          }
        }),
        seo: createSeoSchema(),
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
      source: 'menu-categories/*.yml',
      schema: z.object({
        locale: createLocaleSchema(),
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
      source: 'menu/*.yml',
      schema: z.object({
        locale: createLocaleSchema(),
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
        { include: 'events.yml', prefix: '' },
        { include: 'events.de.yml', prefix: '' }
      ],
      schema: z.object({
        locale: createLocaleSchema(),
        sitemap: createSitemapSchema({
          name: 'eventsPage',
          onUrl: (url, entry) => {
            url.loc = entry.locale === 'de' ? '/de/events' : '/events'
          }
        }),
        seo: createSeoSchema(),
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
      source: 'events/*.md',
      schema: z.object({
        locale: createLocaleSchema(),
        // Hidden in Studio: the URL is derived from the file name, SEO is
        // derived from the fields below, and the sitemap uses fixed defaults.
        sitemap: createSitemapSchema({
          name: 'events',
          onUrl: (url, entry) => {
            // Inlined (this runs in Nitro, so no external helper references):
            // derive the slug from the file stem, e.g. `events/spring-brunch.de` -> `spring-brunch`.
            const slug = String(entry.stem ?? '').replace(/^events\//, '').replace(/\.de$/, '')
            url.loc = entry.locale === 'de' ? `/de/events/${slug}` : `/events/${slug}`
          }
        }).editor({ hidden: true }),
        navigation: z.boolean().default(false).editor({ hidden: true }),
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
