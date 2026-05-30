<script setup lang="ts">
const features = [{
  title: 'Request a Table',
  description: 'Choose date, time and party size to request a reservation. I try to accommodate all requests.',
  icon: 'i-lucide-calendar-plus'
}, {
  title: 'Confirmation within 24 hours',
  description: 'Reservations are confirmed within 24 hours. Please allow up to a day for final confirmation.',
  icon: 'i-lucide-clock-3'
}, {
  title: 'Email Confirmation',
  description: 'You will receive an email to confirm the reservation with all details and any follow-up instructions.',
  icon: 'i-lucide-mail-check'
}, {
  title: 'Special Requests & Allergies',
  description: 'Use the message section to tell me about allergies, accessibility needs, or other special requests.',
  icon: 'i-lucide-leaf'
}, {
  title: 'Changes & Cancellation',
  description: 'Need to change or cancel? Please notify me as soon as possible so I can free the table for others.',
  icon: 'i-lucide-refresh-cw'
}]

useSeoMeta({
  title: 'Reservations | Cafe Prana',
  ogTitle: 'Reservations | Cafe Prana',
  description: 'Plan your visit to Cafe Prana in Berlin and request a table for a special moment, relaxed gathering, or quiet date.',
  ogDescription: 'Plan your visit to Cafe Prana in Berlin and request a table for a special moment, relaxed gathering, or quiet date.',
  ogImage: '/images/hero.png'
})
</script>

<template>
  <UPage>
    <UPageHero
      headline="Reservations"
      title="Plan Your Visit to Cafe Prana"
      description="Whether you're planning a special moment, a relaxed gathering, or a quiet date, reserving your table helps me prepare a comfortable setting just for you."
      :links="[{
        label: 'Email Cafe Prana',
        to: 'mailto:info@cafeprana.de',
        icon: 'i-lucide-mail',
        color: 'neutral',
        variant: 'outline'
      }, {
        label: 'Back home',
        to: '/',
        icon: 'i-lucide-arrow-left',
        color: 'neutral',
        variant: 'outline'
      }]"
      :ui="{
        container: 'max-w-5xl! py-12 sm:py-16 lg:py-20',
        title: 'max-w-3xl text-left',
        description: 'max-w-3xl text-left',
        links: 'justify-start'
      }"
    />

    <UPageSection
      :ui="{
        container: 'max-w-5xl! pt-0! lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)] lg:items-start lg:gap-12'
      }"
    >
      <div class="mb-8 space-y-4 lg:sticky lg:top-28 lg:mb-0">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-lg border border-default bg-muted/40 p-4"
        >
          <div class="flex items-start gap-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UIcon
                :name="feature.icon"
                class="size-5"
              />
            </span>
            <div>
              <h2 class="font-semibold text-highlighted">
                {{ feature.title }}
              </h2>
              <p class="mt-1 text-sm leading-6 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReservationsForm />
    </UPageSection>
  </UPage>
</template>
