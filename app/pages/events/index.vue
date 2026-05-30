<script setup lang="ts">
import { compareEventsAsc, compareEventsDesc, isUpcomingEvent } from '~/utils/events'

const [{ data: page }, { data: events }] = await Promise.all([
  useAsyncData('events-page', () => queryCollection('eventsPage').first()),
  useAsyncData('events-list', () => queryCollection('events').order('startDate', 'ASC').all())
])

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Events page not found',
    fatal: true
  })
}

const allEvents = computed(() => events.value || [])
const upcomingEvents = computed(() => allEvents.value.filter(event => isUpcomingEvent(event)).sort(compareEventsAsc))
const pastEvents = computed(() => allEvents.value.filter(event => !isUpcomingEvent(event)).sort(compareEventsDesc))

const title = computed(() => page.value?.seo.title || page.value?.hero.title)
const description = computed(() => page.value?.seo.description || page.value?.hero.description)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: () => page.value?.seo.ogImage || page.value?.hero.image.src
})

if (page.value.seo.ogImage) {
  defineOgImage({ url: page.value.seo.ogImage })
}
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.hero.title"
      :description="page.hero.description"
      :headline="page.hero.headline"
      :links="page.hero.links"
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
        <div class="rounded-lg border border-default bg-muted/40 p-4">
          <p class="text-sm text-muted">
            Upcoming
          </p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">
            {{ upcomingEvents.length }}
          </p>
        </div>
        <div class="rounded-lg border border-default bg-muted/40 p-4">
          <p class="text-sm text-muted">
            Past
          </p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">
            {{ pastEvents.length }}
          </p>
        </div>
        <div class="rounded-lg border border-default bg-muted/40 p-4">
          <p class="text-sm text-muted">
            Format
          </p>
          <p class="mt-1 text-2xl font-semibold text-highlighted">
            Café gatherings
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
              label="Reserve a table"
              to="/reservations"
              icon="i-lucide-calendar-check"
              color="primary"
            />
            <UButton
              label="Email Café Prana"
              to="mailto:info@cafeprana.de"
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
      :description="upcomingEvents.length ? 'A look back at recent community meals, workshops, and seasonal gatherings.' : 'All migrated legacy events are currently in the past. New events will automatically move into the upcoming section when dated in the future.'"
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
