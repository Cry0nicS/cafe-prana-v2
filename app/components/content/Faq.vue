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
    orientation="horizontal"
  >
    <div class="divide-y divide-default rounded-lg border border-default bg-elevated/40">
      <slot />
    </div>
  </UPageSection>
</template>
