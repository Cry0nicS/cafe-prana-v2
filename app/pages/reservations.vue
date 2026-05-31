<script setup lang="ts">
import { CAFE_CONTACT_MAILTO } from '#shared/utils/constants'

const { t } = useI18n()
const localePath = useLocalePath()

const features = computed(() => [{
  title: t('reservations.features.request.title'),
  description: t('reservations.features.request.description'),
  icon: 'i-lucide-calendar-plus'
}, {
  title: t('reservations.features.confirmation.title'),
  description: t('reservations.features.confirmation.description'),
  icon: 'i-lucide-clock-3'
}, {
  title: t('reservations.features.email.title'),
  description: t('reservations.features.email.description'),
  icon: 'i-lucide-mail-check'
}, {
  title: t('reservations.features.special.title'),
  description: t('reservations.features.special.description'),
  icon: 'i-lucide-leaf'
}, {
  title: t('reservations.features.changes.title'),
  description: t('reservations.features.changes.description'),
  icon: 'i-lucide-refresh-cw'
}])

useSeoMeta({
  title: () => t('reservations.seoTitle'),
  ogTitle: () => t('reservations.seoTitle'),
  description: () => t('reservations.seoDescription'),
  ogDescription: () => t('reservations.seoDescription'),
  ogImage: '/images/hero.png'
})
</script>

<template>
  <UPage>
    <UPageHero
      :headline="t('reservations.headline')"
      :title="t('reservations.title')"
      :description="t('reservations.description')"
      :links="[{
        label: t('reservations.email'),
        to: CAFE_CONTACT_MAILTO,
        icon: 'i-lucide-mail',
        color: 'neutral',
        variant: 'outline'
      }, {
        label: t('reservations.backHome'),
        to: localePath('/'),
        icon: 'i-lucide-arrow-left',
        color: 'neutral',
        variant: 'outline'
      }]"
      :ui="{
        container: 'max-w-5xl! py-12 sm:py-16 lg:py-20',
        title: 'max-w-3xl text-left',
        description: 'max-w-3xl text-left',
        links: 'justify-start'
      }"
    />

    <UPageSection
      :ui="{
        container: 'max-w-5xl! pt-0! lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)] lg:items-start lg:gap-12'
      }"
    >
      <div class="mb-8 space-y-4 lg:sticky lg:top-28 lg:mb-0">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-lg border border-default bg-muted/40 p-4"
        >
          <div class="flex items-start gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UIcon
                :name="feature.icon"
                class="size-5"
              />
            </span>
            <div>
              <h2 class="font-semibold text-highlighted">
                {{ feature.title }}
              </h2>
              <p class="mt-1 text-sm leading-6 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReservationsForm />
    </UPageSection>
  </UPage>
</template>
