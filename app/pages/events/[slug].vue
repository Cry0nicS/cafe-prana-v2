<script setup lang="ts">
import {
  CAFE_ADDRESS,
  CAFE_MAPS_URL,
  CAFE_NAME,
  CAFE_SITE_URL
} from '#shared/utils/constants'
import {
  compareEventsDesc,
  eventSlug,
  formatEventDate,
  formatEventPrice,
  getEventDateIso,
  getEventTime,
  isUpcomingEvent
} from '~/utils/events'

const route = useRoute()
const { global } = useAppConfig()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => String(route.params.slug))
// URL slug maps back to the file stem: en -> `events/<slug>`, de -> `events/<slug>.de`.
const stem = computed(() => locale.value === 'de' ? `events/${slug.value}.de` : `events/${slug.value}`)

const [{ data: rawEvent }, { data: events }] = await Promise.all([
  useAsyncData(
    `event-${locale.value}-${slug.value}`,
    () => queryCollection('events')
      .where('locale', '=', locale.value)
      .where('stem', '=', stem.value)
      .first(),
    { watch: [locale, slug] }
  ),
  useAsyncData(
    `events-related-${locale.value}`,
    () => queryCollection('events').where('locale', '=', locale.value).order('date', 'DESC').all(),
    { watch: [locale] }
  )
])

if (!rawEvent.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Event not found',
    fatal: true
  })
}

const event = computed(() => rawEvent.value
  ? {
      ...rawEvent.value,
      path: localePath(`/events/${slug.value}`)
    }
  : null
)

const reservationPath = computed(() => localePath('/reservations'))
const eventsPath = computed(() => localePath('/events'))
const upcoming = computed(() => (event.value ? isUpcomingEvent(event.value) : false))
const showPrice = computed(() => event.value?.paid && typeof event.value.price === 'number')
const needsBooking = computed(() => event.value?.reservation !== 'walkin')
const reservationNote = computed(() => {
  switch (event.value?.reservation) {
    case 'required':
      return t('event.reservationRequired')
    case 'walkin':
      return t('event.noBookingNeeded')
    default:
      return t('event.reservationRecommended')
  }
})

const locationLabel = computed(() => `${global.name}, ${CAFE_ADDRESS.city}`)

const title = computed(() => event.value?.seo?.title || event.value?.title)
const description = computed(() => event.value?.seo?.description || event.value?.description)
const image = computed(() => event.value?.seo?.ogImage || event.value?.image.src)

const relatedEvents = computed(() => {
  if (!event.value) {
    return []
  }

  return (events.value || [])
    .filter(item => eventSlug(item.stem) !== slug.value)
    .map(item => ({
      ...item,
      path: localePath(`/events/${eventSlug(item.stem)}`)
    }))
    .sort(compareEventsDesc)
    .slice(0, 3)
})

