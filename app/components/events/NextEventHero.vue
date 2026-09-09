<script setup lang="ts">
import {
  formatEventDate,
  formatEventPrice,
  getEventTime,
  type EventLike
} from '~/utils/events'

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
// The photo is a whole grid column, so an event without one has to collapse the
// card to a single column rather than reserve an empty 42% and a 24rem floor.
const hasPhoto = computed(() => Boolean(props.event.image?.src))
</script>

<template>
  <section>
    <UContainer class="py-12 sm:py-16 lg:py-24">
      <article
        class="relative grid overflow-hidden rounded-xl border border-default bg-muted/40"
        :class="hasPhoto ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)]' : 'lg:grid-cols-1'"
      >
        <!-- The spark hairline, brought up from the events listing's stat cards. -->
        <span
          class="absolute inset-x-0 top-0 z-10 h-0.5 bg-[var(--cafe-spark)]"
          aria-hidden="true"
        />

        <div class="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
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
            class="mt-3 max-w-2xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-highlighted sm:text-5xl xl:text-6xl"
          >
            {{ event.title }}
          </component>
          <p class="mt-5 line-clamp-4 max-w-xl text-lg leading-8 text-muted">
            {{ event.description }}
          </p>
        </div>

        <!--
          The photo bleeds to the card's edge: no inset, no rounding of its own
          (the card clips it) and no aura, which stays the welcome hero's
          signature. A fixed aspect ratio while the columns are stacked; once
          side by side it is taken out of flow so the text column sets the
          card's height and the photo fills it.
        -->
        <div
          v-if="hasPhoto"
          class="relative lg:min-h-96"
        >
          <!--
            LCP element while the poster shows, so it follows the welcome
            hero's image handling: no `placeholder` (it strips `srcset` from
            the server-rendered markup until hydration), plus `preload` and a
            high fetch priority. `sizes` and `format` are the event detail
            page's for this same photo on purpose - those variants are baked
            for every event at build time, so whichever event becomes next
            after a date rollover still resolves under `ipxStatic`.
          -->
          <NuxtImg
            :src="event.image.src"
            :alt="event.image.alt || ''"
            format="webp"
            sizes="sm:100vw lg:768px"
            class="aspect-[16/10] w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
            fetchpriority="high"
            :preload="{ fetchPriority: 'high' }"
          />
        </div>

        <footer
          class="flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-default px-6 py-4 sm:px-8 lg:px-12"
          :class="{ 'lg:col-span-2': hasPhoto }"
        >
          <dl class="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-sm tabular-nums text-toned">
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
          </dl>
          <UButton
            :to="event.path"
            :label="t('home.hero.viewEvent')"
            icon="i-lucide-arrow-right"
            trailing
            color="primary"
            size="lg"
            class="basis-full justify-center sm:ml-auto sm:basis-auto"
          />
        </footer>
      </article>
    </UContainer>
  </section>
</template>
