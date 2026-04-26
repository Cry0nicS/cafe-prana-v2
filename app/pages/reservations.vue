<script setup lang="ts">
useSeoMeta({
  title: 'Reservations',
  description: 'Café Prana reservations will be migrated next.'
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Reservations"
      description="The booking form and reservation backend are intentionally left for a dedicated migration step."
      :links="[{
        label: 'Email Café Prana',
        to: 'mailto:info@cafeprana.de',
        icon: 'i-lucide-mail',
        color: 'primary'
      }, {
        label: 'Back home',
        to: '/',
        icon: 'i-lucide-arrow-left',
        color: 'neutral',
        variant: 'outline'
      }]"
    />
  </UPage>
</template>
