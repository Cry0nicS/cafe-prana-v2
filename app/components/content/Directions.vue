<script setup lang="ts">
import { CAFE_MAP_EMBED_URL, CAFE_MAPS_URL } from '#shared/utils/constants'

defineProps<{
  title?: string
  description?: string
  hoursHeading?: string
  hours?: { day: string, time: string, closed?: boolean }[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

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
    variant="outline"
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
            <span>{{ item.day }}</span>
            <UBadge
              variant="soft"
              :color="item.closed ? 'error' : 'success'"
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
      class="h-[420px] w-full rounded-lg border-0 lg:h-full"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Café Prana map"
    />
  </UPageCTA>
</template>
