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
