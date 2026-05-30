<script setup lang="ts">
import {
  formatEventDate,
  getEventCategoryLabel,
  getEventTime,
  isUpcomingEvent,
  type EventLike
} from '~/utils/events'

type EventCard = EventLike & {
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
  event: EventCard
}>()

const { locale, t } = useI18n()

const upcoming = computed(() => isUpcomingEvent(props.event))
const bookingLabel = computed(() => {
  if (!props.event.booking.enabled) {
    return t('event.noBookingNeeded')
  }

  return props.event.booking.required ? t('event.reservationRequired') : t('event.reservationRecommended')
})

const visibleTags = computed(() => props.event.tags?.slice(0, 3) || [])
const getTagLabel = (tag: string) => t(`event.tagLabels.${tag}`)
</script>

<template>
  <article class="group flex h-full flex-col overflow-hidden rounded-lg border border-default bg-default shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <NuxtLink
      :to="event.path"
      class="block overflow-hidden"
      :aria-label="`${t('event.viewDetails')} ${event.title}`"
    >
      <NuxtImg
        :src="event.image.src"
        :alt="event.image.alt"
        class="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
        sizes="sm:100vw md:50vw lg:33vw"
        format="webp"
        placeholder
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-4 p-5">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          :label="upcoming ? t('event.upcoming') : t('event.past')"
          :color="upcoming ? 'primary' : 'neutral'"
          variant="soft"
        />
        <UBadge
          :label="event.badge || getEventCategoryLabel(event.category, locale)"
          color="neutral"
          variant="outline"
        />
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-highlighted">
          <ULink :to="event.path">
            {{ event.title }}
          </ULink>
        </h3>
        <p class="line-clamp-3 text-sm leading-6 text-muted">
          {{ event.description }}
        </p>
      </div>

      <dl class="grid gap-3 text-sm">
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-calendar-days"
            class="mt-0.5 size-4 shrink-0 text-primary"
          />
          <div>
            <dt class="sr-only">
              {{ t('event.date') }}
            </dt>
            <dd class="font-medium text-highlighted">
              {{ formatEventDate(event, locale) }}
            </dd>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-clock"
            class="mt-0.5 size-4 shrink-0 text-primary"
          />
          <div>
            <dt class="sr-only">
              {{ t('event.time') }}
            </dt>
            <dd>{{ getEventTime(event, t('event.noTime')) }}</dd>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-ticket"
            class="mt-0.5 size-4 shrink-0 text-primary"
          />
          <div>
            <dt class="sr-only">
              {{ t('event.price') }}
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
          :label="getTagLabel(tag)"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </div>

      <div class="mt-auto flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-sm text-muted">
          {{ bookingLabel }}
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
