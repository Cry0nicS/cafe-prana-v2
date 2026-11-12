<script setup lang="ts">
import {
  EVENT_POSTER_SIZES,
  formatEventDateLong,
  formatEventPrice,
  getEventDateIso,
  getEventTime,
  type EventLike
} from '~/utils/events'

type NextEvent = EventLike & {
  path: string
  title: string
  description?: string
  image?: {
    src: string
    alt: string
  } | null
  paid?: boolean
  price?: number
}

// The soonest upcoming event, as the homepage's gatherings section shows it:
// an invitation, with the event's picture on one side and what, when and how
// much on the other.
// It lives here rather than in `components/content/` because it takes the
// event as a prop and cannot be placed from a markdown body.
const props = defineProps<{
  event: NextEvent
}>()

const { locale, t } = useI18n()

// The time, then the price when the event is paid for: "6PM, €30".
const details = computed(() => [
  getEventTime(props.event, t('event.noTime')),
  props.event.paid && typeof props.event.price === 'number' ? formatEventPrice(props.event.price, locale.value) : ''
].filter(Boolean).join(', '))
const hasPhoto = computed(() => Boolean(props.event.image?.src))
</script>

<template>
  <article
    class="mx-auto grid max-w-5xl overflow-hidden rounded-[2.5rem] bg-elevated/60 ring-1 ring-default"
    :class="hasPhoto ? 'md:grid-cols-[5fr_7fr]' : ''"
  >
    <!--
      Shown whole, never cropped: most event pictures are posters with their
      title and date printed on them. `sizes` is `EVENT_POSTER_SIZES`, shared
      with the event page, whose variants are baked for every event at build
      time - so whichever event becomes next after a date rollover still
      resolves under `ipxStatic`.
    -->
    <EventsEventPoster
      v-if="hasPhoto"
      :src="event.image!.src"
      :alt="event.image!.alt"
      :sizes="EVENT_POSTER_SIZES"
      inset="p-6 sm:p-8"
      class="aspect-[4/3] md:aspect-[4/5]"
    />

    <div class="flex flex-col justify-center p-8 sm:p-12">
      <p class="text-sm text-primary">
        {{ t('home.events.next') }}
      </p>
      <h3 class="mt-3 font-serif text-3xl leading-[1.1] tracking-[-0.02em] text-balance text-highlighted sm:text-4xl">
        {{ event.title }}
      </h3>
      <p class="mt-4 text-toned">
        <time :datetime="getEventDateIso(event.date)">{{ formatEventDateLong(event, locale) }}</time>, {{ details }}
      </p>
      <p
        v-if="event.description"
        class="mt-5 line-clamp-3 leading-7 text-pretty text-muted"
      >
        {{ event.description }}
      </p>
      <div class="mt-8">
        <UButton
          :to="event.path"
          :label="t('home.events.view')"
          size="lg"
          class="px-6"
        />
      </div>
    </div>
  </article>
</template>
