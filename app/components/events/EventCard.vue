<script setup lang="ts">
import {
  formatEventDate,
  formatEventPrice,
  getEventTime,
  isUpcomingEvent,
  type EventLike
} from '~/utils/events'

type EventCard = EventLike & {
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
  event: EventCard
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
  <article class="group flex h-full flex-col overflow-hidden rounded-lg border border-default bg-default shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
    <NuxtLink
      :to="event.path"
      class="block overflow-hidden"
      :aria-label="`${t('event.viewDetails')} ${event.title}`"
    >
      <NuxtImg
        :src="event.image.src"
        :alt="event.image.alt"
        class="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
        sizes="sm:100vw md:50vw lg:33vw"
        format="webp"
        placeholder
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-4 p-5">
      <div class="flex items-center justify-between gap-3">
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

      <div class="space-y-2">
        <h3 class="font-serif text-xl font-medium tracking-tight text-highlighted">
          <ULink :to="event.path">
            {{ event.title }}
          </ULink>
        </h3>
        <p class="line-clamp-3 text-sm leading-6 text-muted">
          {{ event.description }}
        </p>
      </div>

      <dl class="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm tabular-nums text-muted">
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

      <div class="mt-auto flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-sm text-muted">
          {{ reservationNote }}
        </span>
        <UButton
          :to="event.path"
          :label="t('event.viewDetails')"
          icon="i-lucide-arrow-right"
          trailing
          size="sm"
          color="primary"
          variant="ghost"
          class="self-start sm:self-auto"
        />
      </div>
    </div>
  </article>
</template>
