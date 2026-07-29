<script setup lang="ts">
import { CAFE_CONTACT_MAILTO } from '#shared/utils/constants'
import { compareEventsAsc, compareEventsDesc, eventSlug, isUpcomingEvent } from '~/utils/events'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const localizeLinks = useLocalizedLinks()

const [{ data: page }, { data: events }] = await Promise.all([
  useAsyncData(
    `events-page-${locale.value}`,
    () => queryCollection('eventsPage').where('locale', '=', locale.value).first(),
    { watch: [locale] }
  ),
  useAsyncData(
    `events-list-${locale.value}`,
    () => queryCollection('events').where('locale', '=', locale.value).order('date', 'ASC').all(),
    { watch: [locale] }
  )
])

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Events page not found',
    fatal: true
  })
}

const allEvents = computed(() =>
  (events.value || []).map(event => ({
    ...event,
    path: localePath(`/events/${eventSlug(event.stem)}`)
  }))
)
const upcomingEvents = computed(() => allEvents.value.filter(event => isUpcomingEvent(event)).sort(compareEventsAsc))
const pastEvents = computed(() => allEvents.value.filter(event => !isUpcomingEvent(event)).sort(compareEventsDesc))

const title = computed(() => page.value?.seo.title || page.value?.hero.title)
const description = computed(() => page.value?.seo.description || page.value?.hero.description)
const heroLinks = computed(() => localizeLinks(page.value?.hero.links))

useCafeSeo({
  title,
  description,
  image: () => page.value?.seo.ogImage || page.value?.hero.image.src
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.hero.title"
      :description="page.hero.description"
      :headline="page.hero.headline"
      :links="heroLinks"
      orientation="horizontal"
      :ui="{
        container: 'max-w-6xl!',
        title: 'mx-0! text-left',
        description: 'mx-0! text-left',
        links: 'justify-start'
      }"
    >
      <template #default>
        <NuxtImg
          :src="page.hero.image.src"
          :alt="page.hero.image.alt"
          class="aspect-[4/3] w-full rounded-lg object-cover shadow-lg ring-1 ring-default"
          sizes="sm:100vw md:50vw lg:540px"
          format="webp"
          placeholder
        />
      </template>
    </UPageHero>

    <UPageSection
      :ui="{
        container: 'max-w-6xl! pt-0!'
      }"
    >
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="relative overflow-hidden rounded-xl border border-default bg-muted/40 p-5">
          <span class="absolute inset-x-0 top-0 h-0.5 bg-[var(--cafe-spark)]" />
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-dimmed">
            {{ t('event.upcoming') }}
          </p>
          <p class="mt-2 font-mono text-3xl font-bold tabular-nums text-highlighted">
            {{ upcomingEvents.length }}
          </p>
        </div>
        <div class="relative overflow-hidden rounded-xl border border-default bg-muted/40 p-5">
          <span class="absolute inset-x-0 top-0 h-0.5 bg-[var(--cafe-spark)]" />
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-dimmed">
            {{ t('event.past') }}
          </p>
          <p class="mt-2 font-mono text-3xl font-bold tabular-nums text-highlighted">
            {{ pastEvents.length }}
          </p>
        </div>
        <div class="relative overflow-hidden rounded-xl border border-default bg-muted/40 p-5">
          <span class="absolute inset-x-0 top-0 h-0.5 bg-[var(--cafe-spark)]" />
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-dimmed">
            {{ t('event.everyGathering') }}
          </p>
          <p class="mt-2 font-mono text-sm font-medium tracking-wide text-highlighted">
            {{ t('event.dietary') }}
          </p>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      v-if="upcomingEvents.length"
      :title="page.sections.upcomingTitle"
      :ui="{
        container: 'max-w-6xl! pt-0!'
      }"
    >
      <div class="space-y-6 lg:space-y-14">
        <div class="grid gap-6 md:grid-cols-2 lg:hidden">
          <Motion
            v-for="(event, index) in upcomingEvents"
            :key="event.path"
            :initial="{ opacity: 0, transform: 'translateY(10px)' }"
            :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
            :transition="{ delay: 0.12 * index }"
            :in-view-options="{ once: true }"
          >
            <EventsEventCard :event="event" />
          </Motion>
        </div>

        <div class="hidden space-y-16 lg:block">
          <Motion
            v-for="(event, index) in upcomingEvents"
            :key="event.path"
            :initial="{ opacity: 0, transform: 'translateY(10px)' }"
            :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
            :transition="{ delay: 0.12 * index }"
            :in-view-options="{ once: true }"
          >
            <EventsEventFeature
              :event="event"
              :reverse="index % 2 === 1"
            />
          </Motion>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      v-else
      :ui="{
        container: 'max-w-6xl! pt-0!'
      }"
    >
      <UPageCard
        icon="i-lucide-calendar-plus"
        :title="page.sections.emptyUpcomingTitle"
        :description="page.sections.emptyUpcomingDescription"
        variant="subtle"
        :ui="{
          root: 'rounded-lg'
        }"
      >
        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              :label="t('nav.reservations')"
              :to="localePath('/reservations')"
              icon="i-lucide-calendar-check"
              color="primary"
            />
            <UButton
              :label="t('reservations.email')"
              :to="CAFE_CONTACT_MAILTO"
              icon="i-lucide-mail"
              color="neutral"
              variant="outline"
            />
          </div>
        </template>
      </UPageCard>
    </UPageSection>

    <UPageSection
      v-if="pastEvents.length"
      :title="page.sections.pastTitle"
      :description="upcomingEvents.length ? page.sections.pastDescription : page.sections.pastOnlyDescription"
      :ui="{
        container: 'max-w-6xl! pt-0!'
      }"
    >
      <div class="space-y-6 lg:space-y-14">
        <div class="grid gap-6 md:grid-cols-2 lg:hidden">
          <Motion
            v-for="(event, index) in pastEvents"
            :key="event.path"
            :initial="{ opacity: 0, transform: 'translateY(10px)' }"
            :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
            :transition="{ delay: 0.08 * index }"
            :in-view-options="{ once: true }"
          >
            <EventsEventCard :event="event" />
          </Motion>
        </div>

        <div class="hidden space-y-16 lg:block">
          <Motion
            v-for="(event, index) in pastEvents"
            :key="event.path"
            :initial="{ opacity: 0, transform: 'translateY(10px)' }"
            :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
            :transition="{ delay: 0.08 * index }"
            :in-view-options="{ once: true }"
          >
            <EventsEventFeature
              :event="event"
              :reverse="index % 2 === 1"
            />
          </Motion>
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
