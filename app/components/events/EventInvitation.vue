<script setup lang="ts">
import { eventReservationKey, type EventReservation } from '~/utils/events'

// How an event page closes: a calm invitation rather than a booking panel.
// The café's promise, then the one button - or, once the date has gone, a
// word that it has and the way back to the other events.
const props = defineProps<{
  upcoming: boolean
  reservation?: EventReservation
  reservationPath: string
  eventsPath: string
}>()

const { t } = useI18n()
const needsBooking = computed(() => props.reservation !== 'walkin')
</script>

<template>
  <aside class="mx-auto max-w-xl text-center">
    <span
      aria-hidden="true"
      class="mx-auto block h-px w-16 bg-[var(--cafe-spark)]"
    />
    <p class="mt-8 font-serif text-2xl leading-snug text-highlighted italic sm:text-3xl">
      {{ t('event.dietary') }}
    </p>
    <template v-if="upcoming">
      <UButton
        v-if="needsBooking"
        :to="reservationPath"
        :label="t('event.reserve')"
        size="xl"
        class="mt-8 rounded-full px-7"
      />
      <p class="mt-3 text-sm text-muted">
        {{ t(eventReservationKey(reservation)) }}
      </p>
    </template>
    <p
      v-else
      class="mt-6 text-muted"
    >
      {{ t('event.passed') }}
      <ULink
        :to="eventsPath"
        class="ml-1 text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
      >
        {{ t('event.more') }}
      </ULink>
    </p>
  </aside>
</template>
