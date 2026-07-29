<script setup lang="ts">
const { locale, t } = useI18n()

const { data: page } = await useAsyncData(
  `index-${locale.value}`,
  () => queryCollection('index').where('locale', '=', locale.value).first(),
  { watch: [locale] }
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useCafeSeo({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  image: '/images/hero.png'
})
</script>

<template>
  <UPage v-if="page">
    <ContentRenderer :value="page" />
  </UPage>
</template>
