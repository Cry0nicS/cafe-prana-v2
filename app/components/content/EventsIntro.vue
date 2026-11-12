<script setup lang="ts">
import { Nodes, SlotParts } from '~/utils/slot-parts'

// What the gatherings are, as markdown: a `##` title, a paragraph, then each
// kind of gathering as a `###` with a line under it. Between the two sits the
// next event that is coming up, which fills itself in from the events the
// owner publishes and is simply absent when there is none.
const { t } = useI18n()
const localePath = useLocalePath()

const { data: nextEvent } = await useNextEvent()
</script>

<template>
  <SlotParts
    v-slot="{ title, body, items }"
    :nodes="$slots.default?.()"
  >
    <UContainer
      as="section"
      class="py-20 sm:py-28"
    >
      <div class="mx-auto max-w-2xl text-center">
        <div class="home-title">
          <Nodes :nodes="title" />
        </div>
        <div class="mt-5 text-lg leading-8 text-muted">
          <Nodes :nodes="body" />
        </div>
      </div>

      <EventsNextEventCard
        v-if="nextEvent"
        :event="nextEvent"
        class="mt-14"
      />

      <div
        v-if="items.length"
        class="mx-auto mt-14 grid max-w-5xl gap-x-12 gap-y-10 text-center sm:grid-cols-3"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
        >
          <span
            aria-hidden="true"
            class="mx-auto block h-0.5 w-6 rounded-full bg-[var(--cafe-spark)]"
          />
          <div class="mt-5 font-serif text-xl leading-tight text-highlighted">
            <Nodes :nodes="item.title" />
          </div>
          <div class="mx-auto mt-2 max-w-xs leading-7 text-muted">
            <Nodes :nodes="item.body" />
          </div>
        </div>
      </div>

      <div class="mt-14 text-center">
        <UButton
          :to="localePath('/events')"
          :label="t('home.events.explore')"
          size="lg"
          color="neutral"
          variant="outline"
          class="px-6"
        />
      </div>
    </UContainer>
  </SlotParts>
</template>
