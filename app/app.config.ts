export default defineAppConfig({
  global: {
    name: 'Café Prana',
    description: 'A gluten-free and vegan haven in the heart of Berlin',
    address: 'Pasteurstraße 2, 10407 Berlin',
    email: 'info@cafeprana.de',
    phone: '+49 152 36848480',
    instagram: 'https://instagram.com/pranacafe',
    maps: 'https://maps.app.goo.gl/MToiG3VyXv7PB8kw9',
    meetingLink: '/reservations',
    available: true,
    picture: {
      dark: '/images/hero.png',
      light: '/images/hero.png',
      alt: 'Café Prana'
    }
  },
  ui: {
    colors: {
      primary: 'sage',
      neutral: 'stone'
    },
    pageHero: {
      slots: {
        container: 'py-16 sm:py-20 lg:py-28',
        title: 'tracking-normal',
        description: 'text-muted'
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
    }, {
      'icon': 'i-lucide-mail',
      'to': 'mailto:info@cafeprana.de',
      'aria-label': 'Email Café Prana'
    }]
  }
})
