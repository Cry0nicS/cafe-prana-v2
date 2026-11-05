<script setup lang="ts">
import { formatEventDate, type EventLike } from '~/utils/events'

type MoreEvent = EventLike & {
  path: string
  title: string
}

// Other events, at the foot of an event page, as a plain list of date and
// title. No pictures: the page above already had its poster, and the list is
// a way onward, not a second gallery.
defineProps<{
  events: MoreEvent[]
}>()

const { locale, t } = useI18n()
</script>

<template>
  <nav
    v-if="events.length"
    :aria-label="t('event.more')"
  >
    <p class="cafe-eyebrow">
      {{ t('event.more') }}
    </p>
    <ul class="mt-6 border-t border-default">
      <li
        v-for="event in events"
        :key="event.path"
        class="border-b border-default"
      >
        <NuxtLink
          :to="event.path"
          class="group flex flex-col gap-1 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:flex-row sm:items-baseline sm:gap-6"
        >
          <span class="shrink-0 font-mono text-xs tracking-wider text-dimmed uppercase sm:w-40">
            {{ formatEventDate(event, locale) }}
          </span>
          <span class="flex min-w-0 flex-1 items-baseline justify-between gap-4">
            <span class="font-serif text-xl text-toned transition-colors duration-200 group-hover:text-primary">
              {{ event.title }}
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 shrink-0 self-center text-dimmed transition duration-200 group-hover:translate-x-1 group-hover:text-primary"
            />
          </span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
