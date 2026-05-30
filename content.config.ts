import { defineCollection, defineContentConfig, z } from '@nuxt/content'

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

const createFeatureSchema = () => z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().editor({ input: 'icon' }).optional()
})

const createLocaleSchema = () => z.enum(['en', 'de'])

const createMenuLabelSchema = () => z.enum([
  'gluten-free',
  'vegan',
  'vegetarian',
  'spicy',
  'seasonal',
  'organic'
])

const createEventCategorySchema = () => z.enum([
  'breakfast',
  'brunch',
  'dinner',
  'workshop',
  'community',
  'seasonal'
])

const createEventTagSchema = () => z.enum([
  'vegan',
  'gluten-free',
  'organic',
  'seasonal',
  'community',
  'limited-seats',
  'reservation-required',
  'special-guests',
  'workshop'
])

export default defineContentConfig({
  collections: {
    index: defineCollection({
      type: 'page',
      source: [
        { include: 'index.yml', prefix: '' },
        { include: 'index.de.yml', prefix: '' }
      ],
      schema: z.object({
        locale: createLocaleSchema(),
        seo: createSeoSchema(),
        hero: createBaseSchema().extend({
          headline: z.string(),
          image: createImageSchema(),
          links: z.array(createButtonSchema())
        }),
        philosophy: createBaseSchema().extend({
          icon: z.string().editor({ input: 'icon' }),
          features: z.array(createFeatureSchema())
        }),
        menu: createBaseSchema().extend({
          icon: z.string().editor({ input: 'icon' }),
          items: z.array(createBaseSchema().extend({
            image: createImageSchema()
          })),
          links: z.array(createButtonSchema())
        }),
        events: createBaseSchema().extend({
          headline: z.string(),
          icon: z.string().editor({ input: 'icon' }),
          image: createImageSchema(),
          features: z.array(createFeatureSchema()),
          links: z.array(createButtonSchema())
        }),
        gallery: createBaseSchema().extend({
          icon: z.string().editor({ input: 'icon' }),
          images: z.array(createImageSchema())
        }),
        story: createBaseSchema().extend({
          icon: z.string().editor({ input: 'icon' }),
          image: createImageSchema()
        }),
        testimonials: createBaseSchema().extend({
          icon: z.string().editor({ input: 'icon' }),
          cta: createButtonSchema(),
          items: z.array(z.object({
            rating: z.number(),
            quote: z.string(),
            author: z.string(),
            relativeTime: z.string().optional()
          }))
        }),
        faq: createBaseSchema().extend({
          icon: z.string().editor({ input: 'icon' }),
          items: z.array(z.object({
            label: z.string().nonempty(),
            content: z.string().nonempty()
          }))
        }),
        directions: createBaseSchema().extend({
          id: z.string(),
          mapEmbedUrl: z.string(),
          links: z.array(createButtonSchema()),
          hours: z.object({
            heading: z.string(),
            items: z.array(z.object({
              day: z.string(),
              time: z.string(),
              closed: z.boolean().optional()
            }))
          })
        })
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
        seo: createSeoSchema(),
        hero: createBaseSchema().extend({
          headline: z.string(),
          image: createImageSchema(),
          links: z.array(createButtonSchema())
        }),
        categories: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          options: z.string().optional(),
          icon: z.string().editor({ input: 'icon' }).optional()
        })),
        labels: z.array(z.object({
          id: createMenuLabelSchema(),
          label: z.string(),
          icon: z.string().editor({ input: 'icon' }).optional()
        })).optional()
      })
    }),
    menuItems: defineCollection({
      type: 'data',
      source: 'menu/*.yml',
      schema: z.object({
        locale: createLocaleSchema(),
        title: z.string().nonempty(),
        category: z.string().nonempty(),
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
        slug: z.string().nonempty(),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        badge: z.string().optional(),
        category: createEventCategorySchema(),
        startDate: z.date(),
        endDate: z.date().optional(),
        time: z.string().optional(),
        timezone: z.string().optional(),
        image: createImageSchema(),
        heroImage: createImageSchema(),
        location: z.object({
          name: z.string().nonempty(),
          address: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          mapsUrl: z.string().optional()
        }),
        price: z.object({
          label: z.string().nonempty(),
          amount: z.number().optional(),
          currency: z.string().optional(),
          isFree: z.boolean().optional()
        }),
        booking: z.object({
          enabled: z.boolean(),
          required: z.boolean().optional(),
          label: z.string(),
          url: z.string().optional(),
          note: z.string().optional()
        }),
        details: z.object({
          concept: z.string().nonempty(),
          menuNote: z.string().optional(),
          expectations: z.array(z.string().nonempty()),
          forWho: z.string().optional(),
          reservation: z.string().optional()
        }),
        tags: z.array(createEventTagSchema()),
        featured: z.boolean().optional(),
        seo: createSeoSchema().optional()
      })
    })
  }
})
