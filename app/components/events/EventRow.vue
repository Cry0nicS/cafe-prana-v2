<script setup lang="ts">
import {
  eventDateParts,
  eventReservationKey,
  formatEventPrice,
  getEventTime,
  isUpcomingEvent,
  type EventLike,
  type EventReservation
} from '~/utils/events'

type EventRow = EventLike & {
  path: string
  title: string
  description: string
  image: {
    src: string
    alt: string
  } | null
  paid?: boolean
  price?: number
  reservation?: EventReservation
}

// One event in the events list: the image in a landscape frame, the date set
// large, then title, summary and its time / price / booking chips.
const props = defineProps<{
  event: EventRow
}>()

const { locale, t } = useI18n()

const upcoming = computed(() => isUpcomingEvent(props.event))
const date = computed(() => eventDateParts(props.event, locale.value))
const showPrice = computed(() => props.event.paid && typeof props.event.price === 'number')
</script>

<template>
  <NuxtLink
    :to="event.path"
    class="group grid grid-cols-1 items-center gap-5 rounded-[1.75rem] bg-elevated/40 p-3 ring-1 ring-default transition duration-300 ease-out hover:bg-elevated/80 hover:shadow-xl hover:shadow-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:grid-cols-[11rem_4.5rem_minmax(0,1fr)_auto] sm:gap-6 sm:pr-5 lg:grid-cols-[13rem_5rem_minmax(0,1fr)_auto] lg:gap-7"
  >
    <EventsEventPoster
      :src="event.image?.src"
      :alt="event.image?.alt"
      class="aspect-[16/10] rounded-2xl"
      :class="upcoming ? '' : 'grayscale-[40%]'"
      sizes="sm:100vw md:208px"
    />

    <div
      class="hidden text-center sm:block"
      aria-hidden="true"
    >
      <p class="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
        {{ date.weekday }}
      </p>
      <p class="font-serif text-5xl leading-none font-medium text-highlighted">
        {{ date.day }}
      </p>
      <p class="mt-1 font-mono text-xs tracking-[0.18em] text-muted uppercase">
        {{ date.month }} {{ date.year }}
      </p>
    </div>

    <div class="min-w-0 px-2 pb-2 sm:px-0 sm:py-2">
      <p class="font-mono text-xs tracking-wider text-primary uppercase sm:sr-only">
        {{ date.weekday }} {{ date.day }} {{ date.month }} {{ date.year }}
      </p>
      <h3 class="font-serif text-xl leading-snug font-medium text-highlighted transition-colors duration-200 group-hover:text-primary sm:text-2xl">
        {{ event.title }}
      </h3>
      <p
        v-if="event.description"
        class="mt-1.5 line-clamp-2 hidden max-w-2xl text-sm leading-6 text-muted sm:block"
      >
        {{ event.description }}
      </p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs">
        <span class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-default px-2.5 py-1 text-toned ring-1 ring-default">
          <UIcon
            name="i-lucide-clock"
            class="size-3.5 shrink-0 text-primary"
          />
          <span class="truncate">{{ getEventTime(event, t('event.noTime')) }}</span>
        </span>
        <span
          v-if="showPrice"
          class="rounded-full bg-default px-2.5 py-1 font-mono text-toned ring-1 ring-default"
        >
          {{ formatEventPrice(event.price!, locale) }}
        </span>
        <span
          v-if="upcoming"
          class="rounded-full bg-primary/10 px-2.5 py-1 text-primary"
        >
          {{ t(eventReservationKey(event.reservation)) }}
        </span>
      </div>
    </div>

    <span
      aria-hidden="true"
      class="hidden size-12 place-items-center rounded-full bg-default text-muted ring-1 ring-default transition duration-300 group-hover:bg-primary group-hover:text-inverted group-hover:ring-primary sm:grid"
    >
      <UIcon
        name="i-lucide-arrow-right"
        class="size-5 transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </span>
  </NuxtLink>
</template>
