<script setup lang="ts">
import { CAFE_SITE_URL } from '#shared/utils/constants'
import {
  compareEventsDesc,
  formatEventDate,
  getEventCategoryLabel,
  getEventDateIso,
  getEventTime,
  isUpcomingEvent
} from '~/utils/events'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const localizePath = useLocalizedPath()
const slug = computed(() => String(route.params.slug))

const [{ data: rawEvent }, { data: eventsIndex }, { data: events }] = await Promise.all([
  useAsyncData(
    `event-${locale.value}-${slug.value}`,
    () => queryCollection('events')
      .where('locale', '=', locale.value)
      .where('slug', '=', slug.value)
      .first(),
    { watch: [locale, slug] }
  ),
  useAsyncData(
    `events-page-for-detail-${locale.value}`,
    () => queryCollection('eventsPage').where('locale', '=', locale.value).first(),
    { watch: [locale] }
  ),
  useAsyncData(
    `events-related-${locale.value}`,
    () => queryCollection('events').where('locale', '=', locale.value).order('startDate', 'DESC').all(),
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
      path: localePath(`/events/${rawEvent.value.slug}`)
    }
  : null
)

const labels = computed(() => eventsIndex.value?.labels || {
  date: t('event.date'),
  time: t('event.time'),
  location: 'Location',
  price: t('event.price'),
  booking: 'Booking'
})

const title = computed(() => event.value?.seo?.title || event.value?.title)
const description = computed(() => event.value?.seo?.description || event.value?.description)
const image = computed(() => event.value?.seo?.ogImage || event.value?.heroImage.src || event.value?.image.src)
const eventIsUpcoming = computed(() => event.value ? isUpcomingEvent(event.value) : false)
const bookingLabel = computed(() => {
  if (!event.value?.booking.enabled) {
    return t('event.noBookingNeeded')
  }

  return event.value.booking.required ? t('event.reservationRequired') : t('event.reservationRecommended')
})

const relatedEvents = computed(() => {
  if (!event.value) {
    return []
  }

  return (events.value || [])
    .filter(item => item.slug !== event.value?.slug)
    .map(item => ({
      ...item,
      path: localePath(`/events/${item.slug}`)
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

  if (value.startsWith('mailto:')) {
    return undefined
  }

  return `${CAFE_SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
}

const eventJsonLd = computed(() => {
  const currentEvent = event.value

  if (!currentEvent) {
    return {}
  }

  const location: Record<string, unknown> = {
    '@type': 'Place',
    'name': currentEvent.location.name
  }

  if (currentEvent.location.address || currentEvent.location.city || currentEvent.location.country) {
    location.address = {
      '@type': 'PostalAddress',
      'streetAddress': currentEvent.location.address,
      'addressLocality': currentEvent.location.city,
      'addressCountry': currentEvent.location.country
    }
  }

  const structuredEvent: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': currentEvent.title,
    'description': currentEvent.description,
    'startDate': getEventDateIso(currentEvent.startDate),
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'eventStatus': 'https://schema.org/EventScheduled',
    'location': location,
    'organizer': {
      '@type': 'Organization',
      'name': 'Cafe Prana',
      'url': CAFE_SITE_URL
    },
    'url': toAbsoluteUrl(currentEvent.path)
  }

  if (currentEvent.endDate) {
    structuredEvent.endDate = getEventDateIso(currentEvent.endDate)
  }

  if (image.value) {
    structuredEvent.image = [toAbsoluteUrl(image.value)]
  }

  if (currentEvent.price.amount !== undefined && currentEvent.price.currency) {
    structuredEvent.offers = {
      '@type': 'Offer',
      'price': currentEvent.price.amount,
      'priceCurrency': currentEvent.price.currency,
      'availability': 'https://schema.org/InStock',
      'url': toAbsoluteUrl(localizePath(currentEvent.booking.url || currentEvent.path))
    }
  }

  return structuredEvent
})

const getTagLabel = (tag: string) => t(`event.tagLabels.${tag}`)

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
  <UPage v-if="event">
    <UContainer class="pt-8">
      <ULink
        :to="localePath('/events')"
        class="inline-flex items-center gap-1 text-sm text-muted transition hover:text-highlighted"
      >
        <UIcon
          name="i-lucide-chevron-left"
          class="size-4"
        />
        {{ t('event.backToEvents') }}
      </ULink>
    </UContainer>

    <UPageSection
      :ui="{
        container: 'pt-8!'
      }"
    >
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div class="space-y-6">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :label="eventIsUpcoming ? t('event.upcoming') : t('event.pastEvent')"
              :color="eventIsUpcoming ? 'primary' : 'neutral'"
              variant="soft"
            />
            <UBadge
              :label="event.badge || getEventCategoryLabel(event.category, locale)"
              color="neutral"
              variant="outline"
            />
            <UBadge
              :label="getEventCategoryLabel(event.category, locale)"
              color="neutral"
              variant="soft"
            />
          </div>

          <div class="max-w-3xl space-y-4">
            <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
              {{ event.title }}
            </h1>
            <p class="text-lg leading-8 text-muted">
              {{ event.description }}
            </p>
          </div>

          <NuxtImg
            :src="event.heroImage.src"
            :alt="event.heroImage.alt"
            class="aspect-[16/10] w-full rounded-lg object-cover shadow-lg ring-1 ring-default"
            sizes="sm:100vw lg:760px"
            format="webp"
            placeholder
          />
        </div>

        <aside class="rounded-lg border border-default bg-muted/30 p-5 lg:sticky lg:top-24">
          <dl class="grid gap-4 text-sm">
            <div class="flex gap-3">
              <UIcon
                name="i-lucide-calendar-days"
                class="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div>
                <dt class="font-medium text-highlighted">
                  {{ labels.date }}
                </dt>
                <dd class="mt-1 text-muted">
                  {{ formatEventDate(event, locale) }}
                </dd>
              </div>
            </div>
            <div class="flex gap-3">
              <UIcon
                name="i-lucide-clock"
                class="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div>
                <dt class="font-medium text-highlighted">
                  {{ labels.time }}
                </dt>
                <dd class="mt-1 text-muted">
                  {{ getEventTime(event, t('event.noTime')) }}
                </dd>
              </div>
            </div>
            <div class="flex gap-3">
              <UIcon
                name="i-lucide-map-pin"
                class="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div>
                <dt class="font-medium text-highlighted">
                  {{ labels.location }}
                </dt>
                <dd class="mt-1 text-muted">
                  {{ event.location.name }}
                </dd>
              </div>
            </div>
            <div class="flex gap-3">
              <UIcon
                name="i-lucide-ticket"
                class="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div>
                <dt class="font-medium text-highlighted">
                  {{ labels.price }}
                </dt>
                <dd class="mt-1 text-muted">
                  {{ event.price.label }}
                </dd>
              </div>
            </div>
          </dl>

          <div class="mt-5 border-t border-default pt-5">
            <p class="text-sm font-medium text-highlighted">
              {{ labels.booking }}
            </p>
            <p
              v-if="event.booking.note"
              class="mt-2 text-sm leading-6 text-muted"
            >
              {{ event.booking.note }}
            </p>
            <UButton
              v-if="event.booking.enabled"
              :to="localizePath(event.booking.url || '/reservations')"
              :label="event.booking.label"
              icon="i-lucide-calendar-check"
              color="primary"
              block
              class="mt-4"
            />
            <p class="mt-3 text-xs text-muted">
              {{ bookingLabel }}
            </p>
          </div>
        </aside>
      </div>
    </UPageSection>

    <UPageSection
      :title="t('event.about')"
      :ui="{
        container: 'pt-0!'
      }"
    >
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div class="min-w-0">
          <ContentRenderer
            v-if="event.body"
            :value="event"
          />
        </div>

        <aside
          v-if="event.tags.length"
          class="lg:sticky lg:top-24"
        >
          <div class="rounded-lg border border-default bg-muted/30 p-6">
            <h2 class="text-xl font-semibold text-highlighted">
              {{ t('event.tags') }}
            </h2>
            <div class="mt-4 flex flex-wrap gap-2">
              <UBadge
                v-for="tag in event.tags"
                :key="tag"
                :label="getTagLabel(tag)"
                color="neutral"
                variant="soft"
              />
            </div>
          </div>
        </aside>
      </div>
    </UPageSection>

    <UPageSection
      v-if="relatedEvents.length"
      :title="t('event.more')"
      :description="t('event.moreDescription')"
      :ui="{
        container: 'pt-0!'
      }"
    >
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <EventsEventCard
          v-for="relatedEvent in relatedEvents"
          :key="relatedEvent.path"
          :event="relatedEvent"
        />
      </div>
    </UPageSection>
  </UPage>
</template>
