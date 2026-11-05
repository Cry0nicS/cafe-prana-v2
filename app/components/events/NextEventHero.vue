<script setup lang="ts">
import {
  EVENT_POSTER_SIZES,
  formatEventDateLong,
  formatEventPrice,
  getEventDateIso,
  getEventTime,
  type EventLike
} from '~/utils/events'
import { riseIn } from '~/utils/motion'

type NextEvent = EventLike & {
  path: string
  title: string
  description: string
  image: {
    src: string
    alt: string
  }
  paid?: boolean
  price?: number
}

// The announcement poster the homepage leads with while an event is coming
// up. It is rendered by `HomeHero`, not placed in content: the welcome hero
// decides between the two, so the owner never has to manage a second block.
// It lives here rather than in `components/content/` on purpose - that folder
// is registered globally for MDC, which would offer this as a block in
// Studio's slash menu, where it could only render broken without its prop.
const props = defineProps<{
  title?: string
  event: NextEvent
}>()

const { locale, t } = useI18n()

const showPrice = computed(() => props.event.paid && typeof props.event.price === 'number')
// The poster is a column of its own, so an event without one has to collapse
// to a single column rather than reserve an empty half of the hero.
const hasPhoto = computed(() => Boolean(props.event.image?.src))
</script>

<template>
  <!-- The same shape as every page's `PageHeading`, with the event's poster
       beside it - shown whole, as a card, never cropped: posters carry their
       own printed title and date. -->
  <section
    class="relative isolate grid items-center gap-14 px-2 pt-12 pb-14 sm:px-6 sm:pt-16 lg:pt-20"
    :class="hasPhoto ? 'xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]' : 'xl:grid-cols-1'"
  >
    <div
      aria-hidden="true"
      class="cafe-glow"
    />

    <Motion v-bind="riseIn()">
      <p class="cafe-eyebrow">
        {{ t('home.hero.nextEvent') }}
      </p>
      <!--
        The welcome title stays the page's single top-level heading even
        though the event's name is the display line: the outline should
        name the cafe, not whichever event happens to be next. Should the
        owner clear that title, the event's name takes the h1 so the page
        never goes without one.
      -->
      <h1
        v-if="title"
        class="mt-5 font-serif text-lg font-medium tracking-tight text-toned sm:text-xl"
      >
        {{ title }}
      </h1>
      <component
        :is="title ? 'h2' : 'h1'"
        class="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] font-medium tracking-tight text-balance text-highlighted sm:text-5xl lg:text-6xl"
      >
        {{ event.title }}
      </component>
      <p class="mt-6 line-clamp-4 max-w-xl text-lg leading-8 text-pretty text-muted">
        {{ event.description }}
      </p>

      <!-- The practical details, as one line of type, like the event page -->
      <dl class="mt-8 flex max-w-xl flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-toned [&>div+div]:before:mr-2 [&>div+div]:before:text-dimmed [&>div+div]:before:content-['·']">
        <div>
          <dt class="sr-only">
            {{ t('event.date') }}
          </dt>
          <dd class="inline">
            <time :datetime="getEventDateIso(event.date)">{{ formatEventDateLong(event, locale) }}</time>
          </dd>
        </div>
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
      </dl>

      <UButton
        :to="event.path"
        :label="t('home.hero.viewEvent')"
        icon="i-lucide-arrow-right"
        trailing
        size="lg"
        class="mt-9 px-5"
      />
    </Motion>

    <NuxtLink
      v-if="hasPhoto"
      :to="event.path"
      :aria-label="event.title"
      class="group relative mx-auto grid w-full max-w-md place-items-center rounded-2xl py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div
        class="cafe-aura"
        aria-hidden="true"
      />
      <!--
        LCP element while the poster shows, so it follows the welcome
        hero's image handling: no `placeholder` (it strips `srcset` from
        the server-rendered markup until hydration), plus `preload` and a
        high fetch priority. `sizes` is `EVENT_POSTER_SIZES`, shared with
        the event page, whose variants are baked for every event at build
        time - so whichever event becomes next after a date rollover still
        resolves under `ipxStatic`.
      -->
      <NuxtImg
        :src="event.image.src"
        :alt="event.image.alt || ''"
        format="webp"
        :sizes="EVENT_POSTER_SIZES"
        class="relative z-10 h-auto w-60 rotate-[1.5deg] rounded-lg shadow-[0_30px_60px_-18px_rgba(0,0,0,0.4)] ring-1 ring-black/5 transition duration-500 ease-out group-hover:rotate-0 group-hover:-translate-y-1 sm:w-72 dark:ring-white/10"
        fetchpriority="high"
        :preload="{ fetchPriority: 'high' }"
      />
    </NuxtLink>
  </section>
</template>
