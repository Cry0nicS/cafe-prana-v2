<script setup lang="ts">
import {
  formatEventDate,
  getEventCategoryLabel,
  getEventTime,
  isUpcomingEvent,
  type EventLike
} from '~/utils/events'

type EventFeature = EventLike & {
  path: string
  title: string
  description: string
  badge?: string
  image: {
    src: string
    alt: string
  }
  price: {
    label: string
  }
  booking: {
    enabled: boolean
    required?: boolean
  }
  tags?: string[]
}

const props = defineProps<{
  event: EventFeature
  reverse?: boolean
}>()

const upcoming = computed(() => isUpcomingEvent(props.event))
const bookingLabel = computed(() => {
  if (!props.event.booking.enabled) {
    return 'No booking needed'
  }

  return props.event.booking.required ? 'Reservation required' : 'Reservation recommended'
})

const visibleTags = computed(() => props.event.tags?.slice(0, 4) || [])
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
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          :label="upcoming ? 'Upcoming' : 'Past event'"
          :color="upcoming ? 'primary' : 'neutral'"
          variant="soft"
        />
        <UBadge
          :label="event.badge || getEventCategoryLabel(event.category)"
          color="neutral"
          variant="outline"
        />
      </div>

      <div class="space-y-3">
        <p class="text-sm font-medium text-muted">
          {{ formatEventDate(event) }}
        </p>
        <h3 class="text-2xl font-semibold leading-tight text-highlighted">
          <ULink :to="event.path">
            {{ event.title }}
          </ULink>
        </h3>
        <p class="max-w-xl text-sm leading-7 text-muted">
          {{ event.description }}
        </p>
      </div>

      <dl class="grid gap-3 text-sm text-muted sm:grid-cols-2">
        <div class="flex items-start gap-2">
          <UIcon
            name="i-lucide-clock"
            class="mt-0.5 size-4 shrink-0 text-primary"
          />
          <div>
            <dt class="sr-only">
              Time
            </dt>
            <dd>{{ getEventTime(event) }}</dd>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <UIcon
            name="i-lucide-ticket"
            class="mt-0.5 size-4 shrink-0 text-primary"
          />
          <div>
            <dt class="sr-only">
              Price
            </dt>
            <dd>{{ event.price.label }}</dd>
          </div>
        </div>
      </dl>

      <div
        v-if="visibleTags.length"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="tag in visibleTags"
          :key="tag"
          :label="tag"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 pt-1">
        <UButton
          :to="event.path"
          label="View event"
          icon="i-lucide-arrow-right"
          trailing
          color="primary"
          variant="ghost"
          class="px-0"
        />
        <span class="text-sm text-muted">
          {{ bookingLabel }}
        </span>
      </div>
    </div>

    <NuxtLink
      :to="event.path"
      class="block overflow-hidden rounded-lg shadow-lg ring-1 ring-default"
      :class="reverse ? 'lg:order-1' : 'lg:order-2'"
      :aria-label="`View details for ${event.title}`"
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
