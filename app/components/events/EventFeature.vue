<script setup lang="ts">
import {
  formatEventDate,
  formatEventPrice,
  getEventTime,
  isUpcomingEvent,
  type EventLike
} from '~/utils/events'

type EventFeature = EventLike & {
  path: string
  title: string
  description: string
  image: {
    src: string
    alt: string
  }
  paid?: boolean
  price?: number
  reservation?: 'required' | 'recommended' | 'walkin'
}

const props = defineProps<{
  event: EventFeature
  reverse?: boolean
}>()

const { locale, t } = useI18n()

const upcoming = computed(() => isUpcomingEvent(props.event))
const showPrice = computed(() => props.event.paid && typeof props.event.price === 'number')
const reservationNote = computed(() => {
  switch (props.event.reservation) {
    case 'required':
      return t('event.reservationRequired')
    case 'walkin':
      return t('event.noBookingNeeded')
    default:
      return t('event.reservationRecommended')
  }
})
</script>

<template>
  <article
    class="group grid gap-7 lg:items-center lg:gap-10"
    :class="reverse ? 'lg:grid-cols-[380px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_380px]'"
  >
    <div
      class="min-w-0 space-y-4"
      :class="reverse ? 'lg:order-2' : 'lg:order-1'"
    >
      <div class="flex items-center gap-3">
        <p class="cafe-eyebrow">
          {{ formatEventDate(event, locale) }}
        </p>
        <UBadge
          v-if="!upcoming"
          :label="t('event.pastEvent')"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </div>

      <div class="space-y-3">
        <h3 class="font-serif text-2xl font-medium leading-tight tracking-tight text-highlighted">
          <ULink :to="event.path">
            {{ event.title }}
          </ULink>
        </h3>
        <p class="max-w-xl text-sm leading-7 text-muted">
          {{ event.description }}
        </p>
      </div>

      <dl class="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm tabular-nums text-muted">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-clock"
            class="size-4 shrink-0 text-primary"
          />
          <dd>{{ getEventTime(event, t('event.noTime')) }}</dd>
        </div>
        <div
          v-if="showPrice"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-ticket"
            class="size-4 shrink-0 text-primary"
          />
          <dd>{{ formatEventPrice(event.price!, locale) }}</dd>
        </div>
      </dl>

      <div class="flex flex-wrap items-center gap-3 pt-1">
        <UButton
          :to="event.path"
          :label="t('event.viewEvent')"
          icon="i-lucide-arrow-right"
          trailing
          color="primary"
          variant="ghost"
          class="px-0"
        />
        <span class="text-sm text-muted">
          {{ reservationNote }}
        </span>
      </div>
    </div>

    <NuxtLink
      :to="event.path"
      class="block overflow-hidden rounded-2xl shadow-lg ring-1 ring-default"
      :class="reverse ? 'lg:order-1' : 'lg:order-2'"
      :aria-label="`${t('event.viewDetails')} ${event.title}`"
    >
      <NuxtImg
        :src="event.image.src"
        :alt="event.image.alt"
        class="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-105"
        sizes="sm:100vw lg:380px"
        format="webp"
        placeholder
      />
    </NuxtLink>
  </article>
</template>
