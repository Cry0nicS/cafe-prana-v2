// https://nuxt.com/docs/api/configuration/nuxt-config
import { CAFE_CONTACT_EMAIL, CAFE_SITE_URL } from './shared/utils/constants'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    'nuxt-studio'
  ],

  // `ipxStatic` only ever produces files during prerender, and it deliberately
  // registers no `/_ipx/**` route, so in dev every image 404s and the request
  // falls through to the router. Dev needs the real IPX handler instead; it is
  // the same URL shape, so nothing else has to change between the two.
  $development: {
    image: {
      provider: 'ipx'
    }
  },

  components: [
    { path: '~/components/content', global: true, pathPrefix: false },
    '~/components'
  ],
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  site: {
    url: CAFE_SITE_URL,
    name: 'Cafe Prana'
  },

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL || '',
    // Service-role key only. The `reservations` table grants nothing to the
    // anon role, so an anon key here would make every request fail, and any
    // fallback to one would silently reintroduce a public key on the server.
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || '',
    mailgunBaseUrl: process.env.NUXT_MAILGUN_BASE_URL || process.env.MAILGUN_BASE_URL || '',
    mailgunKey: process.env.NUXT_MAILGUN_KEY || process.env.MAILGUN_KEY || '',
    mailgunDomain: process.env.NUXT_MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN || 'mail.cafeprana.de',
    reservationEmailFrom: process.env.NUXT_RESERVATION_EMAIL_FROM || process.env.RESERVATION_EMAIL_FROM || 'Cafe Prana <reservation@mail.cafeprana.de>',
    reservationEmailTo: process.env.NUXT_RESERVATION_EMAIL_TO || process.env.RESERVATION_EMAIL_TO || 'cafeprana.berlin@gmail.com',
    reservationEmailBcc: process.env.NUXT_RESERVATION_EMAIL_BCC || process.env.RESERVATION_EMAIL_BCC || CAFE_CONTACT_EMAIL,
    contactEmailFrom: process.env.NUXT_CONTACT_EMAIL_FROM || process.env.CONTACT_EMAIL_FROM || 'Cafe Prana <hello@mail.cafeprana.de>',
    contactEmailTo: process.env.NUXT_CONTACT_EMAIL_TO || process.env.CONTACT_EMAIL_TO || CAFE_CONTACT_EMAIL
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

  fonts: {
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'Hanken Grotesk', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Space Mono', provider: 'google', weights: [400, 700] }
    ]
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [{
      code: 'en',
      name: 'English',
      language: 'en-US'
    }, {
      code: 'de',
      name: 'Deutsch',
      language: 'de-DE'
    }],
    vueI18n: './i18n.config.ts'
  },

  icon: {
    // Nuxt UI pre-bundles its own icons, but this project's icons live in
    // content (`.md`/`.yml`) and composables, so without scanning they are
    // fetched at runtime and warn on dev cold start. Scanning bakes them into
    // the client bundle instead. The default glob omits `ts`, which is where
    // the navigation icons are defined.
    clientBundle: {
      scan: {
        globInclude: ['**/*.{vue,jsx,tsx,ts,md,mdc,mdx,yml,yaml}']
      }
    }
  },

  image: {
    // Without this, `provider: 'auto'` detects the Vercel deployment and routes
    // every image through `/_vercel/image` at request time, so the first visitor
    // to hit each variant pays for the transformation in their LCP. Every page
    // here is prerendered, so the variants are all known at build time: pinning
    // `ipxStatic` bakes them into `.output/public/_ipx/` as plain files served
    // straight off the CDN. Nothing is transformed at runtime, and `sharp` stays
    // out of the server bundle.
    // Caveat: an image that is not rendered during prerender never gets baked
    // and will 404, so images behind a `v-if` must not go through IPX.
    provider: 'ipxStatic'
  },
  sitemap: {
    autoI18n: true,
    autoLastmod: true,
    discoverImages: false,
    exclude: [
      '/cookies',
      '/de/cookies'
    ]
  },
  studio: {
    route: '/pranas',
    // Studio has no external blob storage configured here, so uploads are
    // written into `public/` and committed to this repository. The defaults
    // (10MB, `image/*` plus `video/*` and `audio/*`) are too permissive for
    // something that lands in git history permanently: video and audio have no
    // place in this project, and the size cap bounds how large a single upload
    // can be before `scripts/optimize-images.mjs` gets a chance to shrink it.
    media: {
      maxFileSize: 5 * 1024 * 1024,
      allowedTypes: ['image/*']
    },
    repository: {
      provider: 'github',
      owner: 'Cry0nicS',
      repo: 'cafe-prana-v2',
      branch: 'main'
    }
  }
})
