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

const createAuthorSchema = () => z.object({
  name: z.string(),
  description: z.string().optional(),
  username: z.string().optional(),
  twitter: z.string().optional(),
  to: z.string().optional(),
  avatar: createImageSchema().optional()
})

export default defineContentConfig({
  collections: {
    index: defineCollection({
      type: 'page',
      source: 'index.yml',
      schema: z.object({
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
    projects: defineCollection({
      type: 'data',
      source: 'projects/*.yml',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        image: z.string().nonempty().editor({ input: 'media' }),
        url: z.string().nonempty(),
        tags: z.array(z.string()),
        date: z.date()
      })
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        minRead: z.number(),
        date: z.date(),
        image: z.string().nonempty().editor({ input: 'media' }),
        author: createAuthorSchema()
      })
    }),
    pages: defineCollection({
      type: 'page',
      source: [
        { include: 'projects.yml' },
        { include: 'blog.yml' }
      ],
      schema: z.object({
        links: z.array(createButtonSchema())
      })
    }),
    speaking: defineCollection({
      type: 'page',
      source: 'speaking.yml',
      schema: z.object({
        links: z.array(createButtonSchema()),
        events: z.array(z.object({
          category: z.enum(['Live talk', 'Podcast', 'Conference']),
          title: z.string(),
          date: z.date(),
          location: z.string(),
          url: z.string().optional()
        }))
      })
    }),
    about: defineCollection({
      type: 'page',
      source: 'about.yml',
      schema: z.object({
        content: z.object({}),
        images: z.array(createImageSchema())
      })
    })
  }
})
