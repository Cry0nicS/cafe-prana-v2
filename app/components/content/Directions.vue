<script setup lang="ts">
import { CAFE_MAP_EMBED_URL, CAFE_MAPS_URL } from '#shared/utils/constants'
import { formatOpeningHours, weekdayLabel } from '#shared/utils/opening-hours'

defineProps<{
  title?: string
  description?: string
  hoursHeading?: string
}>()

const { locale, t } = useI18n()
const localePath = useLocalePath()

// The hours come from `content/opening-hours.yml`, not from this block's
// props, so English and German always show the same times.
const { data: openingHours } = await useOpeningHours()

const hours = computed(() => openingHours.value.hours.map(entry => ({
  day: entry.day,
  label: weekdayLabel(entry.day, locale.value),
  time: formatOpeningHours(entry) ?? t('home.directions.closed'),
  closed: !formatOpeningHours(entry)
})))

const links = computed(() => [
  {
    label: t('home.directions.get'),
    to: CAFE_MAPS_URL,
    icon: 'i-lucide-map',
    color: 'primary' as const,
    target: '_blank' as const
  },
  {
    label: t('nav.reservations'),
    to: localePath('/reservations'),
    icon: 'i-lucide-calendar-check',
    color: 'neutral' as const,
    variant: 'outline' as const
  }
])
</script>

<template>
  <UPageCTA
    id="directions"
    :title="title"
    :links="links"
    orientation="horizontal"
    variant="naked"
    class="mb-24 overflow-hidden"
  >
    <template #description>
      <p>{{ description }}</p>
      <div class="mt-6 max-w-md">
        <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          {{ hoursHeading }}
        </h3>
        <ul class="mt-3 space-y-2">
          <li
            v-for="item in hours"
            :key="item.day"
            class="flex items-center justify-between gap-4 border-b border-default pb-2"
          >
            <span>{{ item.label }}</span>
            <UBadge
              variant="soft"
              :color="item.closed ? 'neutral' : 'success'"
              class="font-mono tabular-nums"
            >
              {{ item.time }}
            </UBadge>
          </li>
        </ul>
      </div>
    </template>

    <iframe
      :src="CAFE_MAP_EMBED_URL"
      width="100%"
      class="h-[420px] w-full rounded-2xl border-0 shadow-lg ring-1 ring-default lg:h-full"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Café Prana map"
    />
  </UPageCTA>
</template>
