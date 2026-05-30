<script setup lang="ts">
const colorMode = useColorMode()
const { locale } = useI18n()

const themeColor = computed(() => colorMode.value === 'dark' ? '#1f1711' : '#fffaf5')
const htmlLang = computed(() => locale.value === 'de' ? 'de-DE' : 'en-US')

useHead(() => ({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: themeColor.value }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: htmlLang.value
  }
}))

useSeoMeta({
  title: 'Café Prana',
  ogType: 'website',
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
