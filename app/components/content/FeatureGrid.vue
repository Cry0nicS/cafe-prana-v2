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
    <UPageColumns>
      <slot />
    </UPageColumns>
  </UPageSection>
</template>
