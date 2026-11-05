<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="-mx-4 bg-gradient-to-b from-transparent via-elevated/50 to-transparent px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <UPageSection
      :icon="icon"
      :title="title"
      :description="description"
      orientation="horizontal"
    >
      <div class="cafe-surface divide-y divide-default overflow-hidden">
        <slot />
      </div>
    </UPageSection>
  </div>
</template>
