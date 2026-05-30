// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    'nuxt-studio'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_KEY || '',
    mailgunBaseUrl: process.env.NUXT_MAILGUN_BASE_URL || process.env.MAILGUN_BASE_URL || '',
    mailgunKey: process.env.NUXT_MAILGUN_KEY || process.env.MAILGUN_KEY || '',
    mailgunDomain: process.env.NUXT_MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN || 'mail.cafeprana.de',
    reservationEmailFrom: process.env.NUXT_RESERVATION_EMAIL_FROM || process.env.RESERVATION_EMAIL_FROM || 'Cafe Prana <reservation@mail.cafeprana.de>',
    reservationEmailTo: process.env.NUXT_RESERVATION_EMAIL_TO || process.env.RESERVATION_EMAIL_TO || 'cafeprana.berlin@gmail.com',
    reservationEmailBcc: process.env.NUXT_RESERVATION_EMAIL_BCC || process.env.RESERVATION_EMAIL_BCC || 'info@cafeprana.de'
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  studio: {
    repository: {
      provider: 'github',
      owner: 'Cry0nicS',
      repo: 'cafe-prana-v2',
      branch: 'main'
    }
  }
})