const toAbsoluteUrl = (value?: string) => {
  if (!value) {
    return undefined
  }

  if (/^https?:\/\//.test(value)) {
    return value
  }

  return `${CAFE_SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
}

const eventJsonLd = computed(() => {
  const currentEvent = event.value

  if (!currentEvent) {
    return {}
  }

  const structuredEvent: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': currentEvent.title,
    'description': currentEvent.description,
    'startDate': getEventDateIso(currentEvent.date),
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'eventStatus': 'https://schema.org/EventScheduled',
    'location': {
      '@type': 'Place',
      'name': CAFE_NAME,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': CAFE_ADDRESS.street,
        'postalCode': CAFE_ADDRESS.postalCode,
        'addressLocality': CAFE_ADDRESS.city,
        'addressCountry': CAFE_ADDRESS.country
      }
    },
    'organizer': {
      '@type': 'Organization',
      'name': CAFE_NAME,
      'url': CAFE_SITE_URL
    },
    'url': toAbsoluteUrl(currentEvent.path)
  }

  if (image.value) {
    structuredEvent.image = [toAbsoluteUrl(image.value)]
  }

  if (currentEvent.paid && typeof currentEvent.price === 'number') {
    structuredEvent.offers = {
      '@type': 'Offer',
      'price': currentEvent.price,
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
      'url': toAbsoluteUrl(reservationPath.value)
    }
  }

  return structuredEvent
})

useCafeSeo({
  title,
  description,
  image,
  type: 'article'
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify(eventJsonLd.value)
  }]
}))
</script>

<template>
  <UContainer
    v-if="event"
    class="pb-24 pt-8"
  >
    <ULink
      :to="eventsPath"
      class="inline-flex items-center gap-1 text-sm text-muted transition hover:text-highlighted"
    >
      <UIcon
        name="i-lucide-chevron-left"
        class="size-4"
      />
      {{ t('event.backToEvents') }}
    </ULink>

    <article class="mx-auto mt-8 max-w-3xl">
      <header class="space-y-5">
        <div class="flex flex-wrap items-center gap-3">
          <p class="cafe-eyebrow">
            {{ formatEventDate(event, locale) }}
          </p>
          <UBadge
            :label="upcoming ? t('event.upcoming') : t('event.pastEvent')"
            :color="upcoming ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
          />
        </div>

        <h1 class="font-serif text-4xl font-medium tracking-tight text-highlighted sm:text-5xl">
          {{ event.title }}
        </h1>
        <p class="text-lg leading-8 text-muted">
          {{ event.description }}
        </p>
      </header>

      <NuxtImg
        :src="event.image.src"
        :alt="event.image.alt"
        class="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-xl ring-1 ring-default"
        sizes="sm:100vw lg:768px"
        format="webp"
        placeholder
      />

      <!-- Details bar -->
      <dl class="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 rounded-2xl border border-default bg-muted/40 px-5 py-4 font-mono text-sm tabular-nums text-toned">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-calendar-days"
            class="size-4 shrink-0 text-primary"
          />
          <dt class="sr-only">
            {{ t('event.date') }}
          </dt>
          <dd>{{ formatEventDate(event, locale) }}</dd>
        </div>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-clock"
            class="size-4 shrink-0 text-primary"
          />
          <dt class="sr-only">
            {{ t('event.time') }}
          </dt>
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
          <dt class="sr-only">
            {{ t('event.price') }}
          </dt>
          <dd>{{ formatEventPrice(event.price!, locale) }}</dd>
        </div>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-map-pin"
            class="size-4 shrink-0 text-primary"
          />
          <dt class="sr-only">
            {{ t('event.location') }}
          </dt>
          <dd>
            <ULink
              :to="CAFE_MAPS_URL"
              target="_blank"
              class="hover:text-highlighted"
            >
              {{ locationLabel }}
            </ULink>
          </dd>
        </div>
      </dl>

      <!-- Reservation -->
      <div class="mt-6">
        <template v-if="upcoming">
          <div class="flex flex-wrap items-center gap-4">
            <UButton
              v-if="needsBooking"
              :to="reservationPath"
              :label="t('event.reserve')"
              icon="i-lucide-calendar-check"
              color="primary"
              size="lg"
            />
            <span class="text-sm text-muted">{{ reservationNote }}</span>
          </div>
        </template>
        <div
          v-else
          class="flex flex-wrap items-center gap-4 rounded-xl border border-default bg-muted/30 px-4 py-3"
        >
          <span class="text-sm text-muted">{{ t('event.passed') }}</span>
          <UButton
            :to="eventsPath"
            :label="t('event.more')"
            icon="i-lucide-arrow-right"
            trailing
            color="neutral"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      <p class="cafe-eyebrow mt-6">
        {{ t('event.dietary') }}
      </p>

      <!-- Body -->
      <div class="cafe-prose mt-10">
        <ContentRenderer
          v-if="event.body"
          :value="event"
        />
      </div>
    </article>

    <section
      v-if="relatedEvents.length"
      class="mx-auto mt-20 max-w-6xl"
    >
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="cafe-eyebrow">
            {{ t('event.more') }}
          </p>
          <h2 class="mt-2 font-serif text-2xl font-medium tracking-tight text-highlighted sm:text-3xl">
            {{ t('event.moreDescription') }}
          </h2>
        </div>
      </div>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <EventsEventCard
          v-for="relatedEvent in relatedEvents"
          :key="relatedEvent.path"
          :event="relatedEvent"
        />
      </div>
    </section>
  </UContainer>
</template>
