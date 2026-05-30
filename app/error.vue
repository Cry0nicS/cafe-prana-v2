<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { locale, t } = useI18n()
const htmlLang = computed(() => locale.value === 'de' ? 'de-DE' : 'en-US')

const localizedError = computed(() => {
  if (props.error.statusCode !== 404) {
    return props.error
  }

  return {
    ...props.error,
    message: t('error.notFoundMessage'),
    statusMessage: t('error.notFoundTitle')
  }
})

const seoTitle = computed(() => props.error.statusCode === 404 ? t('error.notFoundTitle') : t('error.genericTitle'))
const seoDescription = computed(() => props.error.statusCode === 404 ? t('error.notFoundDescription') : t('error.genericDescription'))

useHead(() => ({
  htmlAttrs: {
    lang: htmlLang.value
  }
}))

useSeoMeta({
  title: seoTitle,
  description: seoDescription
})

const navigationLinks = useNavigationLinks()
</script>

<template>
  <div>
    <AppHeader :links="navigationLinks" />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="localizedError" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <UToaster />
  </div>
</template>
