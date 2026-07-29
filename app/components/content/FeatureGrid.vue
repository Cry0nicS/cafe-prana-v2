<script setup lang="ts">
defineProps<{
  icon?: string
  headline?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <UPageSection
    :icon="icon"
    :headline="headline"
    :title="title"
    :description="description"
  >
    <UPageGrid class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <slot />
    </UPageGrid>
  </UPageSection>
</template>
