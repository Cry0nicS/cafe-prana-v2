<script setup lang="ts">
import { CAFE_MAP_EMBED_URL, CAFE_MAPS_URL } from '#shared/utils/constants'
import { weekdayLabel } from '#shared/utils/calendar'
import { formatOpeningHours } from '#shared/utils/opening-hours'
import { Nodes, SlotParts } from '~/utils/slot-parts'

const { locale, t } = useI18n()
const localePath = useLocalePath()

// The hours come from `content/opening-hours.yml`, not from this block's
// text, so English and German always show the same times.
const { data: openingHours } = await useOpeningHours()

const hours = computed(() => openingHours.value.hours.map(entry => ({
  day: entry.day,
  label: weekdayLabel(entry.day, locale.value),
  time: formatOpeningHours(entry) ?? t('home.directions.closed'),
  closed: !formatOpeningHours(entry)
})))
</script>

<template>
  <SlotParts
    v-slot="{ title, body }"
    :nodes="$slots.default?.()"
  >
    <section
      id="directions"
      class="bg-elevated/60 py-20 sm:py-28"
    >
      <UContainer class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <div class="home-title">
            <Nodes :nodes="title" />
          </div>
          <div class="mt-5 text-lg leading-8 text-muted">
            <Nodes :nodes="body" />
          </div>

          <h3 class="sr-only">
            {{ t('home.directions.hours') }}
          </h3>
          <ul class="mt-9 max-w-sm space-y-2.5">
            <li
              v-for="item in hours"
              :key="item.day"
              class="flex justify-between gap-6"
              :class="item.closed ? 'text-dimmed' : 'text-toned'"
            >
              <span>{{ item.label }}</span>
              <span class="tabular-nums">{{ item.time }}</span>
            </li>
          </ul>

          <div class="mt-10 flex flex-wrap gap-3">
            <UButton
              :to="localePath('/reservations')"
              :label="t('home.hero.reserve')"
              size="lg"
              class="px-6"
            />
            <UButton
              :to="CAFE_MAPS_URL"
              target="_blank"
              :label="t('home.directions.get')"
              size="lg"
              color="neutral"
              variant="outline"
              class="px-6"
            />
          </div>
        </div>

        <iframe
          :src="CAFE_MAP_EMBED_URL"
          class="h-[26rem] w-full rounded-[2.5rem] border-0 lg:h-[32rem]"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Café Prana map"
        />
      </UContainer>
    </section>
  </SlotParts>
</template>
