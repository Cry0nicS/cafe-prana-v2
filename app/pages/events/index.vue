<script setup lang="ts">
import { CAFE_CONTACT_MAILTO } from '#shared/utils/constants'
import { compareEventsAsc, compareEventsDesc, isUpcomingEvent } from '~/utils/events'
import type { EventTimeTab } from '~/components/events/EventTimeTabs.vue'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const localizeLinks = useLocalizedLinks()

const [{ data: page }, { data: events }] = await Promise.all([
  useAsyncData(
    `events-page-${locale.value}`,
    () => queryCollection(locale.value === 'de' ? 'eventsPageDe' : 'eventsPageEn').first(),
    { watch: [locale] }
  ),
  useAsyncData(
    `events-list-${locale.value}`,
    () => queryCollection(locale.value === 'de' ? 'eventsDe' : 'eventsEn').order('date', 'ASC').all(),
    { watch: [locale], default: () => [] }
  )
])

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Events page not found',
    fatal: true
  })
}

const upcomingEvents = computed(() => events.value.filter(event => isUpcomingEvent(event)).sort(compareEventsAsc))
const pastEvents = computed(() => events.value.filter(event => !isUpcomingEvent(event)).sort(compareEventsDesc))

const heroLinks = computed(() => localizeLinks(page.value?.hero.links))

// The list opens on what is coming up, or on the archive when nothing is.
const tab = ref<EventTimeTab>(upcomingEvents.value.length ? 'upcoming' : 'past')
watch(() => upcomingEvents.value.length, (count) => {
  tab.value = count ? 'upcoming' : 'past'
})
const shownEvents = computed(() => (tab.value === 'upcoming' ? upcomingEvents.value : pastEvents.value))

// Beside the heading: the next three posters, or the latest three when nothing
// is coming up. With no event photos at all, the page's own image stands in.
const fanPosters = computed(() => {
  const posters = (upcomingEvents.value.length ? upcomingEvents.value : pastEvents.value)
    .filter(event => event.image?.src)
    .slice(0, 3)
    .map(event => ({ to: event.path, label: event.title, src: event.image.src, alt: event.image.alt }))

  if (posters.length || !page.value?.hero.image?.src) {
    return posters
  }

  return [{ label: page.value.hero.title, src: page.value.hero.image.src, alt: page.value.hero.image.alt }]
})

useCafeSeo({
  title: () => t('seo.events.title'),
  description: () => t('seo.events.description'),
  image: '/images/events/index.webp'
})
</script>

<template>
  <div
    v-if="page"
    class="pb-28"
  >
    <!-- Heading -->
    <section class="relative isolate grid items-center gap-14 px-2 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-24">
      <div
        aria-hidden="true"
        class="cafe-glow"
      />
      <Motion
        :initial="{ opacity: 0, x: -14 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }"
      >
        <p
          v-if="page.hero.headline"
          class="cafe-eyebrow"
        >
          {{ page.hero.headline }}
        </p>
        <h1 class="mt-6 font-serif text-5xl leading-[1.03] font-medium tracking-tight text-highlighted sm:text-6xl">
          {{ page.hero.title }}
        </h1>
        <p class="mt-6 max-w-md text-lg leading-8 text-muted">
          {{ page.hero.description }}
        </p>
        <div class="mt-9 flex flex-wrap gap-3">
          <UButton
            v-for="link in heroLinks"
            :key="link.label"
            v-bind="link"
            size="lg"
            class="rounded-full px-5"
          />
        </div>
        <p class="mt-10 inline-flex items-center gap-3 rounded-full bg-primary/8 px-4 py-2 text-sm text-toned ring-1 ring-primary/15">
          <UIcon
            name="i-lucide-leaf"
            class="size-4 text-primary"
          />
          {{ t('event.dietary') }}
        </p>
      </Motion>

      <EventsEventPosterFan
        v-if="fanPosters.length"
        :posters="fanPosters"
      />
    </section>

    <!-- The list -->
    <div class="flex flex-col gap-5 border-t border-default px-2 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-6">
      <div>
        <h2 class="font-serif text-3xl font-medium text-highlighted sm:text-4xl">
          {{ tab === 'past' ? page.sections.pastTitle : page.sections.upcomingTitle }}
        </h2>
        <p
          v-if="tab === 'past'"
          class="mt-2 max-w-lg text-muted"
        >
          {{ upcomingEvents.length ? page.sections.pastDescription : page.sections.pastOnlyDescription }}
        </p>
      </div>
      <EventsEventTimeTabs
        v-model="tab"
        :upcoming="upcomingEvents.length"
        :past="pastEvents.length"
        controls="events-list"
        class="self-start sm:self-auto"
      />
    </div>

    <div
      id="events-list"
      role="tabpanel"
      :aria-labelledby="`events-list-tab-${tab}`"
      class="mt-10 px-2 sm:px-6"
    >
      <Transition
        mode="out-in"
        enter-active-class="transition duration-400 ease-out motion-reduce:transition-none"
        enter-from-class="opacity-0 translate-y-3"
        leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
        leave-to-class="opacity-0"
      >
        <!-- Nothing announced yet -->
        <div
          v-if="!shownEvents.length"
          key="empty"
          class="flex flex-col items-start gap-6 rounded-[2rem] bg-elevated/70 p-8 sm:flex-row sm:items-center sm:p-10"
        >
          <div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-default text-primary shadow-sm">
            <UIcon
              name="i-lucide-calendar-heart"
              class="size-6"
            />
          </div>
          <div class="flex-1">
            <h3 class="font-serif text-2xl font-medium text-highlighted">
              {{ page.sections.emptyUpcomingTitle }}
            </h3>
            <p class="mt-2 max-w-xl leading-7 text-muted">
              {{ page.sections.emptyUpcomingDescription }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              :label="t('nav.reservations')"
              :to="localePath('/reservations')"
              icon="i-lucide-calendar-check"
              size="lg"
              class="rounded-full"
            />
            <UButton
              :label="t('reservations.email')"
              :to="CAFE_CONTACT_MAILTO"
              icon="i-lucide-mail"
              color="neutral"
              variant="outline"
              size="lg"
              class="rounded-full"
            />
          </div>
        </div>

        <ol
          v-else
          :key="tab"
          class="space-y-4"
        >
          <Motion
            v-for="(event, index) in shownEvents"
            :key="event.path"
            as="li"
            :initial="{ opacity: 0, y: 14 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :in-view-options="{ once: true }"
            :transition="{ duration: 0.5, delay: Math.min(index, 4) * 0.06, ease: [0.22, 1, 0.36, 1] }"
          >
            <EventsEventRow :event="event" />
          </Motion>
        </ol>
      </Transition>
    </div>
  </div>
</template>
