<script setup lang="ts">
import {
  CAFE_ADDRESS,
  CAFE_MAPS_URL,
  CAFE_NAME,
  CAFE_SITE_URL
} from '#shared/utils/constants'
import {
  compareEventsDesc,
  formatEventDateLong,
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
// Under the locale-prefixed tree a content `path` is the public route, so the
// page is looked up by its own route path rather than rebuilt from the slug.
const contentPath = computed(() => route.path.replace(/\/$/, '') || '/')

const [{ data: event }, { data: events }] = await Promise.all([
  useAsyncData(
    `event-${locale.value}-${slug.value}`,
    () => queryCollection(locale.value === 'de' ? 'eventsDe' : 'eventsEn')
      .path(contentPath.value)
      .first(),
    { watch: [locale, slug] }
  ),
  useAsyncData(
    `events-related-${locale.value}`,
    () => queryCollection(locale.value === 'de' ? 'eventsDe' : 'eventsEn').order('date', 'DESC').all(),
    { watch: [locale] }
  )
])

if (!event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Event not found',
    fatal: true
  })
}

const reservationPath = computed(() => localePath('/reservations'))
const eventsPath = computed(() => localePath('/events'))
const upcoming = computed(() => (event.value ? isUpcomingEvent(event.value) : false))
const showPrice = computed(() => event.value?.paid && typeof event.value.price === 'number')
const needsBooking = computed(() => event.value?.reservation !== 'walkin')

const locationLabel = computed(() => `${global.name}, ${CAFE_ADDRESS.city}`)

const title = computed(() => event.value?.seo?.title || event.value?.title)
const description = computed(() => event.value?.seo?.description || event.value?.description)
const image = computed(() => event.value?.seo?.ogImage || event.value?.image?.src)

const relatedEvents = computed(() => {
  if (!event.value) {
    return []
  }

  return (events.value || [])
    .filter(item => item.path !== contentPath.value)
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
  <div
    v-if="event"
    class="pb-28"
  >
    <header class="relative isolate px-4 pt-12 pb-14 text-center sm:pt-16">
      <div
        aria-hidden="true"
        class="cafe-glow opacity-70"
      />
      <ULink
        :to="eventsPath"
        class="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-highlighted"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        {{ t('event.backToEvents') }}
      </ULink>

      <Motion
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }"
      >
        <p class="mt-12 font-mono text-xs tracking-[0.22em] text-primary uppercase">
          <time :datetime="getEventDateIso(event.date)">{{ formatEventDateLong(event, locale) }}</time>
        </p>
        <h1 class="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.08] font-medium tracking-tight text-balance text-highlighted sm:text-6xl">
          {{ event.title }}
        </h1>
        <p
          v-if="event.description"
          class="mx-auto mt-6 max-w-xl text-lg leading-8 text-pretty text-muted"
        >
          {{ event.description }}
        </p>

        <!-- The practical details, as one line of type -->
        <dl class="mx-auto mt-8 flex max-w-2xl flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-sm text-toned [&>div+div]:before:mr-2 [&>div+div]:before:text-dimmed [&>div+div]:before:content-['·']">
          <div>
            <dt class="sr-only">
              {{ t('event.time') }}
            </dt>
            <dd class="inline">
              {{ getEventTime(event, t('event.noTime')) }}
            </dd>
          </div>
          <div v-if="showPrice">
            <dt class="sr-only">
              {{ t('event.price') }}
            </dt>
            <dd class="inline">
              {{ formatEventPrice(event.price!, locale) }}
            </dd>
          </div>
          <div>
            <dt class="sr-only">
              {{ t('event.location') }}
            </dt>
            <dd class="inline">
              <ULink
                :to="CAFE_MAPS_URL"
                target="_blank"
                class="underline decoration-default underline-offset-4 transition hover:decoration-primary"
              >
                {{ locationLabel }}
              </ULink>
            </dd>
          </div>
        </dl>

        <UButton
          v-if="upcoming && needsBooking"
          :to="reservationPath"
          :label="t('event.reserve')"
          size="lg"
          class="mt-8 rounded-full px-6"
        />
        <p
          v-else-if="!upcoming"
          class="mt-6 text-sm text-dimmed"
        >
          {{ t('event.passed') }}
        </p>
      </Motion>
    </header>

    <div class="mx-auto max-w-3xl px-2 sm:px-6">
      <span
        aria-hidden="true"
        class="block h-px w-full bg-gradient-to-r from-transparent via-[var(--ui-border-accented)] to-transparent"
      />

      <article class="cafe-prose mt-14">
        <!-- The poster at its own shape, tucked into the story like a printed
             card. Left out, not filled in, when no photo has been chosen yet:
             the text simply runs the full column. -->
        <figure
          v-if="event.image?.src"
          class="mx-auto mb-10 w-60 rotate-[1.5deg] sm:float-right sm:mt-2 sm:mb-6 sm:ml-10 sm:w-64"
        >
          <NuxtImg
            :src="event.image.src"
            :alt="event.image.alt || ''"
            class="h-auto w-full rounded-lg shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:ring-white/10"
            sizes="sm:240px md:256px"
            format="webp"
            placeholder
          />
        </figure>
        <ContentRenderer
          v-if="event.body"
          :value="event"
        />
      </article>

      <EventsEventInvitation
        :upcoming="upcoming"
        :reservation="event.reservation"
        :reservation-path="reservationPath"
        :events-path="eventsPath"
        class="clear-both pt-24"
      />

      <EventsEventMoreList
        :events="relatedEvents"
        class="mt-24"
      />
    </div>
  </div>
</template>
