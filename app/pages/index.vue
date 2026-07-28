<script setup lang="ts">
const { locale } = useI18n()

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
  title: page.value.seo.title,
  description: page.value.seo.description,
  image: page.value.seo.ogImage
})
</script>

<template>
  <UPage v-if="page">
    <ContentRenderer :value="page" />
  </UPage>
</template>
