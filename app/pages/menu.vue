<script setup lang="ts">
useSeoMeta({
  title: 'Menu',
  description: 'The Café Prana menu will be migrated next.'
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Menu"
      description="The full menu is being prepared for Nuxt Studio editing. For now, the homepage includes the current menu highlights."
      :links="[{
        label: 'Back to menu highlights',
        to: '/#menu',
        icon: 'i-lucide-arrow-left',
        color: 'primary'
      }]"
    />
  </UPage>
</template>
