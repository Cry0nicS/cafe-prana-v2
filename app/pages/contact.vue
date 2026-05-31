<script setup lang="ts">
import { CAFE_CONTACT_EMAIL, CAFE_CONTACT_MAILTO } from '#shared/utils/constants'

const { t } = useI18n()
const { global } = useAppConfig()

const directItems = computed(() => [{
  label: t('contact.email'),
  value: CAFE_CONTACT_EMAIL,
  icon: 'i-lucide-mail',
  to: CAFE_CONTACT_MAILTO
}, {
  label: t('contact.phone'),
  value: t('contact.phoneValue'),
  icon: 'i-lucide-phone'
}, {
  label: t('contact.address'),
  value: global.address,
  icon: 'i-lucide-map-pin',
  to: global.maps
}])

useSeoMeta({
  title: () => t('contact.seoTitle'),
  ogTitle: () => t('contact.seoTitle'),
  description: () => t('contact.seoDescription'),
  ogDescription: () => t('contact.seoDescription'),
  ogImage: '/images/hero.png'
})
</script>

<template>
  <UPage>
    <UPageSection
      :ui="{
        container: 'max-w-6xl! py-12 sm:py-16 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)] lg:items-start lg:gap-12'
      }"
    >
      <div class="mb-8 space-y-8 lg:sticky lg:top-28 lg:mb-0">
        <div>
          <p class="text-sm font-medium text-primary">
            {{ t('contact.headline') }}
          </p>
          <h1 class="mt-5 max-w-xl text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
            {{ t('contact.title') }}
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-8 text-muted">
            {{ t('contact.description') }}
          </p>
        </div>

        <UPageCard
          :title="t('contact.directTitle')"
          :description="t('contact.directDescription')"
          variant="naked"
          :ui="{ root: 'rounded-lg border border-default bg-muted/40 p-5 sm:p-6', description: 'mt-1' }"
        >
          <div class="mt-6 space-y-4">
            <ULink
              v-for="item in directItems"
              :key="item.label"
              :to="item.to"
              :target="item.to === global.maps ? '_blank' : undefined"
              class="group flex items-start gap-4 rounded-lg p-2 transition hover:bg-muted"
            >
              <span class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                <UIcon
                  :name="item.icon"
                  class="size-5"
                />
              </span>
              <span>
                <span class="block text-sm font-medium text-muted text-left">{{ item.label }}</span>
                <span class="mt-0.5 block text-base font-medium text-highlighted">{{ item.value }}</span>
              </span>
            </ULink>
          </div>
        </UPageCard>
      </div>

      <ContactForm />
    </UPageSection>
  </UPage>
</template>
