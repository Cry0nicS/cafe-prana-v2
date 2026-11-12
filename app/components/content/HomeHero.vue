<script setup lang="ts">
import { EVENT_POSTER_SIZES, formatEventDate, getEventDateIso } from '~/utils/events'
import { riseIn } from '~/utils/motion'
import { Nodes, SlotParts } from '~/utils/slot-parts'

// The top of the homepage. Everything the owner writes is markdown in the
// slot: an optional short line of news, the `#` title, a paragraph, a photo.
// The buttons are code, so they always point at the right pages.
const { locale, t } = useI18n()
const localePath = useLocalePath()

// With an event coming up the hero is two columns, the owner's text beside
// the event's poster. With none it is one centred column over the photo.
const { data: nextEvent } = await useNextEvent()

const sizes = 'sm:100vw md:100vw lg:896px'
const frame = 'my-0 aspect-[3/2] w-full rounded-[2rem] object-cover shadow-none ring-0 sm:aspect-[5/2]'

// The photo is the LCP image when it shows, so it is preloaded and never lazy.
// Beside an event it stays in the page, hidden and lazy: `ipxStatic` only
// bakes the pictures rendered at build time, and the day the event has passed
// this photo has to be there without a rebuild.
const photo = computed(() => nextEvent.value
  ? { zoom: false, format: 'webp', sizes, loading: 'lazy', class: `hidden ${frame}` }
  : { zoom: false, format: 'webp', sizes, fetchpriority: 'high', preload: { fetchPriority: 'high' }, class: frame })
</script>

<template>
  <SlotParts
    v-slot="{ kicker, title, body, media }"
    :nodes="$slots.default?.()"
  >
    <UContainer
      as="section"
      class="relative isolate py-12 text-center sm:py-16"
    >
      <div
        aria-hidden="true"
        class="cafe-glow"
      />

      <div :class="nextEvent ? 'grid items-center gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16 lg:text-left' : ''">
        <Motion v-bind="riseIn()">
          <div
            v-if="kicker.length"
            class="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary"
          >
            <Nodes :nodes="kicker" />
          </div>
          <div
            class="mx-auto mt-5 max-w-3xl font-serif text-[clamp(2.125rem,1.4rem+2.9vw,3.5rem)] leading-[1.08] font-normal tracking-[-0.025em] text-balance text-highlighted"
            :class="nextEvent ? 'lg:mx-0' : ''"
          >
            <Nodes :nodes="title" />
          </div>
          <div
            class="mx-auto mt-5 max-w-xl text-lg leading-8 text-pretty text-toned"
            :class="nextEvent ? 'lg:mx-0' : ''"
          >
            <Nodes :nodes="body" />
          </div>
          <div
            class="mt-8 flex flex-wrap justify-center gap-3"
            :class="nextEvent ? 'lg:justify-start' : ''"
          >
            <UButton
              :to="localePath('/reservations')"
              :label="t('home.hero.reserve')"
              size="lg"
              class="px-6"
            />
            <UButton
              :to="localePath('/menu')"
              :label="t('home.hero.menu')"
              size="lg"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
              class="px-4"
            />
          </div>
        </Motion>

        <!-- The poster whole, at its own shape, with what and when under it.
             On a phone it shrinks to a thumbnail beside the words. `sizes` is
             the event page's, so the variants exist for every event. -->
        <Motion
          v-if="nextEvent"
          v-bind="riseIn(0.15, 24)"
        >
          <NuxtLink
            :to="nextEvent.path"
            class="mx-auto block max-w-md rounded-[2rem] bg-default p-4 text-left shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-default transition duration-300 hover:ring-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:mr-0 lg:max-w-[21rem] lg:rotate-1 lg:hover:rotate-0"
            :class="nextEvent.image?.src ? 'grid grid-cols-[6.5rem_1fr] items-center gap-5 lg:grid-cols-1 lg:gap-4' : ''"
          >
            <NuxtImg
              v-if="nextEvent.image?.src"
              :src="nextEvent.image.src"
              :alt="nextEvent.image.alt || ''"
              :sizes="EVENT_POSTER_SIZES"
              format="webp"
              class="h-auto w-full rounded-2xl"
            />
            <span class="block lg:px-2 lg:pb-2">
              <span class="text-sm text-primary">{{ t('home.events.next') }}</span>
              <span class="mt-1 block font-serif text-xl leading-snug text-highlighted lg:text-2xl">{{ nextEvent.title }}</span>
              <time
                :datetime="getEventDateIso(nextEvent.date)"
                class="mt-1 block text-sm text-muted"
              >{{ formatEventDate(nextEvent, locale) }}</time>
            </span>
          </NuxtLink>
        </Motion>
      </div>

      <Motion
        v-if="media.length"
        v-bind="riseIn(0.15, 24)"
        class="mx-auto max-w-4xl"
        :class="nextEvent ? '' : 'mt-12'"
      >
        <Nodes
          :nodes="media.slice(0, 1)"
          :extra="photo"
        />
      </Motion>
    </UContainer>
  </SlotParts>
</template>
