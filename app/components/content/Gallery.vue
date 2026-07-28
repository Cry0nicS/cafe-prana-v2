<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <UPageSection
    :icon="icon"
    :title="title"
    :description="description"
  >
    <div class="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      <slot />
    </div>
  </UPageSection>
</template>
