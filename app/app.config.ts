export default defineAppConfig({
  global: {
    name: 'Café Prana',
    description: 'A gluten-free and vegan haven in the heart of Berlin',
    address: 'Pasteurstraße 2, 10407 Berlin',
    phone: '+49 152 36848480',
    instagram: 'https://instagram.com/pranacafe',
    maps: 'https://maps.app.goo.gl/MToiG3VyXv7PB8kw9',
    meetingLink: '/reservations',
    available: true,
    picture: {
      dark: '/images/hero.webp',
      light: '/images/hero.webp',
      alt: 'Café Prana'
    }
  },
  ui: {
    // Everything the owner can write in Markdown, dressed in the cafe's own
    // identity. Nuxt UI's prose defaults are tuned for a documentation body -
    // sans-bold headings, a grey italic quote, a bordered data table - and this
    // is a cafe telling guests about an evening. Each entry is *appended* to the
    // default and resolved by tailwind-merge, so a value that does not conflict
    // has to be undone by name (`not-italic`, `border-0`) rather than replaced.
    prose: {
      // Fraunces for headings, matching the page title above the body. These are
      // the values `.cafe-prose` shipped before this theme existed, carried
      // across unchanged so no already-published event page moves: 1.6rem /
      // 1.3rem at weight 500, -0.01em, 2.25rem above and 1rem below.
      h2: {
        slots: {
          base: 'font-serif font-medium tracking-[-0.01em] text-[1.6rem] leading-[1.75] mt-9 mb-4'
        }
      },
      h3: {
        slots: {
          base: 'font-serif font-medium tracking-[-0.01em] text-[1.3rem] leading-[1.75] mt-9 mb-4'
        }
      },
      // No incumbent value - `h4` was never styled, because nothing used one.
      // One step below `h3`, on the same rhythm.
      h4: {
        slots: {
          base: 'font-serif font-medium tracking-[-0.01em] text-[1.1rem] leading-[1.75] mt-8 mb-3'
        }
      },
      // Unitless, so the line height still tracks the larger body size the
      // event page sets on `.cafe-prose`.
      p: { base: 'leading-[1.75]' },
      strong: { base: 'font-semibold text-highlighted' },
      // A permanent underline, because colour alone is not a link. Thin and set
      // away from the baseline so it reads as typography, not as a hyperlink
      // from 1996; it firms up on hover rather than appearing.
      a: {
        base: 'border-b-0 underline decoration-1 decoration-primary/40 underline-offset-[0.19em] hover:decoration-primary'
      },
      ul: { base: 'ps-5 marker:text-primary/60' },
      ol: { base: 'ps-5 marker:text-primary/60' },
      li: { base: 'my-1 leading-[1.75]' },
      blockquote: { base: 'not-italic border-s-0 ps-0 cafe-quote' },
      hr: { base: 'cafe-rule my-14' },
      // Photos in the body get the same frame as the event's own header image,
      // so an inline shot reads as part of the page rather than as an upload.
      img: {
        slots: {
          base: 'rounded-2xl ring-1 ring-default shadow-lg my-8',
          zoomedImage: 'rounded-2xl'
        }
      },
      // A small menu or a workshop timetable. Mono, tabular figures in the
      // cells so prices and times line up down the column; the header borrows
      // the eyebrow's voice without borrowing its tick.
      table: {
        slots: {
          root: 'my-8 rounded-xl ring-1 ring-default',
          base: 'text-left'
        }
      },
      thead: { base: 'bg-elevated' },
      // `rounded-none!` because the cells carry their own corner radii by
      // default, at a smaller radius than the frame - which leaves a sliver of
      // page showing at each corner. The frame clips; the cells should not try.
      th: {
        base: 'rounded-none! border-0 border-b border-default font-mono text-[0.7rem] font-normal uppercase tracking-[0.16em] text-primary py-3.5 px-4'
      },
      // Space Mono in the cells, not as a costume for "technical" but because a
      // course list is measurement: it is the face the site already uses for the
      // event detail bar and the opening hours, and it is what makes prices and
      // times line up down the column.
      td: {
        base: 'rounded-none! border-0 border-b border-muted [tr:last-child>&]:border-b-0 py-3.5 px-4 font-mono text-[0.85rem] tabular-nums'
      }
    },
    colors: {
      primary: 'chlorophyll',
      neutral: 'paper'
    },
    pageHero: {
      slots: {
        container: 'py-16 sm:py-20 lg:py-28',
        headline: 'font-mono text-xs uppercase tracking-[0.24em] text-primary',
        title: 'font-serif font-medium tracking-tight',
        description: 'text-muted'
      }
    },
    pageSection: {
      slots: {
        headline: 'font-mono text-xs uppercase tracking-[0.24em] text-primary',
        title: 'font-serif font-medium tracking-tight',
        description: 'text-muted'
      }
    },
    pageCard: {
      slots: {
        title: 'font-serif font-medium'
      }
    },
    pageCTA: {
      slots: {
        title: 'font-serif font-medium tracking-tight'
      }
    }
  },
  footer: {
    credits: `Café Prana · Pasteurstraße 2 · © ${new Date().getFullYear()}`,
    links: [{
      'icon': 'i-simple-icons-instagram',
      'to': 'https://instagram.com/pranacafe',
      'target': '_blank',
      'aria-label': 'Café Prana on Instagram'
    }, {
      'icon': 'i-lucide-map-pin',
      'to': 'https://maps.app.goo.gl/MToiG3VyXv7PB8kw9',
      'target': '_blank',
      'aria-label': 'Café Prana on Google Maps'
    }]
  }
})
