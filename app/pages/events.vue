<script setup lang="ts">
useSeoMeta({
  title: 'Events',
  description: 'Café Prana events will be migrated next.'
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Events"
      description="The events calendar and event detail pages are intentionally left for the next migration step."
      :links="[{
        label: 'Back home',
        to: '/',
        icon: 'i-lucide-arrow-left',
        color: 'primary'
      }]"
    />
  </UPage>
</template>
