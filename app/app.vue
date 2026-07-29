<script setup lang="ts">
import {
  CAFE_ADDRESS,
  CAFE_CONTACT_EMAIL,
  CAFE_GEO,
  CAFE_INSTAGRAM_URL,
  CAFE_LEGAL_NAME,
  CAFE_MAPS_URL,
  CAFE_NAME,
  CAFE_PHONE,
  CAFE_SITE_URL
} from '#shared/utils/constants'

const colorMode = useColorMode()
const { locale } = useI18n()

const themeColor = computed(() => colorMode.value === 'dark' ? '#0d1411' : '#f2f3ec')
const htmlLang = computed(() => locale.value === 'de' ? 'de-DE' : 'en-US')
const localBusinessJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  '@id': `${CAFE_SITE_URL}/#local-business`,
  'name': CAFE_NAME,
  'legalName': CAFE_LEGAL_NAME,
  'url': CAFE_SITE_URL,
  'image': `${CAFE_SITE_URL}/images/hero.png`,
  'logo': `${CAFE_SITE_URL}/favicon.ico`,
  'telephone': CAFE_PHONE,
  'email': CAFE_CONTACT_EMAIL,
  'servesCuisine': ['Vegan', 'Gluten-free', 'Organic cafe food', 'Specialty coffee'],
  'priceRange': '€€',
  'sameAs': [CAFE_INSTAGRAM_URL, CAFE_MAPS_URL],
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': CAFE_ADDRESS.street,
    'postalCode': CAFE_ADDRESS.postalCode,
    'addressLocality': CAFE_ADDRESS.city,
    'addressCountry': CAFE_ADDRESS.country
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': CAFE_GEO.latitude,
    'longitude': CAFE_GEO.longitude
  },
  'openingHoursSpecification': [{
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    'opens': '07:30',
    'closes': '15:00'
  }, {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': ['Saturday', 'Sunday'],
    'opens': '09:00',
    'closes': '17:00'
  }]
}))

useHead(() => ({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: themeColor.value }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  script: [
    {
      key: 'local-business-json-ld',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(localBusinessJsonLd.value)
    }
  ],
  htmlAttrs: {
    lang: htmlLang.value
  }
}))

useSeoMeta({
  title: 'Cafe Prana Berlin | Gluten-Free Vegan Cafe & Brunch',
  ogType: 'website',
  ogSiteName: 'Cafe Prana',
  ogImage: '/images/hero.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>
    <CookieAnalytics />
    <CookieConsentBanner />
  </UApp>
</template>
